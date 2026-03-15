'use client';

import { useAuth } from '@/components/auth/auth-provider'; // Assuming we have this or similar
import { ClientNav } from '@/components/client/ClientNav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Menu, Bell } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { type UserProfile } from '@/lib/types';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

import { signOut } from 'firebase/auth';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, auth } = useFirebase();
    const router = useRouter();
    const [clientName, setClientName] = useState<string>('');

    // Fetch minimal profile data for header
    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.uid) {
                try {
                    const { initializeFirebase } = await import('@/firebase');
                    const { firestore } = initializeFirebase();
                    // We need to find the tenant for this user. 
                    // Since we are in Client View, we can look up 'users/{uid}' to get tenantId & clientId
                    // Then fetch 'tenants/{tenantId}/clients/{clientId}' to get the name.
                    // OR, if we stick to the new rule: users/{uid} IS the profile source for global data? 
                    // No, users/{uid} links to the tenant. The 'name' should be in the client doc.

                    // 1. Get Global User to find Tenant linkage
                    const userDocRef = doc(firestore, 'users', user.uid);
                    const userSnapshot = await getDoc(userDocRef);

                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.data();
                        // 2. Fetch Client Doc
                        if (userData.tenantId && userData.clientId) {
                            const clientDocRef = doc(firestore, `tenants/${userData.tenantId}/clients`, userData.clientId);
                            const clientSnapshot = await getDoc(clientDocRef);
                            if (clientSnapshot.exists()) {
                                const clientData = clientSnapshot.data();
                                setClientName(clientData.name || '');
                            }
                        }
                    }
                } catch (err) {
                    console.error("Error fetching client profile for header:", err);
                }
            }
        };
        fetchProfile();
    }, [user]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const displayName = clientName || user?.displayName || 'Atleta';

    return (
        <div className="flex flex-col min-h-screen bg-muted/10">
            {/* Desktop Sidebar Placeholder */}
            <aside className="hidden md:flex fixed top-0 bottom-0 left-0 w-64 border-r bg-card flex-col z-20">
                <div className="p-6">
                    <h1 className="text-xl font-bold font-headline text-primary">Dinax Client</h1>
                </div>
                {/* Desktop Nav Items would go here */}
                <div className="p-4">
                    <p className="text-sm text-muted-foreground">Desktop view coming soon.</p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 pb-20 md:pb-0 md:pl-64 transition-all duration-300">
                {/* Mobile/Tablet Header - Orange */}
                <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white/20">
                                <AvatarImage src={user?.photoURL || undefined} />
                                <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">
                                    {displayName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-sm font-semibold leading-none">
                                    Hola, {displayName.split(' ')[0]}
                                </h2>
                                <p className="text-xs text-primary-foreground/80">
                                    Plan Premium {/* Placeholder until fetched */}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 rounded-full">
                                <Bell className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-primary-foreground hover:bg-white/10 rounded-full">
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation */}
            <ClientNav />
        </div>
    );
}
