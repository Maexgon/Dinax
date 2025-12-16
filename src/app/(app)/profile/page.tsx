'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Loader2, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio.'),
  lastName: z.string().min(1, 'El apellido es obligatorio.'),
  email: z.string().email('Email inválido.'),
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
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (userData) {
      reset({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
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
            <div className="space-y-2">
              <Label htmlFor="email">{t.register.email}</Label>
              <Input id="email" type="email" {...register('email')} disabled />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              <p className="text-xs text-muted-foreground">El email no se puede cambiar.</p>
            </div>
             <div className="flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => reset()} disabled={!isDirty || isSubmitting}>
                  {t.studentDetail.cancel}
                </Button>
                <Button type="submit" disabled={!isDirty || isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t.studentDetail.saveChanges}
                </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
