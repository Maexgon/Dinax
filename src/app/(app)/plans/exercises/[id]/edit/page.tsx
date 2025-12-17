'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useFirebase, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


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
  Loader2,
  Trash2,
  Upload,
  Crop,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ExerciseWithId } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const exerciseSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  type: z.string().optional(),
  equipment: z.string().min(1, 'El equipamiento es obligatorio.'),
  difficulty: z.string().optional(),
  instructions: z.string().optional(),
  muscleGroups: z.array(z.string()).optional(),
  videoUrl: z.string().url('URL de video inválida').optional().or(z.literal('')),
  imageUrl: z.string().optional(),
});

type ExerciseFormData = z.infer<typeof exerciseSchema>;

function getCroppedImg(image: HTMLImageElement, crop: CropType): Promise<string> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return Promise.reject(new Error('Failed to get canvas context'));
    }

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
    );

    return new Promise((resolve) => {
        resolve(canvas.toDataURL('image/jpeg'));
    });
}

export default function EditExercisePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<CropType>();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const exerciseId = params.id as string;
  const tenantId = user?.uid;

  const exerciseDocRef = useMemoFirebase(
    () => (firestore && tenantId && exerciseId ? doc(firestore, `tenants/${tenantId}/exercises`, exerciseId) : null),
    [firestore, tenantId, exerciseId]
  );
  
  const { data: exerciseData, isLoading: isExerciseLoading } = useDoc<ExerciseWithId>(exerciseDocRef);


  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      muscleGroups: [],
    },
  });

  useEffect(() => {
    if (exerciseData) {
      reset(exerciseData);
    }
  }, [exerciseData, reset]);

  const selectedMuscles = watch('muscleGroups') || [];
  const videoUrl = watch('videoUrl');
  const imageUrl = watch('imageUrl');

  const muscleGroupsList = t.plans.muscleGroupsList;
  const equipmentList = t.plans.equipmentList;
  const difficultyList = t.plans.difficultyList;
  const exerciseTypeList = t.plans.exerciseTypeList;


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

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setCrop(undefined);
        const reader = new FileReader();
        reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
        reader.readAsDataURL(e.target.files[0]);
        setIsCropModalOpen(true);
    }
  };

  const handleCropConfirm = async () => {
    if (completedCrop && imgRef.current) {
        try {
            const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop);
            setValue('imageUrl', croppedImageUrl, { shouldDirty: true });
            setIsCropModalOpen(false);
        } catch (e) {
            console.error(e);
            toast({
                variant: 'destructive',
                title: 'Error al recortar',
                description: 'No se pudo procesar la imagen.',
            });
        }
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
      const { width, height } = e.currentTarget;
      const crop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height);
      setCrop(crop);
  }

  const onSubmit = async (data: ExerciseFormData) => {
    if (!exerciseDocRef) return;
    
    try {
        await updateDocumentNonBlocking(exerciseDocRef, data);
        toast({ variant: 'success', title: 'Ejercicio Actualizado', description: `El ejercicio ${data.name} ha sido guardado.` });
        router.push('/plans');

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error al actualizar', description: error.message || 'Ocurrió un error inesperado.' });
    }
  };
  
  if (isExerciseLoading) {
    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-9 w-64" />
                  <Skeleton className="h-5 w-96 mt-2" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 w-36" />
                </div>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 flex flex-col gap-8">
                  <Skeleton className="h-[500px] w-full" />
                  <Skeleton className="h-[200px] w-full" />
              </div>
              <div className="lg:w-96 flex flex-col gap-8">
                  <Skeleton className="h-[400px] w-full" />
              </div>
            </div>
        </div>
    )
  }

  return (
    <>
    <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Recortar Imagen</DialogTitle></DialogHeader>
            {imgSrc && (
                <div className="flex justify-center">
                    <ReactCrop crop={crop} onChange={(_, pc) => setCrop(pc)} onComplete={(c) => setCompletedCrop(c)} aspect={1} minWidth={100} minHeight={100}>
                        <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '70vh' }}/>
                    </ReactCrop>
                </div>
            )}
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsCropModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleCropConfirm} disabled={!completedCrop}><Crop className="mr-2 h-4 w-4" />Confirmar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <a onClick={() => router.push('/plans')} className="hover:text-primary transition-colors cursor-pointer">{t.plans.title}</a>
            <span>/</span>
            <span>{exerciseData?.name || 'Editar Ejercicio'}</span>
          </div>
          <h1 className="text-3xl font-bold font-headline">{'Editar Ejercicio'}</h1>
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
                  {imageUrl ? (
                    <Image src={imageUrl} alt="Vista previa del ejercicio" width={96} height={96} className="object-cover" />
                  ) : (
                    <ImageIcon className="text-muted-foreground h-10 w-10" />
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-sm font-semibold">Imagen del Ejercicio</h4>
                  <p className="text-xs text-muted-foreground mt-1">Sube una imagen para representar este ejercicio.</p>
                </div>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                   <Upload className="mr-2 h-4 w-4" />
                   Subir Imagen
                </Button>
                <Input type="file" ref={fileInputRef} onChange={onSelectFile} className="hidden" accept="image/png, image/jpeg, image/gif"/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                  <Label htmlFor="type">{t.plans.exerciseType}</Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="type">
                          <SelectValue placeholder={t.plans.selectOption} />
                        </SelectTrigger>
                        <SelectContent>
                          {exerciseTypeList.map(item => (
                            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipment">{t.plans.equipment} <span className="text-primary">*</span></Label>
                  <Controller
                    name="equipment"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
    </>
  );
}
