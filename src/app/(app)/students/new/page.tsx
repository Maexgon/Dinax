'use client';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/language-context';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { randomUUID } from 'crypto';

const studentSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio.'),
  lastName: z.string().min(1, 'El apellido es obligatorio.'),
  email: z.string().email('Email inválido.'),
  phoneNumber: z.string().optional(),
  birthDate: z.string().optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
  objective: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function NewStudentPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const tenantId = user?.uid;

  const onSubmit = async (data: StudentFormData) => {
    if (!firestore || !tenantId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo conectar a la base de datos. Asegúrate de haber iniciado sesión.',
      });
      return;
    }

    try {
      // Generate a new ID for the student document
      const newStudentRef = doc(collection(firestore, `tenants/${tenantId}/users`));
      
      const newStudentData = {
        ...data,
        id: newStudentRef.id, // Add the generated ID to the data
        tenantId,
        joinDate: new Date().toISOString().split('T')[0],
        progress: 0,
        createdAt: serverTimestamp(),
      };

      // Use setDoc with the new reference
      await addDocumentNonBlocking(newStudentRef, newStudentData);

      toast({
        variant: 'success',
        title: 'Cliente Creado',
        description: `El cliente ${data.firstName} ${data.lastName} ha sido añadido.`,
      });

      router.push('/students');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al crear cliente',
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t.students.addNewStudent}</CardTitle>
          <CardDescription>Completa los datos del nuevo cliente.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
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
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t.register.phone}</Label>
              <Input id="phoneNumber" type="tel" {...register('phoneNumber')} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="birthDate">{t.studentDetail.birthDate}</Label>
                    <Input id="birthDate" type="date" {...register('birthDate')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="occupation">{t.studentDetail.occupation}</Label>
                    <Input id="occupation" {...register('occupation')} />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="address">{t.studentDetail.address}</Label>
                <Input id="address" {...register('address')} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="objective">{t.studentDetail.objective}</Label>
                <Textarea id="objective" {...register('objective')} placeholder="Ej: Ganar masa muscular, perder peso..."/>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => router.push('/students')}>
              {t.studentDetail.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Añadir Cliente
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
