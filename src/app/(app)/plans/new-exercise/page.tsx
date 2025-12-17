'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/language-context';
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Link as LinkIcon,
  Info,
  Edit,
  Accessibility,
  Video,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const exerciseSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  equipment: z.string().min(1, 'El equipamiento es obligatorio.'),
  difficulty: z.string().optional(),
  instructions: z.string().optional(),
  muscleGroups: z.array(z.string()).optional(),
  videoUrl: z.string().url('URL de video inválida').optional().or(z.literal('')),
});

type ExerciseFormData = z.infer<typeof exerciseSchema>;

const muscleGroupsList = [
    'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Bíceps', 'Tríceps', 'Abdominales', 'Glúteos', 'Isquiotibiales', 'Cuádriceps'
];

export default function NewExercisePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      muscleGroups: ['Pecho'], // Example default
    },
  });

  const selectedMuscles = watch('muscleGroups') || [];
  const videoUrl = watch('videoUrl');

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

  const onSubmit = (data: ExerciseFormData) => {
    console.log(data);
    // Here you would typically save the data to your database
    router.push('/plans');
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
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
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
                <Input id="name" {...register('name')} placeholder="Ej: Press de Banca Plano" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-dashed flex flex-col sm:flex-row gap-4 items-center">
                <div className="size-16 flex-shrink-0 rounded-lg bg-background border flex items-center justify-center">
                  <ImageIcon className="text-muted-foreground h-8 w-8" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-sm font-semibold">{t.plans.schematicImage}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{t.plans.schematicImageDesc}</p>
                </div>
                <Button type="button" variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  {t.plans.createWithAI}
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
                          <SelectItem value="dumbbells">Mancuernas</SelectItem>
                          <SelectItem value="barbell">Barra Olímpica</SelectItem>
                          <SelectItem value="cable">Polea</SelectItem>
                          <SelectItem value="bodyweight">Peso Corporal</SelectItem>
                          <SelectItem value="kettlebell">Kettlebell</SelectItem>
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
                          <SelectItem value="beginner">Principiante</SelectItem>
                          <SelectItem value="intermediate">Intermedio</SelectItem>
                          <SelectItem value="advanced">Avanzado</SelectItem>
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
