
'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import React, { useState, useRef, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/language-context';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Upload, Crop } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Helper function from profile page
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


const clientSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio.'),
  lastName: z.string().min(1, 'El apellido es obligatorio.'),
  email: z.string().email('Email inválido.'),
  phoneNumber: z.string().optional(),
  birthDate: z.string().optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
  objective: z.string().optional(),
  avatarUrl: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function NewClientPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<CropType>();
  const [imgSrc, setImgSrc] = useState('');
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);

  useEffect(() => {
    if (isCameraModalOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Acceso a la cámara denegado',
            description: 'Por favor, habilita los permisos de cámara en tu navegador.',
          });
          setIsCameraModalOpen(false);
        }
      };
      getCameraPermission();
    } else {
        // Stop camera stream when modal is closed
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [isCameraModalOpen, toast]);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setCrop(undefined);
        const reader = new FileReader();
        reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
        reader.readAsDataURL(e.target.files[0]);
        setIsCropModalOpen(true);
    }
  };

  const handleTakePhoto = () => {
    if (videoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImgSrc(dataUrl);
        setIsCameraModalOpen(false);
        setIsCropModalOpen(true);
    }
  }
  
  const handleCropConfirm = async () => {
    if (completedCrop && imgRef.current) {
        try {
            const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop);
            setAvatarPreview(croppedImageUrl);
            setValue('avatarUrl', croppedImageUrl, { shouldDirty: true });
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

  const tenantId = user?.uid;

  const onSubmit = async (data: ClientFormData) => {
    if (!firestore || !tenantId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo conectar a la base de datos. Asegúrate de haber iniciado sesión.',
      });
      return;
    }

    try {
      const newClientRef = doc(collection(firestore, `tenants/${tenantId}/user_profile`));
      
      const newClientData = {
        ...data,
        id: newClientRef.id,
        name: `${data.firstName} ${data.lastName}`,
        tenantId,
        joinDate: new Date().toISOString().split('T')[0],
        progress: 0,
        createdAt: serverTimestamp(),
      };

      await addDocumentNonBlocking(newClientRef, newClientData);

      toast({
        variant: 'success',
        title: 'Cliente Creado',
        description: `El cliente ${data.firstName} ${data.lastName} ha sido añadido.`,
      });

      router.push('/clients');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al crear cliente',
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  const clientInitials = (
    (watch('firstName')?.[0] || '') + (watch('lastName')?.[0] || '')
  ).toUpperCase();

  return (
    <>
      {/* Cropping Modal */}
      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Recortar Imagen</DialogTitle></DialogHeader>
            {imgSrc && (
                <div className="flex justify-center">
                    <ReactCrop crop={crop} onChange={(_, pc) => setCrop(pc)} onComplete={(c) => setCompletedCrop(c)} aspect={1} circularCrop>
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
      
      {/* Camera Modal */}
      <Dialog open={isCameraModalOpen} onOpenChange={setIsCameraModalOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Tomar Foto</DialogTitle></DialogHeader>
            <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline></video>
            <DialogFooter>
                 <Button variant="ghost" onClick={() => setIsCameraModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleTakePhoto} disabled={!hasCameraPermission}><Camera className="mr-2 h-4 w-4"/>Capturar Foto</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t.clients.addNewClient}</CardTitle>
          <CardDescription>Completa los datos del nuevo cliente.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || ''} alt="Avatar del cliente" />
                    <AvatarFallback className="text-3xl">{clientInitials || 'CL'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left space-y-2">
                    <h4 className="text-lg font-semibold">Foto de Perfil</h4>
                    <div className="flex gap-2 justify-center sm:justify-start">
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" /> Subir Foto
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setIsCameraModalOpen(true)}>
                            <Camera className="mr-2 h-4 w-4" /> Tomar Foto
                        </Button>
                    </div>
                    <Input type="file" ref={fileInputRef} onChange={onSelectFile} className="hidden" accept="image/png, image/jpeg, image/gif"/>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t.register.firstName}</Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t.register.lastName}</Label>
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.register.email}</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t.register.phone}</Label>
              <Input id="phoneNumber" type="tel" {...register('phoneNumber')} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="birthDate">{t.clientDetail.birthDate}</Label>
                    <Input id="birthDate" type="date" {...register('birthDate')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="occupation">{t.clientDetail.occupation}</Label>
                    <Input id="occupation" {...register('occupation')} />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="address">{t.clientDetail.address}</Label>
                <Input id="address" {...register('address')} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="objective">{t.clientDetail.objective}</Label>
                <Textarea id="objective" {...register('objective')} placeholder="Ej: Ganar masa muscular, perder peso..."/>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => router.push('/clients')}>
              {t.clientDetail.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Añadir Cliente
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
    </>
  );
}
