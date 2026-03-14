'use client';
import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Dumbbell, HeartPulse, Scale, Ruler, FileText, User, MessageSquare, CalendarDays,
    Briefcase, Cake, Phone, Mail, MapPin, Flag, Plus, X, CheckCircle2, ChevronRight,
    VenetianMask, Calculator, Percent, Gauge, FileWarning, AlertTriangle, Target, Move,
    ArrowDownToLine, PersonStanding, Hand, Timer, Repeat, ShieldCheck, Activity, Zap,
    Award, Heart, Droplet, TestTube, Bone, Disc3, Brain, Pill, FilePlus2,
    CalendarCheck, HeartHandshake, FlaskConical, CircleAlert, ShieldAlert, FileKey2,
    UserCheck, Loader2, Footprints, StretchVertical, Wind as WindIcon, MoveVertical, GitCompare, Siren, Info, PlusCircle, Trash2, ShieldQuestion, HeartCrack, Send, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/context/language-context';
import type { Client, Note, Biomechanics, MedicalHistory, Mesocycle, UserProfile } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useFirebase, useMemoFirebase, useDoc, useCollection, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, limit, serverTimestamp, Timestamp, where, getDocs, writeBatch } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm, Controller, useFieldArray, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InvitationModal } from '@/components/invitation-modal';

const clientSchema = z.object({
    firstName: z.string().min(1, 'El nombre es obligatorio.'),
    lastName: z.string().min(1, 'El apellido es obligatorio.'),
    email: z.string().email('Email inválido.'),
    phoneNumber: z.string().optional(),
    birthDate: z.string().optional(),
    occupation: z.string().optional(),
    address: z.string().optional(),
    objective: z.string().optional(),
    planType: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

const biomechanicsSchema = z.object({
    weight: z.coerce.number().min(1, "El peso es obligatorio"),
    height: z.coerce.number().min(1, "La altura es obligatoria"),
    bodyFat: z.coerce.number().optional(),
    fatFreeBodyWeight: z.coerce.number().optional(),
    subcutaneousFat: z.coerce.number().optional(),
    bodyWater: z.coerce.number().optional(),
    skeletalMuscle: z.coerce.number().optional(),
    boneMass: z.coerce.number().optional(),
    ankleDorsiflexion: z.coerce.number().optional(),
    hipMobility: z.coerce.number().optional(),
    shoulderMobility: z.coerce.number().optional(),
    coreStability: z.coerce.number().optional(),
    hipStability: z.coerce.number().optional(),
    squatPattern: z.coerce.number().optional(),
    hipHingePattern: z.coerce.number().optional(),
    relativeStrengthLower: z.coerce.number().optional(),
    relativeStrengthUpper: z.coerce.number().optional(),
    unilateralBalance: z.coerce.number().optional(),
    asymmetries: z.coerce.number().optional(),
    movementPain: z.coerce.number().optional(),
});

type BiomechanicsFormData = z.infer<typeof biomechanicsSchema>;

const medicalHistorySchema = z.object({
    medicalClearance: z.boolean().default(false),
    bloodType: z.string().optional(),
    currentConditions: z.array(z.object({ value: z.string() })).default([]),
    underMedicalTreatment: z.boolean().default(false),
    currentMedications: z.array(z.object({ value: z.string() })).default([]),
    preexistingInjuries: z.array(z.object({ value: z.string() })).default([]),
    previousSurgeries: z.array(z.object({ value: z.string() })).default([]),
    chronicPain: z.boolean().default(false),
    medicalRestrictions: z.array(z.object({ value: z.string() })).default([]),
    emergencyContact: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
    }).optional(),
});

type MedicalHistoryFormData = z.infer<typeof medicalHistorySchema>;


const TagInput = ({ fields, append, remove, label, buttonText, register, name }: { fields: any[], append: (obj: any) => void, remove: (index: number) => void, label: string, buttonText: string, register: UseFormRegister<any>, name: 'currentConditions' | 'currentMedications' | 'preexistingInjuries' | 'previousSurgeries' | 'medicalRestrictions' }) => {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex flex-col gap-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <Input {...register(`${name}.${index}.value` as const)} placeholder={`${label} ${index + 1}`} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: '' })}>
                <Plus className="mr-2 h-4 w-4" /> {buttonText}
            </Button>
        </div>
    );
}

