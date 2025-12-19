'use client';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  MessageSquare,
  CalendarDays,
  Plus,
  Send,
  ImageIcon,
  Paperclip,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/context/language-context';
import type { Client, Note } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useFirebase, useMemoFirebase, useDoc, useCollection, addDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function ClientWallPage({ params }: { params: { id: string } }) {
  const { id: clientId } = params;
  const { t, language } = useLanguage();
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const [newNote, setNewNote] = useState('');

  const tenantId = user?.uid;

  // --- Data Fetching ---
  const clientDocRef = useMemoFirebase(
    () => (firestore && tenantId && clientId ? doc(firestore, `tenants/${tenantId}/user_profile`, clientId) : null),
    [firestore, tenantId, clientId]
  );
  const { data: client, isLoading: isClientLoading } = useDoc<Client>(clientDocRef);

  const notesCollectionRef = useMemoFirebase(
    () => (firestore && tenantId && clientId ? query(collection(firestore, `tenants/${tenantId}/user_profile/${clientId}/notes`), orderBy('createdAt', 'asc')) : null),
    [firestore, tenantId, clientId]
  );
  const { data: notes, isLoading: areNotesLoading } = useCollection<Note>(notesCollectionRef);
  
  const handleAddNote = async () => {
      if (!newNote.trim() || !firestore || !tenantId || !user) return;

      const coachName = user.displayName || user.email?.split('@')[0] || "Coach";
      const coachAvatarUrl = user.photoURL || `https://i.pravatar.cc/40?u=${user.uid}`;
      
      const noteData = {
          content: newNote,
          createdAt: serverTimestamp(),
          coachName,
          coachAvatarUrl
      };

      try {
          await addDocumentNonBlocking(collection(firestore, `tenants/${tenantId}/user_profile/${clientId}/notes`), noteData);
          setNewNote('');
          toast({ variant: 'success', title: 'Nota Publicada', description: 'Tu nota ha sido añadida al muro del cliente.'});
      } catch (error) {
          console.error(error)
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudo publicar la nota.'});
      }
  };
  
  const getNoteDate = (note: Note) => {
      if (!note.createdAt) return '';
      const date = (note.createdAt as Timestamp)?.toDate ? (note.createdAt as Timestamp).toDate() : new Date(note.createdAt as string);
      return formatDistanceToNow(date, { addSuffix: true, locale: language === 'es' ? es : undefined });
  };
  
  const isLoading = isClientLoading || areNotesLoading;

  if (isLoading) {
    return <div className="max-w-6xl mx-auto"><Skeleton className="h-screen w-full" /></div>
  }

  if (!client) {
    return <div>Cliente no encontrado.</div>;
  }
  
  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-background">
        <header className="w-full px-6 py-5 bg-background shrink-0 flex items-center justify-between gap-4 border-b z-20">
            <div className="flex items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <a onClick={() => router.push('/clients')} className="hover:text-primary transition-colors cursor-pointer">{t.nav.clients}</a>
                        <ChevronRight className="h-4 w-4" />
                        <a onClick={() => router.push(`/clients/${clientId}`)} className="hover:text-primary transition-colors cursor-pointer">{client.name}</a>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">Muro de Seguimiento</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">Interacción y Progreso</h2>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" className="hidden sm:flex items-center gap-2">
                    <Printer className="h-4 w-4"/>
                    <span className="hidden lg:inline">Reporte</span>
                </Button>
                <Button asChild>
                    <a href="/schedule/new">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        <span>Nueva Sesión</span>
                    </a>
                </Button>
            </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="sticky top-6">
                        <CardContent className="p-6 text-center">
                             <div className="relative inline-block mb-4">
                                <Avatar className="w-24 h-24 border-4 border-muted">
                                    <AvatarImage src={client.avatarUrl} alt={client.name} />
                                    <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-0 right-0 bg-green-500 border-2 border-card h-6 w-6 rounded-full" title="Activo"></div>
                            </div>
                            <h3 className="text-xl font-bold">{client.name}</h3>
                            <p className="text-muted-foreground text-sm">Miembro desde {client.joinDate ? format(new Date(client.joinDate), 'MMM yyyy') : 'N/A'}</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'Coach'} />
                                    <AvatarFallback>{user?.displayName?.charAt(0) || 'C'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <Textarea 
                                        className="bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary focus:bg-background" 
                                        placeholder={`Escribe una nota, actualización o feedback para ${client.name.split(' ')[0]}...`} 
                                        rows={3}
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                    />
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="text-muted-foreground"><ImageIcon className="h-5 w-5"/></Button>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground"><Paperclip className="h-5 w-5"/></Button>
                                        </div>
                                        <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                                            <Send className="mr-2 h-4 w-4"/> Publicar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="relative space-y-8">
                       <div className="absolute left-6 top-4 bottom-0 w-0.5 bg-border"></div>
                        {notes?.map((note, index) => (
                             <div key={note.id} className="relative pl-16">
                                <div className="absolute left-3 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-background border-2 border-primary z-10"></div>
                                <Card>
                                     <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                 <Avatar className="h-10 w-10">
                                                    <AvatarImage src={note.coachAvatarUrl} alt={note.coachName}/>
                                                    <AvatarFallback>{note.coachName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-bold text-sm">{note.coachName}</h4>
                                                    <p className="text-xs text-muted-foreground">{getNoteDate(note)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pl-[52px]">
                                            <p className="text-foreground/90 text-sm leading-relaxed mb-3">
                                               {note.content}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </main>
  );
}
