'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirebase, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, User, Trash2, PlusCircle, Briefcase, GraduationCap, Building, Link2, CaseSensitive } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const experienceSchema = z.object({
  title: z.string().min(1, "El cargo es obligatorio"),
  company: z.string().min(1, "La empresa es obligatoria"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1, "La institución es obligatoria"),
  degree: z.string().min(1, "El título es obligatorio"),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const profileSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio.'),
  lastName: z.string().min(1, 'El apellido es obligatorio.'),
  email: z.string().email('Email inválido.'),
  cuit: z.string().optional(),
  phoneNumber: z.string().optional(),
  linkedinUrl: z.string().url('URL de LinkedIn inválida').optional().or(z.literal('')),
  instagramUrl: z.string().url('URL de Instagram inválida').optional().or(z.literal('')),
  xUrl: z.string().url('URL de X inválida').optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  careerExperience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { t } = useLanguage();
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, `tenants/${user.uid}/users`, user.uid) : null),
    [firestore, user]
  );

  const { data: userData, isLoading: isUserLoading } = useDoc<any>(userDocRef);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        careerExperience: [],
        education: []
    }
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: "careerExperience",
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: "education",
  });


  useEffect(() => {
    if (userData) {
      reset({
        ...userData,
        cuit: userData.cuit || '',
        phoneNumber: userData.phoneNumber || '',
        linkedinUrl: userData.linkedinUrl || '',
        instagramUrl: userData.instagramUrl || '',
        xUrl: userData.xUrl || '',
        whatsapp: userData.whatsapp || '',
        address: userData.address || '',
        careerExperience: userData.careerExperience || [],
        education: userData.education || [],
      });
    }
  }, [userData, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!userDocRef) return;

    try {
      updateDocumentNonBlocking(userDocRef, data);
      toast({
        variant: 'success',
        title: 'Perfil Actualizado',
        description: 'Tus datos han sido guardados correctamente.',
      });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error al actualizar',
            description: error.message || 'No se pudo guardar el perfil.',
        });
    }
  };
  
  if (isUserLoading) {
      return (
          <div className="max-w-4xl mx-auto">
              <Skeleton className="h-8 w-1/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-6" />
              <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="flex justify-end">
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
              </Card>
          </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto">
       <div>
            <h1 className="text-3xl font-bold font-headline">Configuración de Perfil</h1>
            <p className="text-muted-foreground">Administra tu información personal y de la cuenta.</p>
        </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="text-primary"/> Datos Personales</CardTitle>
            <CardDescription>Esta información se mostrará públicamente en tu perfil.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cuit">CUIT</Label>
                    <Input id="cuit" {...register('cuit')} />
                    {errors.cuit && <p className="text-xs text-destructive">{errors.cuit.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Teléfono</Label>
                    <Input id="phoneNumber" {...register('phoneNumber')} />
                    {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>}
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" {...register('address')} />
                {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.register.email}</Label>
              <Input id="email" type="email" {...register('email')} disabled />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              <p className="text-xs text-muted-foreground">El email no se puede cambiar.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Link2 className="text-primary"/> Redes Sociales</CardTitle>
                <CardDescription>Añade tus perfiles profesionales.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn</Label>
                    <Input id="linkedinUrl" {...register('linkedinUrl')} placeholder="https://linkedin.com/in/tu-perfil"/>
                    {errors.linkedinUrl && <p className="text-xs text-destructive">{errors.linkedinUrl.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="instagramUrl">Instagram</Label>
                    <Input id="instagramUrl" {...register('instagramUrl')} placeholder="https://instagram.com/tu-usuario"/>
                    {errors.instagramUrl && <p className="text-xs text-destructive">{errors.instagramUrl.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="xUrl">X (Twitter)</Label>
                    <Input id="xUrl" {...register('xUrl')} placeholder="https://x.com/tu-usuario"/>
                    {errors.xUrl && <p className="text-xs text-destructive">{errors.xUrl.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="whatsapp" {...register('whatsapp')} placeholder="Ej: +54911..."/>
                    {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp.message}</p>}
                </div>
            </CardContent>
        </Card>

        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase className="text-primary"/> Experiencia Laboral</CardTitle>
                <CardDescription>Detalla tu trayectoria profesional.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {experienceFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeExperience(index)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                        <div className="space-y-2">
                            <Label htmlFor={`careerExperience.${index}.title`}>Cargo</Label>
                            <Input {...register(`careerExperience.${index}.title`)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`careerExperience.${index}.company`}>Empresa</Label>
                            <Input {...register(`careerExperience.${index}.company`)} />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`careerExperience.${index}.startDate`}>Fecha de Inicio</Label>
                                <Input type="date" {...register(`careerExperience.${index}.startDate`)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`careerExperience.${index}.endDate`}>Fecha de Fin</Label>
                                <Input type="date" {...register(`careerExperience.${index}.endDate`)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`careerExperience.${index}.description`}>Descripción</Label>
                            <Textarea {...register(`careerExperience.${index}.description`)} />
                        </div>
                    </div>
                ))}
                 <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => appendExperience({ title: '', company: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir Experiencia
                </Button>
            </CardContent>
        </Card>

        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><GraduationCap className="text-primary"/> Educación</CardTitle>
                <CardDescription>Añade tus títulos y certificaciones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {educationFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeEducation(index)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                        <div className="space-y-2">
                            <Label htmlFor={`education.${index}.institution`}>Institución</Label>
                            <Input {...register(`education.${index}.institution`)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`education.${index}.degree`}>Título</Label>
                            <Input {...register(`education.${index}.degree`)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`education.${index}.fieldOfStudy`}>Campo de Estudio</Label>
                            <Input {...register(`education.${index}.fieldOfStudy`)} />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`education.${index}.startDate`}>Fecha de Inicio</Label>
                                <Input type="date" {...register(`education.${index}.startDate`)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`education.${index}.endDate`}>Fecha de Fin</Label>
                                <Input type="date" {...register(`education.${index}.endDate`)} />
                            </div>
                        </div>
                    </div>
                ))}
                 <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => appendEducation({ institution: '', degree: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir Educación
                </Button>
            </CardContent>
        </Card>

        <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" type="button" onClick={() => reset()} disabled={!isDirty || isSubmitting}>
              {t.studentDetail.cancel}
            </Button>
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.studentDetail.saveChanges}
            </Button>
        </div>
      </form>
    </div>
  );
}
