'use client';

import { useState, useMemo } from 'react';
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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { validateInvitation, linkClientUser } from '@/actions/invitation-actions';

export default function ClientRegisterPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const router = useRouter();
    const { auth } = useFirebase();

    const [invitationCode, setInvitationCode] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidatingCode, setIsValidatingCode] = useState(false);

    const passwordValidation = useMemo(() => {
        return {
            minLength: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            match: password && password === confirmPassword,
        };
    }, [password, confirmPassword]);

    const handleBlurCode = async () => {
        if (invitationCode.length < 8) return;
        setIsValidatingCode(true);
        const res = await validateInvitation(invitationCode);
        setIsValidatingCode(false);

        if (res.success && res.data) {
            setEmail(res.data.email);
            toast({
                title: "Código Válido",
                description: `Invitación para ${res.data.email}`,
                variant: "success"
            });
        } else {
            toast({
                title: "Código Inválido",
                description: res.error || "No se pudo verificar el código.",
                variant: "destructive"
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!auth) {
            toast({ variant: 'destructive', title: 'Error', description: 'Sistema no inicializado.' });
            return;
        }

        if (!Object.values(passwordValidation).every(Boolean)) {
            toast({ variant: 'destructive', title: 'Error', description: 'La contraseña no cumple los requisitos.' });
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Validate Code again
            const validateRes = await validateInvitation(invitationCode);
            if (!validateRes.success) {
                throw new Error(validateRes.error || "Código inválido");
            }

            // 2. Create User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 3. Link User
            const linkRes = await linkClientUser(user.uid, invitationCode);
            if (!linkRes.success) {
                throw new Error(linkRes.error || "Error al vincular cuenta");
            }

            toast({
                variant: 'success',
                title: '¡Registro Exitoso!',
                description: 'Tu cuenta ha sido creada y vinculada.',
            });

            router.push('/clients/dashboard');

        } catch (error: any) {
            console.error("Client Registration Error:", error);
            toast({
                variant: 'destructive',
                title: 'Error de Registro',
                description: error.message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSubmitDisabled = !Object.values(passwordValidation).every(Boolean) || isSubmitting || !invitationCode;

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-lg border-primary/20 shadow-lg">
                <CardHeader className="text-center">
                    <Image src="https://i.ibb.co/yFR9LGPD/dinax.png" alt="Dinax Logo" width={60} height={60} className="mx-auto rounded-sm" />
                    <CardTitle className="font-headline text-2xl">Registro de Cliente</CardTitle>
                    <CardDescription>
                        Ingresa tu código de invitación para acceder a tu plan.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="code">Código de Invitación</Label>
                            <div className="relative">
                                <Input
                                    id="code"
                                    value={invitationCode}
                                    onChange={(e) => setInvitationCode(e.target.value)}
                                    onBlur={handleBlurCode}
                                    placeholder="xxxx-yyyy"
                                    className="font-mono uppercase"
                                    required
                                />
                                {isValidatingCode && (
                                    <div className="absolute right-2 top-2">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t.register.email}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                readOnly // Email comes from invitation usually, but can be editable if we match logic
                                className={email ? "bg-muted" : ""}
                                required
                            />
                        </div>

                        <div className="relative space-y-2">
                            <Label htmlFor="password">{t.register.password}</Label>
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
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </Button>
                            </div>
                        </div>

                        <div className="relative space-y-2">
                            <Label htmlFor="confirmPassword">{t.register.confirmPassword}</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
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
                            <p className={passwordValidation.minLength ? 'text-green-500' : 'text-destructive'}>{t.register.passLength}</p>
                            <p className={passwordValidation.uppercase ? 'text-green-500' : 'text-destructive'}>{t.register.passUppercase}</p>
                            <p className={passwordValidation.specialChar ? 'text-green-500' : 'text-destructive'}>{t.register.passSpecialChar}</p>
                            <p className={passwordValidation.match ? 'text-green-500' : 'text-destructive'}>{t.register.passMatch}</p>
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrarme
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Button variant="link" className="w-full" asChild>
                        <Link href="/login">
                            Ya tengo cuenta
                        </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/">
                            {t.login.cancelButton}
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
