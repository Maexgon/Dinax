'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/language-context';
import { useFirebase } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';

export default function RegisterPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const { auth, firestore } = useFirebase();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordValidation = useMemo(() => {
    return {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      match: password && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firebase is not initialized.',
      });
      return;
    }
    
    if (!Object.values(passwordValidation).every(Boolean)) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Password does not meet the requirements.',
        });
        return;
    }

    setIsSubmitting(true);
    
    try {
      // Step 1: Create user in Firebase Auth.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const tenantId = user.uid; // The coach's UID is the tenant ID

      // Step 2: Create tenant and user documents in Firestore atomically.
      const batch = writeBatch(firestore);

      // Document 1: Tenant document at /tenants/{coach-uid}
      const tenantRef = doc(firestore, 'tenants', tenantId);
      const tenantData = {
          id: tenantId,
          name: `${firstName}'s Gym`,
          members: { [tenantId]: 'owner' },
          createdAt: serverTimestamp(),
      };
      batch.set(tenantRef, tenantData);

      // Document 2: User profile document for the coach at /tenants/{coach-uid}/users/{coach-uid}
      const userRef = doc(firestore, `tenants/${tenantId}/users`, user.uid);
      const userData = {
          id: user.uid,
          tenantId: tenantId,
          firstName: firstName,
          lastName: lastName,
          email: email,
          joinDate: new Date().toISOString().split('T')[0],
          progress: 0,
          createdAt: serverTimestamp(),
          // Initialize other fields from profile page
          secondaryEmail: '',
          cuit: '',
          phoneNumber: '',
          linkedinUrl: '',
          instagramUrl: '',
          xUrl: '',
          whatsapp: '',
          address: '',
          careerExperience: [],
          education: [],
      };
      batch.set(userRef, userData);

      // Commit the atomic batch
      await batch.commit();

      toast({
        variant: 'success',
        title: t.register.successTitle,
        description: 'Redirecting to your new dashboard...',
      });

      // Step 3: Redirect to dashboard.
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Error during user registration and data setup:", error);
      toast({
        variant: 'destructive',
        title: t.register.error,
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = !Object.values(passwordValidation).every(Boolean) || isSubmitting;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg border-primary/20 shadow-lg">
        <CardHeader className="text-center">
           <Image src="https://i.ibb.co/yFR9LGPD/dinax.png" alt="Dinax Logo" width={60} height={60} className="mx-auto rounded-sm" data-ai-hint="logo" />
          <CardTitle className="font-headline text-2xl">{t.register.title}</CardTitle>
          <CardDescription>
            {t.register.description}{' '}
            <Link href="/login" className="text-primary hover:underline">
              {t.register.loginNow}
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t.register.firstName}</Label>
                <Input id="firstName" name="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t.register.lastName}</Label>
                <Input id="lastName" name="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.register.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="entrenador@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative space-y-2">
              <Label htmlFor="password">{t.register.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <div className="relative space-y-2">
              <Label htmlFor="confirmPassword">{t.register.confirmPassword}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                   value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            <div className="space-y-1 text-xs">
                <p className={passwordValidation.minLength ? 'text-green-500' : 'text-destructive'}>
                    {t.register.passLength}
                </p>
                <p className={passwordValidation.uppercase ? 'text-green-500' : 'text-destructive'}>
                    {t.register.passUppercase}
                </p>
                <p className={passwordValidation.specialChar ? 'text-green-500' : 'text-destructive'}>
                    {t.register.passSpecialChar}
                </p>
                <p className={passwordValidation.match ? 'text-green-500' : 'text-destructive'}>
                    {t.register.passMatch}
                </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.register.registerButton}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex flex-col">
          <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
            {t.login.cancelButton}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
