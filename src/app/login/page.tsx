'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
import { useLanguage } from '@/context/language-context';
import { useFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const router = useRouter();
    const { auth, firestore } = useFirebase();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        setIsSubmitting(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Smart Redirect Logic
            // 1. Check if user is a client (has specific profile or claim)
            // For now, let's check if a user_profile doc exists and has a 'role' field, 
            // or check the path structure.

            const userProfileRef = doc(firestore, 'user_profile', user.uid);
            const userProfileSnap = await getDoc(userProfileRef);

            let targetUrl = '/dashboard';

            if (userProfileSnap.exists()) {
                const profileData = userProfileSnap.data();
                console.log("User Profile Found:", profileData); // Debug log

                // If the profile has a 'role' field set to 'client', redirect to client dashboard
                if (profileData.role === 'client') {
                    console.log("Redirecting to Client Dashboard");
                    targetUrl = '/clients/dashboard';
                }
            } else {
                console.log("No User Profile Found for UID:", user.uid);
            }

            toast({
                variant: 'success',
                title: t.login.successTitle,
                description: t.login.successDescription,
            });

            router.push(targetUrl);

        } catch (error: any) {
            console.error("Login error:", error);
            let errorMessage = t.login.error;
            if (error.code === 'auth/invalid-credential') {
                errorMessage = 'Credenciales incorrectas. Por favor verifica tu email y contraseña.';
            }
            toast({
                variant: 'destructive',
                title: 'Error de Inicio de Sesión',
                description: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm border-primary/20 shadow-lg">
                <CardHeader className="text-center">
                    <Image src="https://i.ibb.co/yFR9LGPD/dinax.png" alt="Dinax Logo" width={60} height={60} className="mx-auto rounded-sm" />
                    <CardTitle className="font-headline text-2xl">{t.login.title}</CardTitle>
                    <CardDescription>
                        {t.login.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t.login.email}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t.login.password}</Label>
                            <div className="relative">
                                <Input
                                    id="password"
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
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.login.loginButton}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <div className="text-center text-sm">
                        ¿No tienes cuenta?{' '}
                        <Link href="/register" className="text-primary hover:underline font-medium">
                            Regístrate aquí
                        </Link>
                    </div>
                    <Button variant="link" size="sm" className="px-0 font-normal text-muted-foreground" asChild>
                        <Link href="/forgot-password">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </Button>
                    <div className="w-full flex justify-center mt-2">
                        <Button variant="outline" size="sm" asChild className="w-full">
                            <Link href="/">
                                {t.login.cancelButton}
                            </Link>
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
