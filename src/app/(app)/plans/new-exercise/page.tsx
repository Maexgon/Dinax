'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/language-context';
import { getAIExerciseImage } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';


import {
  Save,
  Image as ImageIcon,
  Link as LinkIcon,
  Info,
  Edit,
  Accessibility,
  Video,
  Plus,
  X,
  Bot,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const exerciseSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  equipment: z.string().min(1, 'El equipamiento es obligatorio.'),
  difficulty: z.string().optional(),
  instructions: z.string().optional(),
  muscleGroups: z.array(z.string()).optional(),
  videoUrl: z.string().url('URL de video inválida').optional().or(z.literal('')),
  imageUrl: z.string().optional(),
});

type ExerciseFormData = z.infer<typeof exerciseSchema>;

export default function NewExercisePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      muscleGroups: [],
    },
  });

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const selectedMuscles = watch('muscleGroups') || [];
  const videoUrl = watch('videoUrl');
  const imageUrl = watch('imageUrl');

  const muscleGroupsList = t.plans.muscleGroupsList;
  const equipmentList = t.plans.equipmentList;
  const difficultyList = t.plans.difficultyList;

  const toggleMuscleGroup = (muscle: string) => {
    const currentMuscles = watch('muscleGroups') || [];
    const newMuscles = currentMuscles.includes(muscle)
      ? currentMuscles.filter((m) => m !== muscle)
      : [...currentMuscles, muscle];
    setValue('muscleGroups', newMuscles, { shouldDirty: true });
  };
  
  const getYouTubeEmbedUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    let videoId;
    if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('watch?v=')[1].split('&')[0];
    } else {
        return null;
    }
    return `https://www.youtube.com/embed/${videoId}`;
  }

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  const handleGenerateImage = async () => {
    const { name, instructions } = getValues();
    if (!name) {
      toast({
        variant: 'destructive',
        title: t.plans.error,
        description: t.plans.nameRequiredForImage,
      });
      return;
    }

    setIsGeneratingImage(true);
    const result = await getAIExerciseImage({ name, instructions: instructions || '' });
    setIsGeneratingImage(false);

    if (result.success && result.data?.imageUrl) {
      setValue('imageUrl', result.data.imageUrl, { shouldDirty: true });
      toast({
        variant: 'success',
        title: t.plans.imageGeneratedSuccess,
      });
    } else {
      toast({
        variant: 'destructive',
        title: t.plans.error,
        description: result.error || 'Unknown error generating image.',
      });
    }
  };


  const onSubmit = async (data: ExerciseFormData) => {
    if (!firestore || !user?.uid) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo conectar a la base de datos. Asegúrate de haber iniciado sesión.' });
        return;
    }

    try {
        const tenantId = user.uid;
        const newExerciseRef = doc(collection(firestore, `tenants/${tenantId}/exercises`));
        
        const newExerciseData = {
            ...data,
            id: newExerciseRef.id,
        };

        await addDocumentNonBlocking(newExerciseRef, newExerciseData);

        toast({ variant: 'success', title: 'Ejercicio Creado', description: `El ejercicio ${data.name} ha sido añadido a tu biblioteca.` });
        router.push('/plans');

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error al crear ejercicio', description: error.message || 'Ocurrió un error inesperado.' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <a onClick={() => router.push('/plans')} className="hover:text-primary transition-colors cursor-pointer">{t.plans.title}</a>
            <span>/</span>
            <span>{t.plans.addNewExercise}</span>
          </div>
          <h1 className="text-3xl font-bold font-headline">{t.plans.addNewExercise}</h1>
          <p className="text-muted-foreground mt-1">{t.plans.newExerciseDescription}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t.clientDetail.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.plans.saveExercise}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Edit className="h-5 w-5" />
                </div>
                <CardTitle>{t.plans.basicDetails}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t.plans.exerciseName} <span className="text-primary">*</span></Label>
                <Input id="name" {...register('name')} placeholder={t.plans.exerciseNamePlaceholder} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-dashed flex flex-col sm:flex-row gap-4 items-center">
                <div className="size-24 flex-shrink-0 rounded-lg bg-background border flex items-center justify-center overflow-hidden">
                  {isGeneratingImage ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : imageUrl ? (
                    <Image src={imageUrl} alt="Generated Exercise Image" width={96} height={96} className="object-cover" />
                  ) : (
                    <ImageIcon className="text-muted-foreground h-10 w-10" />
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-sm font-semibold">{t.plans.schematicImage}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{t.plans.schematicImageDesc}</p>
                </div>
                <Button type="button" onClick={handleGenerateImage} disabled={isGeneratingImage} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                   {isGeneratingImage ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   ) : (
                      <Bot className="mr-2 h-4 w-4" />
                   )}
                  {isGeneratingImage ? t.plans.generating : t.plans.createWithAI}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="equipment">{t.plans.equipment} <span className="text-primary">*</span></Label>
                  <Controller
                    name="equipment"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="equipment">
                          <SelectValue placeholder={t.plans.selectOption} />
                        </SelectTrigger>
                        <SelectContent>
                          {equipmentList.map(item => (
                            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.equipment && <p className="text-xs text-destructive">{errors.equipment.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">{t.plans.difficultyLevel}</Label>
                   <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="difficulty">
                           <SelectValue placeholder={t.plans.selectLevel} />
                        </SelectTrigger>
                        <SelectContent>
                           {difficultyList.map(item => (
                            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">{t.plans.technicalInstructions}</Label>
                <Textarea id="instructions" {...register('instructions')} placeholder={t.plans.instructionsPlaceholder} rows={6} />
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Accessibility className="h-5 w-5" />
                </div>
                <CardTitle>{t.plans.muscleGroups}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {muscleGroupsList.map(muscle => {
                        const isSelected = selectedMuscles.includes(muscle);
                        return (
                             <Button
                                key={muscle}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleMuscleGroup(muscle)}
                                className={`rounded-full transition-all ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
                            >
                                {muscle}
                                {isSelected ? <X className="ml-2 h-4 w-4" /> : <Plus className="ml-2 h-4 w-4" />}
                            </Button>
                        )
                    })}
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Aside column */}
        <div className="lg:w-96 flex flex-col gap-8">
            <Card className="sticky top-6">
                 <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Video className="h-5 w-5" />
                        </div>
                        <CardTitle>{t.plans.videoDemo}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="videoUrl">{t.plans.videoUrl}</Label>
                        <div className="relative flex items-center">
                            <LinkIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
                            <Input id="videoUrl" {...register('videoUrl')} placeholder="https://youtube.com/..." className="pl-9" />
                        </div>
                        {errors.videoUrl && <p className="text-xs text-destructive">{errors.videoUrl.message}</p>}
                    </div>

                    <div className="w-full aspect-video rounded-lg bg-muted/50 border-2 border-dashed flex items-center justify-center text-center overflow-hidden relative">
                       {embedUrl ? (
                           <iframe src={embedUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
                       ) : (
                           <div className="flex flex-col items-center text-muted-foreground">
                                <Video className="h-10 w-10 mb-2" />
                                <p className="text-sm font-medium">{t.plans.videoPreview}</p>
                            </div>
                       )}
                    </div>

                     <div className="p-3 flex gap-3 items-start bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-800 dark:text-blue-300">{t.plans.videoTip}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </form>
  );
}
