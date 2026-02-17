import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirebase, useCollection, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where, serverTimestamp, writeBatch, Timestamp } from 'firebase/firestore';
import { CalendarEvent, Client } from '@/lib/types';
import { Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: CalendarEvent | null;
}

export function AttendanceModal({ isOpen, onClose, event }: AttendanceModalProps) {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const tenantId = user?.uid;

    const [note, setNote] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [attendance, setAttendance] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch clients involved in this event
    // We need to fetch specific clients by ID.
    // Since firestore 'in' query is limited to 10, and likely we have few clients per session, this is okay.
    // But if event.clients is empty or undefined, we skip.
    const clientsQuery = useMemo(() => {
        return (firestore && tenantId && event?.clients && event.clients.length > 0)
            ? query(collection(firestore, `tenants/${tenantId}/user_profile`), where('__name__', 'in', event.clients.slice(0, 10)))
            : null;
    }, [firestore, tenantId, event?.id, event?.clients]);

    const { data: clients, isLoading: areClientsLoading } = useCollection<Client>(clientsQuery);

    useEffect(() => {
        console.log('DEBUG: AttendanceModal event:', event);
        console.log('DEBUG: AttendanceModal event.clients:', event?.clients);
        if (event) {
            setNote(event.outcomeNote || '');
            setIsPublic(event.isOutcomeNotePublic || false);
        }
    }, [event]);

    // Initialize attendance state when clients load
    useEffect(() => {
        console.log('DEBUG: AttendanceModal loaded clients details:', JSON.stringify(clients, null, 2));
        if (clients) {
            const initialAttendance: Record<string, boolean> = {};
            clients.forEach(c => {
                initialAttendance[c.id] = true; // Default to present? Or leave unchecked?
                // Providing "Select All" or default true is usually better UX for small groups.
            });
            setAttendance(initialAttendance);
        }
    }, [clients]);

    const handleSave = async () => {
        if (!firestore || !tenantId || !event) return;

        setIsSubmitting(true);
        try {
            const batch = writeBatch(firestore);

            // 1. Update the Event
            const eventRef = doc(firestore, `tenants/${tenantId}/events`, event.id);
            batch.update(eventRef, {
                completed: true,
                outcomeNote: note,
                isOutcomeNotePublic: isPublic
            });

            // 2. Create Attendance Records
            if (clients) {
                clients.forEach(client => {
                    const isPresent = attendance[client.id];
                    const attendanceRef = doc(collection(firestore, `tenants/${tenantId}/user_profile/${client.id}/attendance`));
                    batch.set(attendanceRef, {
                        clientId: client.id,
                        eventId: event.id,
                        date: event.start instanceof Timestamp ? event.start : Timestamp.fromDate(new Date(event.start as any)), // Ensure Timestamp
                        status: isPresent ? 'present' : 'absent',
                        createdAt: serverTimestamp()
                    });
                });
            }

            await batch.commit();

            toast({ variant: 'success', title: 'Sesión Completada', description: 'Asistencia y notas guardadas.' });
            onClose();
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la asistencia.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!event) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Completar Sesión</DialogTitle>
                    <DialogDescription>
                        {event.title}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Attendance List */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Users className="h-4 w-4" /> Asistencia</Label>
                        <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto">
                            {areClientsLoading ? (
                                <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-5 w-5" /></div>
                            ) : clients?.length === 0 ? (
                                <p className="p-4 text-sm text-muted-foreground text-center">No hay clientes asignados a esta sesión.</p>
                            ) : (
                                clients?.map(client => {
                                    if (!client) return null;
                                    const name = client.name || 'Sin Nombre';
                                    return (
                                        <div key={client.id} className="flex items-center justify-between p-3 border-b last:border-0">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={client.avatarUrl} />
                                                    <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium">{name}</span>
                                            </div>
                                            <Checkbox
                                                checked={attendance[client.id] || false}
                                                onCheckedChange={(checked) => setAttendance(prev => ({ ...prev, [client.id]: checked === true }))}
                                            />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Outcome Note */}
                    <div className="space-y-2">
                        <Label>Comentarios de la sesión</Label>
                        <Textarea
                            placeholder="¿Cómo fue el entrenamiento? Rendimiento, observaciones..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Visibility */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {isPublic ? "🌐 Visible para los clientes" : "🔒 Solo visible para entrenadores"}
                        </div>
                        <Select value={isPublic ? "public" : "private"} onValueChange={(v) => setIsPublic(v === "public")}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="private">Privado</SelectItem>
                                <SelectItem value="public">Público</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Terminar Sesión
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
