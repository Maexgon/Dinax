'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Copy, Check } from 'lucide-react';
import { generateInvitation } from '@/actions/invitation-actions';

interface InvitationModalProps {
    tenantId: string;
    clientId: string;
    clientEmail: string;
}

export function InvitationModal({ tenantId, clientId, clientEmail }: InvitationModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [hasCopied, setHasCopied] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const res = await generateInvitation(tenantId, clientId, clientEmail);
            if (res.success && res.code) {
                setGeneratedCode(res.code);
                toast({
                    title: "Código Generado",
                    description: "El código de invitación está listo para compartirse.",
                    variant: "success",
                });
            } else {
                throw new Error(res.error || "Error al generar.");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (generatedCode) {
            navigator.clipboard.writeText(generatedCode);
            setHasCopied(true);
            toast({ title: "Copiado", description: "Código copiado al portapapeles." });
            setTimeout(() => setHasCopied(false), 2000);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Invitar Usuario
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invitar Cliente</DialogTitle>
                    <DialogDescription>
                        Genera un código temporal para que este cliente pueda registrarse en la aplicación.
                    </DialogDescription>
                </DialogHeader>

                {!generatedCode ? (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                value={clientEmail}
                                readOnly
                                className="col-span-3 bg-muted"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground text-center mt-2">
                            Se generará un código válido por 48 horas.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-6">
                        <div className="text-center space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Código de Invitación</p>
                            <div className="flex items-center gap-2">
                                <code className="relative rounded bg-muted px-[0.5rem] py-[0.3rem] font-mono text-2xl font-bold tracking-widest border border-primary/20">
                                    {generatedCode}
                                </code>
                                <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                                    {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground pt-2">
                                Comparte este código con <strong>{clientEmail}</strong>
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {!generatedCode ? (
                        <Button onClick={handleGenerate} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generar Código
                        </Button>
                    ) : (
                        <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                            Cerrar
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
