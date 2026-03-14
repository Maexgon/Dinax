'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Search, PlusCircle, Pencil, Trash2, Dumbbell, 
    MoreVertical, Info, ExternalLink, PlayCircle,
    ChevronRight, LayoutGrid, List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/language-context';
import type { ExerciseWithId } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from 'next/image';
import Link from 'next/link';

export default function ExerciseLibraryPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const tenantId = user?.uid;

    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [exerciseToDelete, setExerciseToDelete] = useState<ExerciseWithId | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const exercisesQuery = useMemoFirebase(
        () => (firestore && tenantId ? query(collection(firestore, `tenants/${tenantId}/exercises`), orderBy("name", "asc")) : null),
        [firestore, tenantId]
    );
    const { data: exercises, isLoading } = useCollection<ExerciseWithId>(exercisesQuery);

    const filteredExercises = useMemo(() => {
        if (!exercises) return [];
        return exercises.filter(ex => {
            const matchesType = filter === 'all' || ex.type === filter;
            const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesType && matchesSearch;
        });
    }, [exercises, filter, searchQuery]);

    const handleConfirmDelete = async () => {
        if (!firestore || !tenantId || !exerciseToDelete) return;

        const exerciseId = exerciseToDelete.id;
        const exerciseName = exerciseToDelete.name;
        
        setExerciseToDelete(null);
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const exerciseRef = doc(firestore, `tenants/${tenantId}/exercises`, exerciseId);
            await deleteDocumentNonBlocking(exerciseRef);
            toast({ variant: 'success', title: 'Ejercicio Eliminado', description: `"${exerciseName}" ha sido eliminado de la biblioteca.` });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el ejercicio.' });
        }
    };

    const filterButtons = useMemo(() => [
        { value: 'all', label: t.plans.all },
        ...(t.plans.exerciseTypeList || [])
    ], [t]);

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Link href="/plans" className="hover:text-primary transition-colors">{t.nav.dashboard}</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span>{t.plans.exerciseLibrary}</span>
                    </div>
                    <h2 className="text-3xl font-bold font-headline">{t.plans.exerciseLibrary}</h2>
                    <p className="text-muted-foreground">Administra y organiza tus movimientos personalizados</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => router.push('/plans/new-exercise')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t.plans.addNewExercise}
                    </Button>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="w-full pl-10"
                        placeholder={t.plans.searchExercises}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div className="flex gap-2 shrink-0">
                        {filterButtons.map(btn => (
                            <Button 
                                key={btn.value} 
                                size="sm"
                                variant={filter === btn.value ? 'secondary' : 'ghost'} 
                                onClick={() => setFilter(btn.value)} 
                                className="shrink-0"
                            >
                                {btn.label}
                            </Button>
                        ))}
                    </div>
                    <div className="h-6 w-px bg-border hidden md:block shrink-0" />
                    <div className="flex gap-1 shrink-0 bg-muted p-1 rounded-lg">
                        <Button 
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                            size="icon" 
                            className="h-8 w-8 hover:bg-background"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                            size="icon" 
                            className="h-8 w-8 hover:bg-background shadow-none"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="aspect-video w-full" />
                            <CardHeader className="p-4">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full" />
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            ) : filteredExercises.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Dumbbell className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold">{t.plans.noExercises}</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">No se encontraron ejercicios que coincidan con tu búsqueda. ¿Quieres crear uno nuevo?</p>
                    <Button className="mt-6" onClick={() => router.push('/plans/new-exercise')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t.plans.addNewExercise}
                    </Button>
                </Card>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredExercises.map(ex => (
                        <Card key={ex.id} className="overflow-hidden group hover:border-primary/50 transition-all flex flex-col h-full">
                            <div className="relative aspect-video w-full overflow-hidden">
                                <Image 
                                    src={ex.imageUrl || 'https://picsum.photos/seed/' + ex.id + '/400/225'} 
                                    alt={ex.name} 
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300" 
                                />
                                <div className="absolute top-2 right-2 flex gap-1 transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                    <Button size="icon" variant="secondary" className="h-8 w-8 shadow-md" onClick={() => router.push(`/plans/exercises/${ex.id}/edit`)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="destructive" className="h-8 w-8 shadow-md" onClick={() => setExerciseToDelete(ex)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                {ex.videoUrl && (
                                    <Badge className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm border-none">
                                        <PlayCircle className="h-3 w-3 mr-1" /> Video
                                    </Badge>
                                )}
                            </div>
                            <CardHeader className="p-4 space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                    <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">{ex.name}</CardTitle>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {ex.type && <Badge variant="outline" className="text-[10px] px-1.5 py-0 uppercase">{ex.type}</Badge>}
                                    {ex.muscleGroups?.slice(0, 2).map(m => (
                                        <Badge key={m} variant="secondary" className="text-[10px] px-1.5 py-0">{m}</Badge>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 flex-grow">
                                <p className="text-xs text-muted-foreground line-clamp-2">{ex.instructions || 'Sin instrucciones técnicas registradas.'}</p>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => router.push(`/plans/exercises/${ex.id}/edit`)}>
                                    {t.plans.viewDetail || "Ver Detalle"}
                                </Button>
                                {ex.videoUrl && (
                                    <Button size="sm" variant="ghost" className="h-9 w-9 p-0" asChild>
                                        <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="border rounded-lg divide-y bg-card">
                    {filteredExercises.map(ex => (
                        <div key={ex.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 group hover:bg-muted/30 transition-colors">
                            <div className="relative h-16 w-24 shrink-0 rounded-md overflow-hidden bg-muted border">
                                <Image 
                                    src={ex.imageUrl || 'https://picsum.photos/seed/' + ex.id + '/200/150'} 
                                    alt={ex.name} 
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold truncate text-lg group-hover:text-primary transition-colors">{ex.name}</h4>
                                    <Badge variant="outline" className="text-[10px] uppercase shrink-0">{ex.type}</Badge>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground font-medium">Equipamiento: {ex.equipment || 'N/A'}</span>
                                    <span className="text-muted-foreground text-[10px]">•</span>
                                    <span className="text-xs text-muted-foreground font-medium">Músculos: {ex.muscleGroups?.join(', ') || 'General'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:self-center">
                                <Button size="sm" variant="ghost" asChild className="hidden sm:flex">
                                    <Link href={`/plans/exercises/${ex.id}/edit`}>{t.plans.viewDetail || "Detalles"}</Link>
                                </Button>
                                <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => router.push(`/plans/exercises/${ex.id}/edit`)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9"><MoreVertical className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => router.push(`/plans/exercises/${ex.id}/edit`)}>
                                            <Pencil className="mr-2 h-4 w-4" /> Editar Ejercicio
                                        </DropdownMenuItem>
                                        {ex.videoUrl && (
                                            <DropdownMenuItem asChild>
                                                <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer">
                                                    <PlayCircle className="mr-2 h-4 w-4" /> Video Demostración
                                                </a>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setExerciseToDelete(ex)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AlertDialog open={!!exerciseToDelete} onOpenChange={(open) => !open && setExerciseToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar ejercicio?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de eliminar <span className="font-bold text-foreground">"{exerciseToDelete?.name}"</span> permanentemente de tu biblioteca. 
                            Este ejercicio ya no aparecerá como opción al crear nuevos planes.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar definitivamente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