export default function ClientDetailClientPage({ clientId }: { clientId: string }) {
    const { t, language } = useLanguage();
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [showAdvancedBiomechanics, setShowAdvancedBiomechanics] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    const tenantId = user?.uid;

    // --- Data Fetching ---
    const clientDocRef = useMemoFirebase(
        () => (firestore && tenantId && clientId ? doc(firestore, `tenants/${tenantId}/user_profile`, clientId) : null),
        [firestore, tenantId, clientId]
    );
    const { data: client, isLoading: isClientLoading } = useDoc<Client>(clientDocRef);

    // Fetch Coach Profile for Avatars in Notes
    const coachProfileRef = useMemoFirebase(
        () => (firestore && user ? doc(firestore, 'user_profile', user.uid) : null), // Global user_profile for the coach
        [firestore, user]
    );
    const { data: coachProfile } = useDoc<UserProfile>(coachProfileRef);

    const notesCollectionRef = useMemoFirebase(
        () => (firestore && tenantId && clientId ? query(collection(firestore, `tenants/${tenantId}/user_profile/${clientId}/notes`), orderBy("createdAt", "desc")) : null),
        [firestore, tenantId, clientId]
    );
    const { data: notes, isLoading: areNotesLoading } = useCollection<Note>(notesCollectionRef);

    const biomechanicsCollectionRef = useMemoFirebase(
        () => (firestore && tenantId && clientId ? query(collection(firestore, `tenants/${tenantId}/user_profile/${clientId}/biomechanics`), orderBy("createdAt", "desc"), limit(1)) : null),
        [firestore, tenantId, clientId]
    );
    const { data: biomechanicsHistory, isLoading: areBiomechanicsLoading } = useCollection<Biomechanics>(biomechanicsCollectionRef);

    const medicalHistoryCollectionRef = useMemoFirebase(
        () => (firestore && tenantId && clientId ? query(collection(firestore, `tenants/${tenantId}/user_profile/${clientId}/medicalHistory`), orderBy("createdAt", "desc"), limit(1)) : null),
        [firestore, tenantId, clientId]
    );
    const { data: medicalHistory, isLoading: areMedicalHistoryLoading } = useCollection<MedicalHistory>(medicalHistoryCollectionRef);

    const planTemplatesRef = useMemoFirebase(
        () => (firestore && tenantId ? query(collection(firestore, `tenants/${tenantId}/mesocycles`), where('clientId', '==', null)) : null),
        [firestore, tenantId]
    );
    const { data: planTemplates, isLoading: arePlanTemplatesLoading } = useCollection<Mesocycle>(planTemplatesRef);

    const activePlanQuery = useMemoFirebase(
        () => (firestore && tenantId && clientId ? query(collection(firestore, `tenants/${tenantId}/mesocycles`), where('clientId', '==', clientId)) : null),
        [firestore, tenantId, clientId]
    );
    const { data: activePlans, isLoading: isActivePlanLoading } = useCollection<Mesocycle>(activePlanQuery);
    const activePlan = useMemo(() => activePlans?.[activePlans.length - 1], [activePlans]); // Get the most recent one if multiple exist

    const latestBiomechanics = useMemo(() => biomechanicsHistory?.[0], [biomechanicsHistory]);
    const latestMedicalHistory = useMemo(() => medicalHistory?.[0], [medicalHistory]);

    // --- Forms ---
    const clientForm = useForm<ClientFormData>({
        resolver: zodResolver(clientSchema),
    });

    const biomechanicsForm = useForm<BiomechanicsFormData>({
        resolver: zodResolver(biomechanicsSchema),
        defaultValues: { weight: 0, height: 0, }
    });

    const medicalForm = useForm<MedicalHistoryFormData>({
        resolver: zodResolver(medicalHistorySchema),
        defaultValues: {
            medicalClearance: false,
            underMedicalTreatment: false,
            chronicPain: false,
            currentConditions: [],
            currentMedications: [],
            preexistingInjuries: [],
            previousSurgeries: [],
            medicalRestrictions: [],
        }
    });

    const { watch: watchBiomechanics } = biomechanicsForm;
    const weight = watchBiomechanics('weight');
    const height = watchBiomechanics('height');
    const calculatedBmi = useMemo(() => {
        if (weight > 0 && height > 0) {
            const heightInMeters = height / 100;
            return (weight / (heightInMeters * heightInMeters)).toFixed(2);
        }
        return '0.00';
    }, [weight, height]);

    const { fields: conditions, append: appendCondition, remove: removeCondition } = useFieldArray({ control: medicalForm.control, name: 'currentConditions' });
    const { fields: medications, append: appendMedication, remove: removeMedication } = useFieldArray({ control: medicalForm.control, name: 'currentMedications' });
    const { fields: injuries, append: appendInjury, remove: removeInjury } = useFieldArray({ control: medicalForm.control, name: 'preexistingInjuries' });
    const { fields: surgeries, append: appendSurgery, remove: removeSurgery } = useFieldArray({ control: medicalForm.control, name: 'previousSurgeries' });
    const { fields: restrictions, append: appendRestriction, remove: removeRestriction } = useFieldArray({ control: medicalForm.control, name: 'medicalRestrictions' });

    React.useEffect(() => {
        if (client) {
            clientForm.reset({
                firstName: client.name.split(' ')[0],
                lastName: client.name.split(' ').slice(1).join(' '),
                email: client.email,
                phoneNumber: client.phoneNumber || '',
                birthDate: client.birthDate || '',
                occupation: client.occupation || '',
                address: client.address || '',
                objective: client.objective || '',
                planType: client.planType || '',
                tags: client.tags || [],
            });
        }
    }, [client, clientForm]);

    React.useEffect(() => {
        if (latestBiomechanics) {
            biomechanicsForm.reset({
                ...latestBiomechanics,
                height: latestBiomechanics.height ? latestBiomechanics.height * 100 : 0 // Convert meters to cm for display
            });
        }
    }, [latestBiomechanics, biomechanicsForm]);

    React.useEffect(() => {
        if (latestMedicalHistory) {
            medicalForm.reset({
                ...latestMedicalHistory,
                currentConditions: latestMedicalHistory.currentConditions?.map(v => ({ value: v })) || [],
                currentMedications: latestMedicalHistory.currentMedications?.map(v => ({ value: v })) || [],
                preexistingInjuries: latestMedicalHistory.preexistingInjuries?.map(v => ({ value: v })) || [],
                previousSurgeries: latestMedicalHistory.previousSurgeries?.map(v => ({ value: v })) || [],
                medicalRestrictions: latestMedicalHistory.medicalRestrictions?.map(v => ({ value: v })) || [],
            });
        }
    }, [latestMedicalHistory, medicalForm]);

    const cleanData = (obj: any) => {
        return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
    };

    const onClientSubmit = async (data: ClientFormData) => {
        if (!clientDocRef) return;
        const dataToSave = cleanData({ name: `${data.firstName} ${data.lastName}`, ...data });
        await updateDocumentNonBlocking(clientDocRef, dataToSave);
        toast({ variant: 'success', title: 'Perfil Actualizado', description: 'Los datos del cliente han sido guardados.' });
    };

    const onBiomechanicsSubmit = async (data: BiomechanicsFormData) => {
        if (!firestore || !tenantId || !clientId) return;
        const newBiomechanicsRef = doc(collection(firestore, `tenants/${tenantId}/user_profile/${clientId}/biomechanics`));
        const dataToSave = cleanData({ 
            ...data, 
            id: newBiomechanicsRef.id, 
            createdAt: serverTimestamp(), 
            bmi: parseFloat(calculatedBmi), 
            height: data.height ? data.height / 100 : 0 
        });
        await addDocumentNonBlocking(newBiomechanicsRef, dataToSave);
        toast({ variant: 'success', title: 'Evaluación Guardada', description: 'La nueva evaluación biomecánica ha sido guardada.' });
    }

    const onMedicalSubmit = async (data: MedicalHistoryFormData) => {
        if (!firestore || !tenantId || !clientId) return;
        const newMedicalRef = doc(collection(firestore, `tenants/${tenantId}/user_profile/${clientId}/medicalHistory`));
        const dataToSave = cleanData({
            ...data,
            id: newMedicalRef.id,
            createdAt: serverTimestamp(),
            currentConditions: data.currentConditions?.map(i => i.value),
            currentMedications: data.currentMedications?.map(i => i.value),
            preexistingInjuries: data.preexistingInjuries?.map(i => i.value),
            previousSurgeries: data.previousSurgeries?.map(i => i.value),
            medicalRestrictions: data.medicalRestrictions?.map(i => i.value),
        });
        await addDocumentNonBlocking(newMedicalRef, dataToSave);
        toast({ variant: 'success', title: 'Datos Médicos Guardados', description: 'El historial médico del cliente ha sido actualizado.' });
    }

    const [isNotePublic, setIsNotePublic] = useState(false);

    const handleAddNote = async () => {
        if (!newNote.trim() || !firestore || !tenantId || !user) return;

        console.log('DEBUG: creating note. User:', user);
        console.log('DEBUG: coachProfile:', coachProfile);
        console.log('DEBUG: user.photoURL:', user.photoURL);

        const coachName = coachProfile?.firstName ? `${coachProfile.firstName} ${coachProfile.lastName}` : (user.displayName || user.email?.split('@')[0] || "Coach");

        // Prioritize Firestore profile avatar, then Auth photoURL, then fallback
        const coachAvatarUrl = coachProfile?.avatarUrl || user.photoURL || `https://i.pravatar.cc/40?u=${user.uid}`;
        const coachAvatarHint = coachProfile?.avatarHint || "";

        console.log('DEBUG: Resolved coachAvatarUrl:', coachAvatarUrl);

        const noteData = {
            content: newNote,
            createdAt: serverTimestamp(),
            coachName,
            coachAvatarUrl,
            coachAvatarHint,
            isPublic: isNotePublic
        };

        try {
            const notesRef = collection(firestore, `tenants/${tenantId}/user_profile/${clientId}/notes`);
            await addDocumentNonBlocking(notesRef, noteData);
            setNewNote('');
            setIsNotePublic(false); // Reset to default (private)
            toast({ variant: 'success', title: 'Nota Publicada', description: 'Tu nota ha sido añadida.' });
        } catch (error) {
            console.error(error)
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo publicar la nota.' });
        }
    };

    const clientAge = useMemo(() => {
        if (!client?.birthDate) return null;
        const birthDate = new Date(client.birthDate);
        if (isNaN(birthDate.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
        return age;
    }, [client?.birthDate]);

    const filteredTemplates = useMemo(() => {
        return planTemplates?.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];
    }, [planTemplates, searchTerm]);

    const handleAddTag = () => {
        const currentTags = clientForm.getValues('tags') || [];
        const newTag = prompt(t.clientDetail.addTag || "Nueva etiqueta");
        if (newTag && newTag.trim() !== '') {
            clientForm.setValue('tags', [...currentTags, newTag.trim()], { shouldDirty: true });
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const currentTags = clientForm.getValues('tags') || [];
        clientForm.setValue('tags', currentTags.filter(t => t !== tagToRemove), { shouldDirty: true });
    };

    const handleAssignPlan = async () => {
        if (!selectedTemplateId || !firestore || !tenantId || !clientId) return;

        const template = planTemplates?.find(p => p.id === selectedTemplateId);
        if (!template) return;

        try {
            const batch = writeBatch(firestore);

            // 1. Create the new Mesocycle (Plan)
            const newPlanRef = doc(collection(firestore, `tenants/${tenantId}/mesocycles`));
            const { id, clientId: oldClientId, ...templateData } = template;

            const newPlanData = {
                ...templateData,
                id: newPlanRef.id,
                clientId: clientId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            batch.set(newPlanRef, newPlanData);

            // 2. Update Client Profile
            if (clientDocRef) {
                batch.update(clientDocRef, {
                    currentPlan: template.name,
                    planId: newPlanRef.id
                });
            }

            // 3. Calendar Integration: Slot Filling
            // Fetch all events for this client (we filter by date in memory to avoid complex indexes)
            const eventsRef = collection(firestore, `tenants/${tenantId}/events`);
            const q = query(eventsRef, where('clients', 'array-contains', clientId));
            const eventSnapshots = await getDocs(q);

            const now = new Date();
            const futureEvents = eventSnapshots.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as any))
                .filter(event => {
                    const eventDate = event.start?.toDate ? event.start.toDate() : new Date(event.start);
                    return eventDate >= now;
                })
                .sort((a, b) => {
                    const dateA = a.start?.toDate ? a.start.toDate() : new Date(a.start);
                    const dateB = b.start?.toDate ? b.start.toDate() : new Date(b.start);
                    return dateA.getTime() - dateB.getTime();
                });

            let eventIndex = 0;
            const weeks = Object.keys(template.weeks).map(Number).sort((a, b) => a - b);

            for (const weekNum of weeks) {
                const weekData = template.weeks[weekNum];
                const days = Object.keys(weekData).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

                for (const dayKey of days) {
                    const dayData = weekData[dayKey];
                    if (dayData.isRestDay) continue;

                    if (eventIndex >= futureEvents.length) break;

                    const eventToUpdate = futureEvents[eventIndex];
                    const eventRef = doc(firestore, `tenants/${tenantId}/events`, eventToUpdate.id);

                    batch.update(eventRef, {
                        workPlan: newPlanRef.id,
                        title: `Entrenamiento: ${template.name} - Sem ${weekNum} ${dayKey}`,
                        // Optionally add instructions or focus
                        instructions: dayData.focus ? `Foco: ${dayData.focus}` : (eventToUpdate.instructions || '')
                    });

                    eventIndex++;
                }
            }

            // Commit all changes
            await batch.commit();

            toast({ variant: 'success', title: 'Plan Asignado', description: `Se ha asignado el plan "${template.name}" y se han agendado ${eventIndex} sesiones.` });
            setIsAssignModalOpen(false);
            setSelectedTemplateId(null);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo asignar el plan.' });
        }
    };

    const getNoteDate = (note: Note) => {
        if (!note.createdAt) return '';
        const date = (note.createdAt as Timestamp)?.toDate ? (note.createdAt as Timestamp).toDate() : new Date(note.createdAt as string);
        return formatDistanceToNow(date, { addSuffix: true, locale: language === 'es' ? es : undefined });
    };

    const getFormattedDate = (date: string | Timestamp | undefined) => {
        if (!date) return null;
        const d = (date as Timestamp)?.toDate ? (date as Timestamp).toDate() : new Date(date as string);
        return format(d, 'dd MMM yyyy');
    };

    // Watch form values for real-time progress calculation
    const clientValues = clientForm.watch();
    const medicalValues = medicalForm.watch();
    const biomechanicsValues = biomechanicsForm.watch();

    const profileCompletion = useMemo(() => {
        // Use form values if available (user is editing), otherwise fallback to saved data (initially they match)
        // actually, form values are always available after init.

        let totalFields = 0;
        let completedFields = 0;

        // 1. Personal Info
        const personalInfoFields = ['firstName', 'lastName', 'email', 'birthDate', 'occupation', 'objective', 'planType', 'phoneNumber', 'address'];
        // Note: I added firstName, lastName, email to the tracked list as they are core to "Profile"

        totalFields += personalInfoFields.length;
        personalInfoFields.forEach(field => {
            const value = clientValues[field as keyof ClientFormData];
            if (value && value.toString().trim() !== '') completedFields++;
        });

        // 2. Medical History
        // We consider medical history "complete" if the form is filled out, 
        // regardless of whether it's a new record or existing one.
        const medicalFields = ['bloodType', 'currentConditions', 'currentMedications', 'preexistingInjuries', 'previousSurgeries', 'medicalRestrictions', 'emergencyContact'];

        const hasMedicalData = Object.keys(medicalValues).length > 0;

        if (hasMedicalData) {
            totalFields += medicalFields.length;

            if (medicalValues.bloodType) completedFields++;
            if (medicalValues.currentConditions && medicalValues.currentConditions.length > 0) completedFields++;
            if (medicalValues.currentMedications && medicalValues.currentMedications.length > 0) completedFields++;
            if (medicalValues.preexistingInjuries && medicalValues.preexistingInjuries.length > 0) completedFields++;
            if (medicalValues.previousSurgeries && medicalValues.previousSurgeries.length > 0) completedFields++;
            if (medicalValues.medicalRestrictions && medicalValues.medicalRestrictions.length > 0) completedFields++;
            if (medicalValues.emergencyContact?.name && medicalValues.emergencyContact?.phone) completedFields++;
        }

        // 3. Biomechanics
        const biomechanicsFields = ['weight', 'height', 'ankleDorsiflexion', 'hipMobility', 'shoulderMobility', 'coreStability', 'hipStability', 'squatPattern', 'hipHingePattern', 'relativeStrengthLower', 'relativeStrengthUpper', 'unilateralBalance', 'asymmetries', 'movementPain'];
        // Expanded list to encourage filling out the advanced section too, or maybe we accept just weight/height for basic completion?
        // Let's stick to the previous logic: if they exist, check them. 
        // For 'live' editing, we check the form values.

        const basicBioFields = ['weight', 'height'];
        totalFields += basicBioFields.length;

        if (Number(biomechanicsValues.weight) > 0) completedFields++;
        if (Number(biomechanicsValues.height) > 0) completedFields++;

        // If advanced mode is toggled or values exist, maybe we count them? 
        // For simplicity and to avoid "punishing" basic users, let's stick to basic bio + validation that 'something' was done.
        // The previous logic counted all 12 fields if `latestBiomechanics` existed. 
        // Let's refine: We'll count the advanced fields ONLY if the user has opened the advanced section OR filled them in.
        // But to keep it consistent 0-100%, let's just stick to a fixed set of "Core" profile data.

        // Let's use the full list from before to match user expectations if they saw it before.
        const advancedBioFields = ['ankleDorsiflexion', 'hipMobility', 'shoulderMobility', 'coreStability', 'hipStability', 'squatPattern', 'hipHingePattern', 'relativeStrengthLower', 'relativeStrengthUpper', 'unilateralBalance', 'asymmetries', 'movementPain'];

        // We will include them in the total to encourage a "Complete" profile which implies a full assessment.
        totalFields += advancedBioFields.length;

        advancedBioFields.forEach(field => {
            const value = biomechanicsValues[field as keyof BiomechanicsFormData];
            if (typeof value === 'number' && value > 0) completedFields++;
        });


        if (totalFields === 0) return { percentage: 0, message: "No hay datos para calcular el progreso." };

        const percentage = Math.round((completedFields / totalFields) * 100);
        const message = percentage < 100 ? `Progreso: ${completedFields} de ${totalFields} campos completados.` : "¡Perfil completo!";

        return { percentage, message };
    }, [clientValues, medicalValues, biomechanicsValues]);

    if (isClientLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/2" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="lg:col-span-2"> <Skeleton className="h-[600px] w-full" /></div>
                </div>
            </div>
        );
    }

    if (!client) return <div>{t.clientDetail.notFound || "Client not found."}</div>;

    const clientName = client.name;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/dashboard" className="hover:text-foreground">Inicio</Link>
                <ChevronRight className="h-4 w-4" />
                <Link href="/clients" className="hover:text-foreground">{t.nav.clients}</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">{clientName}</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="overflow-hidden text-center">
                        <CardContent className="p-6">
                            <Image src={client.avatarUrl || `https://i.pravatar.cc/128?u=${client.id}`} alt={`Avatar of ${clientName}`} data-ai-hint={client.avatarHint || 'person face'} width={128} height={128} className="rounded-full mx-auto mb-4 border-4 border-primary shadow-lg" />
                            <h1 className="text-3xl font-bold font-headline">{clientName}</h1>
                            <p className="text-muted-foreground text-sm">{t.clientDetail.objective}: {client.objective}</p>
                            <div className="mt-4 flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <Button asChild className="flex-1 bg-primary hover:bg-primary/90">
                                        <Link href={`/clients/${client.id}/wall`}>
                                            <MessageSquare className="mr-2 h-4 w-4" />{t.clientDetail.message}
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="icon"><CalendarDays className="h-4 w-4" /></Button>
                                </div>
                                {tenantId && client.email && (
                                    <InvitationModal
                                        tenantId={tenantId}
                                        clientId={client.id}
                                        clientEmail={client.email}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-muted-foreground"><User className="h-6 w-6 p-1 rounded-full bg-blue-100 text-blue-500" /><span>{t.clientDetail.age}</span></div>
                                <p className="font-bold text-lg">{clientAge !== null ? `${clientAge} años` : 'N/A'}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-muted-foreground"><Scale className="h-6 w-6 p-1 rounded-full bg-orange-100 text-orange-500" /><span>{t.clientDetail.weight}</span></div>
                                <div className="flex items-center gap-2"><p className="font-bold text-lg">{latestBiomechanics?.weight || 'N/A'} kg</p></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-muted-foreground"><Ruler className="h-6 w-6 p-1 rounded-full bg-purple-100 text-purple-500" /><span>{t.clientDetail.height}</span></div>
                                <p className="font-bold text-lg">{latestBiomechanics?.height ? latestBiomechanics.height * 100 : 'N/A'} cm</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-2"><span className="text-sm font-medium">{t.clientDetail.profileCompleted}</span><span className="text-sm font-bold text-primary">{profileCompletion.percentage}%</span></div>
                            <Progress value={profileCompletion.percentage} className="h-2" /><p className="text-xs text-muted-foreground mt-2">{profileCompletion.message}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg"><Dumbbell className="text-primary h-5 w-5" /> Plan de Entrenamiento</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isActivePlanLoading ? (
                                <Skeleton className="h-20 w-full" />
                            ) : activePlan ? (
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="font-bold text-lg">{activePlan.name}</h4>
                                        <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                                            <Badge variant="outline">{activePlan.weeks ? Object.keys(activePlan.weeks).length : 0} semanas</Badge>
                                        </div>
                                    </div>
                                    <Button asChild className="w-full" variant="secondary">
                                        <Link href={`/plans/create?planId=${activePlan.id}`}>
                                            Ver / Editar Plan
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-2 space-y-3">
                                    <p className="text-sm text-muted-foreground">Este cliente no tiene un plan asignado.</p>
                                    <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="w-full">Asignar Plan</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Asignar Plan de Entrenamiento</DialogTitle>
                                                <DialogDescription>
                                                    Selecciona una plantilla para asignar a {clientName}. Se creará una copia personal para este cliente.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="relative">
                                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Buscar plantilla..."
                                                        className="pl-8"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                                                    {filteredTemplates.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No se encontraron plantillas.</p>}
                                                    {filteredTemplates.map((template) => (
                                                        <div
                                                            key={template.id}
                                                            className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${selectedTemplateId === template.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                                                            onClick={() => setSelectedTemplateId(template.id)}
                                                        >
                                                            <div>
                                                                <p className="font-medium">{template.name}</p>
                                                                <p className="text-xs text-muted-foreground">{Object.keys(template.weeks || {}).length} semanas</p>
                                                            </div>
                                                            {selectedTemplateId === template.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancelar</Button>
                                                <Button onClick={handleAssignPlan} disabled={!selectedTemplateId}>Asignar Plan</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Tabs defaultValue="personal-info">
                        <TabsList className="grid w-full grid-cols-4 bg-muted">
                            <TabsTrigger value="personal-info">{t.clientDetail.personalInfo}</TabsTrigger>
                            <TabsTrigger value="medical">{t.clientDetail.medicalTitle}</TabsTrigger>
                            <TabsTrigger value="biomechanics">{t.clientDetail.biomechanics.title}</TabsTrigger>
                            <TabsTrigger value="progress">{t.clientDetail.progress}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="personal-info">
                            <Card>
                                <form onSubmit={clientForm.handleSubmit(onClientSubmit)}>
                                    <CardContent className="p-6 space-y-8">
                                        <div>
                                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><User className="text-primary" /> {t.clientDetail.basicData}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2"><Label htmlFor="firstName">{t.clientDetail.name}</Label><Input id="firstName" {...clientForm.register('firstName')} />{clientForm.formState.errors.firstName && <p className="text-xs text-destructive">{clientForm.formState.errors.firstName.message}</p>}</div>
                                                <div className="space-y-2"><Label htmlFor="lastName">{t.clientDetail.lastName}</Label><Input id="lastName" {...clientForm.register('lastName')} />{clientForm.formState.errors.lastName && <p className="text-xs text-destructive">{clientForm.formState.errors.lastName.message}</p>}</div>
                                                <div className="space-y-2"><Label htmlFor="occupation">{t.clientDetail.occupation}</Label><Input id="occupation" {...clientForm.register('occupation')} placeholder="Ej: Estudiante, Programador..." /></div>
                                                <div className="space-y-2"><Label htmlFor="birthDate">{t.clientDetail.birthDate}</Label><Input id="birthDate" type="date" {...clientForm.register('birthDate')} /></div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Phone className="text-primary" /> {t.clientDetail.contact}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2 space-y-2"><Label htmlFor="address">{t.clientDetail.address}</Label><Input id="address" {...clientForm.register('address')} placeholder="Ej: Av. Siempreviva 742" /></div>
                                                <div className="space-y-2"><Label htmlFor="email">{t.clientDetail.email}</Label><Input id="email" type="email" {...clientForm.register('email')} />{clientForm.formState.errors.email && <p className="text-xs text-destructive">{clientForm.formState.errors.email.message}</p>}</div>
                                                <div className="space-y-2"><Label htmlFor="phoneNumber">{t.clientDetail.phone}</Label><Input id="phoneNumber" type="tel" {...clientForm.register('phoneNumber')} /></div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Flag className="text-primary" /> {t.clientDetail.goalsAndNotes}</h3>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="planType">{t.clientDetail.planTypeLabel}</Label>
                                                    <Controller
                                                        name="planType"
                                                        control={clientForm.control}
                                                        render={({ field }) => (
                                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={arePlanTemplatesLoading}>
                                                                <SelectTrigger id="planType">
                                                                    <SelectValue placeholder={t.clientDetail.selectPlanType} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {planTemplates?.map((plan) => (
                                                                        <SelectItem key={plan.id} value={plan.name}>
                                                                            {plan.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                </div>
                                                <div className="space-y-2"><Label htmlFor="objective">{t.clientDetail.objective}</Label><Textarea id="objective" {...clientForm.register('objective')} placeholder="Ej: Ganar masa muscular, perder peso..." /></div>
                                                <div className="space-y-2">
                                                    <Label>{t.clientDetail.tags}</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(clientValues.tags || []).map(tag => (
                                                            <Badge key={tag} variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-primary/20 dark:text-primary/90 dark:border-primary/30">
                                                                {tag}
                                                                <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                                                            </Badge>
                                                        ))}
                                                        <Button type="button" variant="outline" size="sm" className="text-muted-foreground" onClick={handleAddTag}>
                                                            <Plus className="mr-1 h-3 w-3" />
                                                            {t.clientDetail.addTag}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" type="button" onClick={() => clientForm.reset()}>{t.clientDetail.cancel}</Button>
                                            <Button type="submit" disabled={clientForm.formState.isSubmitting}>{clientForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t.clientDetail.saveChanges}</Button>
                                        </div>
                                    </CardContent>
                                </form>
                            </Card>
                        </TabsContent>
                        <TabsContent value="medical">
                            <Card>
                                <form onSubmit={medicalForm.handleSubmit(onMedicalSubmit)}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="flex items-center gap-2"><HeartPulse className="text-primary" />{t.clientDetail.medical.title}</CardTitle>
                                                <CardDescription>{t.clientDetail.medicalDescription}</CardDescription>
                                            </div>
                                            <p className="text-sm text-muted-foreground pt-1">{latestMedicalHistory?.createdAt ? `${t.clientDetail.medical.lastUpdated} ${getFormattedDate(latestMedicalHistory.createdAt)}` : 'Sin datos previos'}</p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="medicalClearance" className="text-base">{t.clientDetail.medical.medicalClearance}</Label>
                                                    <p className="text-sm text-muted-foreground">¿El cliente presentó un certificado de apto médico?</p>
                                                </div>
                                                <Controller control={medicalForm.control} name="medicalClearance" render={({ field }) => (<Switch id="medicalClearance" checked={field.value} onCheckedChange={field.onChange} />)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="bloodType">{t.clientDetail.medical.bloodType}</Label>
                                                <Controller control={medicalForm.control} name="bloodType" render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger><SelectValue placeholder="Seleccionar grupo sanguíneo" /></SelectTrigger>
                                                        <SelectContent>
                                                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <TagInput fields={conditions} append={appendCondition} remove={removeCondition} label={t.clientDetail.medical.currentConditions} buttonText={t.clientDetail.medical.addCondition} register={medicalForm.register} name="currentConditions" />
                                            <TagInput fields={medications} append={appendMedication} remove={removeMedication} label={t.clientDetail.medical.currentMedications} buttonText={t.clientDetail.medical.addMedication} register={medicalForm.register} name="currentMedications" />
                                            <TagInput fields={injuries} append={appendInjury} remove={removeInjury} label={t.clientDetail.medical.preexistingInjuries} buttonText={t.clientDetail.medical.addInjury} register={medicalForm.register} name="preexistingInjuries" />
                                            <TagInput fields={surgeries} append={appendSurgery} remove={removeSurgery} label={t.clientDetail.medical.previousSurgeries} buttonText={t.clientDetail.medical.addSurgery} register={medicalForm.register} name="previousSurgeries" />
                                            <TagInput fields={restrictions} append={appendRestriction} remove={removeRestriction} label={t.clientDetail.medical.medicalRestrictions} buttonText={t.clientDetail.medical.addRestriction} register={medicalForm.register} name="medicalRestrictions" />

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between rounded-lg border p-4">
                                                    <Label htmlFor="underMedicalTreatment">{t.clientDetail.medical.underMedicalTreatment}</Label>
                                                    <Controller control={medicalForm.control} name="underMedicalTreatment" render={({ field }) => (<Switch id="underMedicalTreatment" checked={field.value} onCheckedChange={field.onChange} />)} />
                                                </div>
                                                <div className="flex items-center justify-between rounded-lg border p-4">
                                                    <Label htmlFor="chronicPain">{t.clientDetail.medical.chronicPain}</Label>
                                                    <Controller control={medicalForm.control} name="chronicPain" render={({ field }) => (<Switch id="chronicPain" checked={field.value} onCheckedChange={field.onChange} />)} />
                                                </div>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div>
                                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><ShieldAlert className="text-destructive" /> {t.clientDetail.medical.emergencyContact}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2"><Label htmlFor="emergencyContact.name">{t.clientDetail.medical.contactName}</Label><Input id="emergencyContact.name" {...medicalForm.register('emergencyContact.name')} /></div>
                                                <div className="space-y-2"><Label htmlFor="emergencyContact.phone">{t.clientDetail.medical.contactPhone}</Label><Input id="emergencyContact.phone" {...medicalForm.register('emergencyContact.phone')} /></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" type="button" onClick={() => medicalForm.reset()}>{t.clientDetail.cancel}</Button>
                                            <Button type="submit" disabled={medicalForm.formState.isSubmitting}>{medicalForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t.clientDetail.medical.saveMedicalData}</Button>
                                        </div>
                                    </CardContent>
                                </form>
                            </Card>
                        </TabsContent>
                        <TabsContent value="biomechanics">
                            <Card>
                                <form onSubmit={biomechanicsForm.handleSubmit(onBiomechanicsSubmit)}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="flex items-center gap-2"><Footprints className="text-primary" />{t.clientDetail.biomechanics.title}</CardTitle>
                                                <CardDescription>{t.clientDetail.biomechanics.descriptionForm}</CardDescription>
                                            </div>
                                            <p className="text-sm text-muted-foreground pt-1">
                                                {latestBiomechanics?.createdAt ? `Última act: ${getFormattedDate(latestBiomechanics.createdAt)}` : 'Sin datos previos'}
                                            </p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="space-y-2"><Label htmlFor="weight">{t.clientDetail.biomechanics.weight_short}</Label><Input id="weight" type="number" step="0.1" {...biomechanicsForm.register('weight')} placeholder="kg" />{biomechanicsForm.formState.errors.weight && <p className="text-xs text-destructive">{biomechanicsForm.formState.errors.weight.message}</p>}</div>
                                            <div className="space-y-2"><Label htmlFor="height">{t.clientDetail.biomechanics.height_short}</Label><Input id="height" type="number" step="1" {...biomechanicsForm.register('height')} placeholder="cm" />{biomechanicsForm.formState.errors.height && <p className="text-xs text-destructive">{biomechanicsForm.formState.errors.height.message}</p>}</div>
                                            <div className="space-y-2"><Label htmlFor="bmi">{t.clientDetail.biomechanics.bmi_short}</Label><Input id="bmi" value={calculatedBmi} disabled className="font-bold" /></div>
                                            <div className="space-y-2"><Label htmlFor="bodyFat">{t.clientDetail.biomechanics.bodyFat}</Label><Input id="bodyFat" type="number" step="0.1" {...biomechanicsForm.register('bodyFat')} placeholder="%" /></div>
                                            <div className="space-y-2"><Label htmlFor="fatFreeBodyWeight">{t.clientDetail.biomechanics.fatFreeBodyWeight}</Label><Input id="fatFreeBodyWeight" type="number" step="0.1" {...biomechanicsForm.register('fatFreeBodyWeight')} placeholder="kg" /></div>
                                            <div className="space-y-2"><Label htmlFor="subcutaneousFat">{t.clientDetail.biomechanics.subcutaneousFat}</Label><Input id="subcutaneousFat" type="number" step="0.1" {...biomechanicsForm.register('subcutaneousFat')} placeholder="%" /></div>
                                            <div className="space-y-2"><Label htmlFor="bodyWater">{t.clientDetail.biomechanics.bodyWater}</Label><Input id="bodyWater" type="number" step="0.1" {...biomechanicsForm.register('bodyWater')} placeholder="%" /></div>
                                            <div className="space-y-2"><Label htmlFor="skeletalMuscle">{t.clientDetail.biomechanics.skeletalMuscle}</Label><Input id="skeletalMuscle" type="number" step="0.1" {...biomechanicsForm.register('skeletalMuscle')} placeholder="%" /></div>
                                            <div className="space-y-2"><Label htmlFor="boneMass">{t.clientDetail.biomechanics.boneMass}</Label><Input id="boneMass" type="number" step="0.1" {...biomechanicsForm.register('boneMass')} placeholder="kg" /></div>
                                        </div>
                                        <Separator />

                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="advanced-metrics" className="text-base">Evaluación para Atletas de Alto Rendimiento</Label>
                                                <p className="text-sm text-muted-foreground">Activa para ver métricas de movilidad y fuerza relativa.</p>
                                            </div>
                                            <Switch id="advanced-metrics" checked={showAdvancedBiomechanics} onCheckedChange={setShowAdvancedBiomechanics} />
                                        </div>

                                        {showAdvancedBiomechanics && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in-0">
                                                <div className="space-y-2"><Label htmlFor="ankleDorsiflexion">{t.clientDetail.biomechanics.ankleDorsiflexion}</Label><Input id="ankleDorsiflexion" type="number" {...biomechanicsForm.register('ankleDorsiflexion')} placeholder="°" /></div>
                                                <div className="space-y-2"><Label htmlFor="hipMobility">{t.clientDetail.biomechanics.hipMobility}</Label><Input id="hipMobility" type="number" {...biomechanicsForm.register('hipMobility')} placeholder="°" /></div>
                                                <div className="space-y-2"><Label htmlFor="shoulderMobility">{t.clientDetail.biomechanics.shoulderMobility}</Label><Input id="shoulderMobility" type="number" {...biomechanicsForm.register('shoulderMobility')} placeholder="°" /></div>
                                                <div className="space-y-2"><Label htmlFor="coreStability">{t.clientDetail.biomechanics.coreStability}</Label><Input id="coreStability" type="number" {...biomechanicsForm.register('coreStability')} placeholder="s" /></div>
                                                <div className="space-y-2"><Label htmlFor="hipStability">{t.clientDetail.biomechanics.hipStability}</Label><Input id="hipStability" type="number" {...biomechanicsForm.register('hipStability')} placeholder="score 0-5" /></div>
                                                <div className="space-y-2"><Label htmlFor="squatPattern">{t.clientDetail.biomechanics.squatPattern}</Label><Input id="squatPattern" type="number" {...biomechanicsForm.register('squatPattern')} placeholder="score 0-5" /></div>
                                                <div className="space-y-2"><Label htmlFor="hipHingePattern">{t.clientDetail.biomechanics.hipHingePattern}</Label><Input id="hipHingePattern" type="number" {...biomechanicsForm.register('hipHingePattern')} placeholder="score 0-5" /></div>
                                                <div className="space-y-2"><Label htmlFor="relativeStrengthLower">{t.clientDetail.biomechanics.relativeStrengthLower}</Label><Input id="relativeStrengthLower" type="number" step="0.01" {...biomechanicsForm.register('relativeStrengthLower')} placeholder="kg/kg" /></div>
                                                <div className="space-y-2"><Label htmlFor="relativeStrengthUpper">{t.clientDetail.biomechanics.relativeStrengthUpper}</Label><Input id="relativeStrengthUpper" type="number" step="0.01" {...biomechanicsForm.register('relativeStrengthUpper')} placeholder="kg/kg" /></div>
                                                <div className="space-y-2"><Label htmlFor="unilateralBalance">{t.clientDetail.biomechanics.unilateralBalance}</Label><Input id="unilateralBalance" type="number" {...biomechanicsForm.register('unilateralBalance')} placeholder="s" /></div>
                                                <div className="space-y-2"><Label htmlFor="asymmetries">{t.clientDetail.biomechanics.asymmetries}</Label><Input id="asymmetries" type="number" {...biomechanicsForm.register('asymmetries')} placeholder="%" /></div>
                                                <div className="space-y-2"><Label htmlFor="movementPain">{t.clientDetail.biomechanics.movementPain}</Label><Input id="movementPain" type="number" {...biomechanicsForm.register('movementPain')} placeholder="escala 0-10" /></div>
                                            </div>
                                        )}
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" type="button" onClick={() => biomechanicsForm.reset()}>{t.clientDetail.cancel}</Button>
                                            <Button type="submit" disabled={biomechanicsForm.formState.isSubmitting}>{biomechanicsForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t.clientDetail.biomechanics.saveEvaluation}</Button>
                                        </div>
                                    </CardContent>
                                </form>
                            </Card>
                        </TabsContent>
                        <TabsContent value="progress">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <h3 className="text-lg font-semibold">{t.clientDetail.trackingNotes}</h3>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-4">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                    src={coachProfile?.avatarUrl || user?.photoURL || ''}
                                                    alt={user?.displayName || 'Coach'}
                                                    data-ai-hint={coachProfile?.avatarHint}
                                                />
                                                <AvatarFallback>{(coachProfile?.firstName || user?.displayName || 'C').charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <Textarea
                                                    placeholder={`Añade una nota sobre ${client.name.split(' ')[0]}...`}
                                                    value={newNote}
                                                    onChange={(e) => setNewNote(e.target.value)}
                                                    rows={2}
                                                />
                                                <div className="flex justify-between items-center mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <Select value={isNotePublic ? "public" : "private"} onValueChange={(val) => setIsNotePublic(val === "public")}>
                                                            <SelectTrigger className="w-[140px] h-8 text-xs">
                                                                <SelectValue placeholder="Visibilidad" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="private">🔒 Privada</SelectItem>
                                                                <SelectItem value="public">🌐 Pública</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <span className="text-xs text-muted-foreground">
                                                            {isNotePublic ? "Visible para el cliente" : "Solo visible para entrenadores"}
                                                        </span>
                                                    </div>
                                                    <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                                                        <Send className="mr-2 h-4 w-4" /> Guardar Nota
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="space-y-6">
                                            {areNotesLoading && <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}
                                            {!areNotesLoading && notes?.map((note) => (
                                                <div key={note.id} className="flex items-start gap-4">
                                                    <Avatar className="h-10 w-10 border">
                                                        <AvatarImage
                                                            src={note.coachAvatarUrl}
                                                            alt={note.coachName}
                                                            data-ai-hint={note.coachAvatarHint}
                                                        />
                                                        <AvatarFallback>{note.coachName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-semibold">{note.coachName}</p>
                                                                {note.isPublic ? (
                                                                    <Badge variant="outline" className="text-[10px] h-5 px-1 bg-blue-50 text-blue-700 border-blue-200">Pública</Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="text-[10px] h-5 px-1 bg-slate-100 text-slate-600 border-slate-200">Privada</Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">{getNoteDate(note)}</p>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">{note.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {!areNotesLoading && notes?.length === 0 && (<p className="text-muted-foreground text-sm text-center py-4">No hay notas para este cliente.</p>)}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
