
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { signUpWithEmailAndPassword } from '@/app/auth/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/language-context';
import { useActionState } from 'react';
import { useFirebase } from '@/firebase';
import { signInWithEmailAndPassword, type User } from 'firebase/auth';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';


const initialState = {
  message: '',
  success: false,
  uid: null,
  email: null,
  password: null,
  firstName: null,
  lastName: null,
};

export default function RegisterPage() {
  const { t } = useLanguage();
  const [state, formAction, isPending] = useActionState(signUpWithEmailAndPassword, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const { auth, firestore } = useFirebase();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreatingDocs, setIsCreatingDocs] = useState(false);

  // Human validation state
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [humanAnswer, setHumanAnswer] = useState('');
  const [isHuman, setIsHuman] = useState(false);

  useEffect(() => {
    // Generate new numbers for the human check only on component mount
    setNum1(Math.floor(Math.random() * 9) + 1);
    setNum2(Math.floor(Math.random() * 9) + 1);
  }, []);

  const handleHumanValidation = () => {
    const correctAnswer = num1 * num2;
    if (parseInt(humanAnswer, 10) === correctAnswer) {
      setIsHuman(true);
      toast({ variant: 'success', title: t.register.human, description: t.register.humanSuccess });
    } else {
      setIsHuman(false);
      toast({ variant: 'destructive', title: t.register.error, description: t.register.humanError });
      setNum1(Math.floor(Math.random() * 9) + 1);
      setNum2(Math.floor(Math.random() * 9) + 1);
      setHumanAnswer('');
    }
  };
  
  const passwordValidation = useMemo(() => {
    return {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      match: password && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  useEffect(() => {
    if (!isPending && state.message) {
      if (state.success) {
        // The logic is now handled in finalizeRegistration, triggered by state.uid
      } else {
        toast({
          variant: 'destructive',
          title: t.register.error,
          description: state.message,
        });
      }
    }

    if (state.success && state.uid && state.email && state.password) {
      const finalizeRegistration = async () => {
        if (!firestore || !auth) return;

        setIsCreatingDocs(true);
        try {
          // Step 1: Sign in the new user on the client to get a valid token.
          const userCredential = await signInWithEmailAndPassword(auth, state.email!, state.password!);
          const user = userCredential.user;
          const tenantId = user.uid;

          // Step 2: Create the tenant and user documents in an atomic batch write.
          const batch = writeBatch(firestore);

          // Create the tenant document
          const tenantRef = doc(firestore, 'tenants', tenantId);
          batch.set(tenantRef, {
            id: tenantId,
            name: `${state.firstName}'s Gym`,
            members: { [tenantId]: 'owner' },
            createdAt: serverTimestamp(),
          });

          // CORRECTED LOGIC: Create the coach's own user document within their new tenant's 'users' subcollection.
          const userRef = doc(firestore, `tenants/${tenantId}/users`, tenantId);
          batch.set(userRef, {
            id: tenantId,
            tenantId: tenantId,
            firstName: state.firstName,
            lastName: state.lastName,
            email: state.email,
            joinDate: new Date().toISOString().split('T')[0],
            progress: 0,
            createdAt: serverTimestamp(),
          });

          await batch.commit();

          toast({
            variant: 'success',
            title: t.register.successTitle,
            description: 'Setup complete. Redirecting to your dashboard...',
          });

          router.push('/dashboard');

        } catch (error: any) {
          console.error("Error finalizing registration:", error);
          toast({
            variant: 'destructive',
            title: 'Error during setup',
            description: error.message || 'Could not create user profile.',
          });
        } finally {
          setIsCreatingDocs(false);
        }
      };

      finalizeRegistration();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, auth, firestore]);

  const isSubmitDisabled = !Object.values(passwordValidation).every(Boolean) || !isHuman || isPending || isCreatingDocs;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg border border-primary shadow-lg shadow-primary/30">
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
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t.register.firstName}</Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t.register.lastName}</Label>
                <Input id="lastName" name="lastName" required />
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
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone">{t.register.phone}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
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

            <div className="space-y-2 text-xs">
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
            
            {!isHuman && (
              <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
                <Label>{t.register.humanValidation}</Label>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-lg">{`${num1} * ${num2} = ?`}</span>
                  <Input 
                    type="number" 
                    className="w-24" 
                    value={humanAnswer}
                    onChange={e => setHumanAnswer(e.target.value)}
                  />
                  <Button type="button" onClick={handleHumanValidation}>{t.register.verify}</Button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
              {(isPending || isCreatingDocs) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreatingDocs ? 'Finalizando...' : t.register.registerButton}
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
