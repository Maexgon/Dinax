'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirebase, useDoc } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { MessageCircle, Copy, CheckCircle, Smartphone } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function TelegramConnect() {
    const { firestore, auth, user, tenantId } = useFirebase();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    // Subscribe to user_profile to dynamically check if they generated a code or are already connected.
    // Both coach and client use user_profile in tenant context
    const profileRef = tenantId && user?.uid ? doc(firestore, `tenants/${tenantId}/user_profile/${user.uid}`) : null;
    const { data: profile, loading } = useDoc<any>(profileRef, {
        dependencies: [tenantId, user?.uid]
    });

    if (loading) return null; // Or a skeleton

    const currentCode = profile?.telegramAuthCode;
    const isConnected = !!profile?.telegramChatId;

    const generateCode = async () => {
        if (!profileRef) return;
        setIsGenerating(true);
        try {
            // Generate a random 6 char alphanumeric code
            const code = 'DINA-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            await updateDoc(profileRef, {
                telegramAuthCode: code
            });
            toast({
                title: "Código generado",
                description: "Ve a Telegram e ingresa el código."
            });
        } catch (error) {
            console.error("Error generating code:", error);
            toast({
                title: "Error",
                description: "No se pudo generar el código.",
                variant: 'destructive'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const disconnectTelegram = async () => {
         if (!profileRef) return;
         try {
             await updateDoc(profileRef, {
                 telegramChatId: null,
                 telegramAuthCode: null
             });
             toast({
                 title: "Desvinculado",
                 description: "Tu cuenta ha sido desvinculada de Telegram."
             });
         } catch(e) {
             toast({
                 title: "Error",
                 description: "No se pudo desvincular.",
                 variant: 'destructive'
             });
         }
    };

    const copyCode = () => {
        if (currentCode) {
            navigator.clipboard.writeText(`/start ${currentCode}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
            toast({
                title: "Copiado",
                description: "Comando copiado al portapapeles."
            });
        }
    };

    return (
        <Card className="mt-6 border-[#0088cc]/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0088cc]/5 rounded-bl-[100px] -z-10" />
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#0088cc]">
                    <MessageCircle className="h-5 w-5" />
                    Asistente Inteligente Dina (Telegram)
                </CardTitle>
                <CardDescription>
                    {isConnected 
                        ? "Has vinculado tu cuenta exitosamente. Dina es tu asistente virtual y coach 24/7." 
                        : "Conecta tu perfil con nuestro bot oficial de Telegram (@DinaxArg_bot) para recibir respuestas IA personalizadas."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isConnected ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 bg-green-50 text-green-700 p-4 rounded-lg">
                            <CheckCircle className="h-5 w-5" />
                            <div>
                                <p className="font-semibold text-sm">Cuenta vinculada correctamente</p>
                                <p className="text-xs opacity-90">Ya puedes hablar con Dina en Telegram sin restricciones.</p>
                            </div>
                        </div>
                    </div>
                ) : currentCode ? (
                    <div className="flex flex-col gap-4">
                        <p className="text-sm">Sigue estos pasos para finalizar la vinculación:</p>
                        <ol className="list-decimal list-inside text-sm space-y-2 opacity-90 ml-1">
                            <li>Busca a <strong>@DinaxArg_bot</strong> en Telegram.</li>
                            <li>Envía el siguiente comando EXACTO en el chat:</li>
                        </ol>
                        <div className="flex gap-2 items-center">
                            <Input value={`/start ${currentCode}`} readOnly className="font-mono bg-muted text-center text-lg h-12" />
                            <Button size="icon" variant="outline" className="h-12 w-12 shrink-0" onClick={copyCode}>
                                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">Una vez enviado, esta pantalla se actualizará automáticamente.</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
                        <div className="bg-[#0088cc]/10 p-4 rounded-full">
                            <Smartphone className="h-8 w-8 text-[#0088cc]" />
                        </div>
                        <p className="text-sm opacity-80 max-w-sm">Genera un código único de seguridad para enlazar tu progreso con la Inteligencia Artificial.</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                 {isConnected ? (
                    <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={disconnectTelegram}>
                        Desvincular Telegram
                    </Button>
                 ) : (
                    !currentCode && (
                        <Button className="w-full sm:w-auto bg-[#0088cc] hover:bg-[#0077b3] text-white" onClick={generateCode} disabled={isGenerating}>
                            {isGenerating ? "Generando..." : "Generar Código de Enlace"}
                        </Button>
                    )
                 )}
                 {currentCode && !isConnected && (
                     <Button variant="ghost" className="text-xs" onClick={() => generateCode()}>Generar nuevo código</Button>
                 )}
            </CardFooter>
        </Card>
    );
}
