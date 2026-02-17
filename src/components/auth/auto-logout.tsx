'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

export function AutoLogout() {
    const { auth } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleLogout = useCallback(async () => {
        if (!auth) return;

        try {
            await signOut(auth);
            toast({
                title: "Sesión Cerrada",
                description: "Tu sesión ha expirado por inactividad.",
                variant: 'default',
            });
            router.push('/login');
        } catch (error) {
            console.error("Auto-logout error:", error);
        }
    }, [auth, router, toast]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT_MS);
    }, [handleLogout]);

    useEffect(() => {
        // Initial timer
        resetTimer();

        // Activity listeners
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

        // Throttled handler to avoid performance issues
        let lastActivity = Date.now();
        const handleActivity = () => {
            const now = Date.now();
            // Only reset once per second max to avoid spamming timer resets
            if (now - lastActivity > 1000) {
                resetTimer();
                lastActivity = now;
            }
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [resetTimer]);

    return null; // This component doesn't render anything
}
