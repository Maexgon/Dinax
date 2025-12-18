
'use client';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit2, CheckCircle, Search, DollarSign, Users, Activity, MessageSquare, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { Client, ClientPlan, ServicePlan, Payment } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const ITEMS_PER_PAGE = 8;

function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }: { currentPage: number, totalItems: number, itemsPerPage: number, onPageChange: (page: number) => void }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!canGoPrevious}
            >
                <ChevronLeft className="h-4 w-4" />
                Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!canGoNext}
            >
                Siguiente
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}


export default function PaymentsPage() {
  const { t, language } = useLanguage();
  const { firestore, user } = useFirebase();
  const tenantId = user?.uid;

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Data Fetching ---
  const clientsRef = useMemoFirebase(() => tenantId ? collection(firestore, `tenants/${tenantId}/user_profile`) : null, [tenantId, firestore]);
  const clientPlansRef = useMemoFirebase(() => tenantId ? collection(firestore, `tenants/${tenantId}/client_plans`) : null, [tenantId, firestore]);
  const servicePlansRef = useMemoFirebase(() => tenantId ? collection(firestore, `tenants/${tenantId}/services`) : null, [tenantId, firestore]);
  const paymentsRef = useMemoFirebase(() => tenantId ? collection(firestore, `tenants/${tenantId}/payments`) : null, [tenantId, firestore]);

  const { data: clients, isLoading: areClientsLoading } = useCollection<Client>(clientsRef);
  const { data: clientPlans, isLoading: areClientPlansLoading } = useCollection<ClientPlan>(clientPlansRef);
  const { data: servicePlans, isLoading: areServicePlansLoading } = useCollection<ServicePlan>(servicePlansRef);
  const { data: payments, isLoading: arePaymentsLoading } = useCollection<Payment>(paymentsRef);
  
  const isLoading = areClientsLoading || areClientPlansLoading || areServicePlansLoading || arePaymentsLoading;
  
  // --- Data Processing ---
  const enrichedClientData = useMemo(() => {
    if (isLoading || !clients || !clientPlans || !servicePlans) return [];

    return clients.map(client => {
      const clientPlan = clientPlans.find(cp => cp.clientId === client.id);
      const servicePlan = clientPlan ? servicePlans.find(sp => sp.id === clientPlan.servicePlanId) : null;
      // This is a simplification. Real payment status would be more complex.
      const lastPayment = payments?.filter(p => p.clientId === client.id).sort((a,b) => new Date(b.paymentDate as string).getTime() - new Date(a.paymentDate as string).getTime())[0];
      const status = lastPayment?.status || 'pending';

      return {
        ...client,
        clientPlan,
        servicePlan,
        status,
        paymentAmount: clientPlan?.monthlyCost || 0,
      }
    }).filter(client => client.clientPlan); // Only show clients with an assigned plan
  }, [clients, clientPlans, servicePlans, payments, isLoading]);

  const filteredClients = useMemo(() => {
    return enrichedClientData.filter(client => client.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [enrichedClientData, searchQuery]);

  const paginatedClients = useMemo(() => {
    return filteredClients.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
  }, [filteredClients, currentPage]);

  const stats = useMemo(() => {
    const totalRevenue = payments?.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0) || 0;
    const pendingCount = enrichedClientData.filter(c => c.status !== 'paid').length;
    return {
      revenue: totalRevenue,
      pending: pendingCount,
      active: enrichedClientData.length
    }
  }, [payments, enrichedClientData]);

  // Set initial selected client
  useEffect(() => {
    if (!selectedClient && paginatedClients.length > 0) {
      setSelectedClient(paginatedClients[0]);
    } else if (selectedClient) {
        const updatedSelected = enrichedClientData.find(c => c.id === selectedClient.id);
        if(updatedSelected) setSelectedClient(updatedSelected as Client);
    }
  }, [paginatedClients, selectedClient, enrichedClientData]);
  
  const getStatusVariant = (status: 'paid' | 'pending' | 'overdue'): { variant: "default" | "secondary" | "destructive" | "outline" | null | undefined, text: string } => {
    switch (status) {
      case 'paid':
        return { variant: 'secondary', text: t.payments.paid };
      case 'pending':
        return { variant: 'outline', text: t.payments.pending };
      case 'overdue':
        return { variant: 'destructive', text: t.payments.overdue };
      default:
        return { variant: 'default', text: '' };
    }
  };

  const formatDate = (date: any, options: Intl.DateTimeFormatOptions) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat(language === 'es' ? 'es' : 'en', options).format(d);
  };
  
  const selectedClientFullData = useMemo(() => enrichedClientData.find(c => c.id === selectedClient?.id), [enrichedClientData, selectedClient]);
  const selectedClientPayments = useMemo(() => payments?.filter(p => p.clientId === selectedClient?.id).sort((a,b) => new Date(b.paymentDate as string).getTime() - new Date(a.paymentDate as string).getTime()), [payments, selectedClient]);


  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-bold font-headline">{t.payments.title}</h1>
            <p className="text-muted-foreground">{t.payments.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t.payments.revenueThisMonth}</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Basado en pagos registrados</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t.payments.pendingPayments}</CardTitle>
                     <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.pending} <span className="text-base font-normal text-muted-foreground">{t.nav.clients}</span></div>
                     <p className="text-xs text-orange-600">
                        {t.dashboard.actionRequired}
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t.payments.activeClients}</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.active}</div>
                    <p className="text-xs text-muted-foreground">Clientes con plan asignado</p>
                </CardContent>
            </Card>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <Card>
                 <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder={t.payments.searchByName} className="pl-8" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted">
                                <TableHead className="w-[35%] rounded-tl-lg">{t.payments.student}</TableHead>
                                <TableHead className="w-[25%]">{t.payments.currentPlan}</TableHead>
                                <TableHead className="w-[25%]">{t.payments.days}</TableHead>
                                <TableHead className="text-right w-[15%] rounded-tr-lg">{t.payments.status}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({length: 3}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell>
                                </TableRow>
                                ))
                            ) : paginatedClients.map((client) => {
                                const statusInfo = getStatusVariant(client.status as any);

                                return (
                                <TableRow key={client.id} onClick={() => setSelectedClient(client)} className={cn("cursor-pointer", selectedClient?.id === client.id && 'bg-primary/5')}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Image src={client.avatarUrl || ''} alt={client.name} width={40} height={40} className="rounded-full" data-ai-hint={client.avatarHint}/>
                                            <div>
                                                <p className="font-semibold">{client.name}</p>
                                                <p className="text-xs text-muted-foreground">{t.payments.memberSince} {client.joinDate?.split('-')[0]}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-medium">{client.servicePlan?.name || 'N/A'}</p>
                                        <p className="text-xs text-muted-foreground">${client.paymentAmount.toFixed(2)} / {t.payments.month}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => {
                                                const isTrainingDay = client.clientPlan?.trainingDays.includes(day);
                                                return (
                                                    <span key={day} className={`flex items-center justify-center h-5 w-5 rounded-full text-xs font-semibold ${isTrainingDay ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                        {isTrainingDay ? day.charAt(0) : '-'}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={statusInfo.variant} className="capitalize">
                                            {statusInfo.text}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                    <Pagination 
                        currentPage={currentPage}
                        totalItems={filteredClients.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </CardContent>
            </Card>
        </div>

        {selectedClientFullData && (
          <Card className="sticky top-6">
            <CardHeader className="text-center relative">
                 <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8">
                    <Edit2 className="h-4 w-4" />
                </Button>
                <Image src={selectedClientFullData.avatarUrl || ''} alt={selectedClientFullData.name} width={80} height={80} className="rounded-full mx-auto border-4 border-primary" data-ai-hint={selectedClientFullData.avatarHint} />
                <CardTitle className="font-headline text-2xl">{selectedClientFullData.name}</CardTitle>
                <CardDescription>{selectedClientFullData.email}</CardDescription>
                <div className="flex justify-center gap-2 pt-2">
                    <Button variant="outline" size="icon"><MessageSquare className="h-4 w-4"/></Button>
                    <Button variant="outline" size="icon"><Phone className="h-4 w-4"/></Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs font-semibold text-muted-foreground">{t.payments.currentPlan.toUpperCase()}</p>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-lg font-bold">{selectedClientFullData.servicePlan?.name || 'N/A'}</p>
                        <p className="text-lg font-bold text-primary">${selectedClientFullData.paymentAmount.toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t.payments.renewsOn} 15 Mar</p>
                    <Progress value={(12/16)*100} className="h-2 mt-2"/>
                    <p className="text-xs text-muted-foreground mt-1">12/16 {t.payments.sessionsCompleted}</p>
                </div>

                <div>
                    <h4 className="font-semibold mb-2">{t.payments.trainingDays}</h4>
                    <div className="grid grid-cols-7 gap-2">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                            <div key={day} className={`flex items-center justify-center h-8 w-8 rounded-lg text-sm font-semibold ${selectedClientFullData.clientPlan?.trainingDays.includes(day) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                {selectedClientFullData.clientPlan?.trainingDays.includes(day) ? day.charAt(0) : 'X'}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                         <h4 className="font-semibold">{t.payments.paymentHistory}</h4>
                         <Button variant="link" size="sm" className="text-primary">{t.payments.viewAll}</Button>
                    </div>
                    <div className="space-y-3">
                        {selectedClientPayments?.slice(0,2).map(payment => (
                             <div key={payment.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${payment.status === 'paid' ? 'bg-green-100' : 'bg-gray-100'}`}>
                                        <CheckCircle className={`h-5 w-5 ${payment.status === 'paid' ? 'text-green-600' : 'text-gray-400'}`}/>
                                    </div>
                                    <div>
                                        <p className="font-medium">{formatDate(payment.paymentDate, { month: 'long', year: 'numeric' })}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(payment.paymentDate, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                            </div>
                        ))}
                         {selectedClientPayments?.length === 0 && <p className="text-xs text-center text-muted-foreground py-2">Sin historial de pagos.</p>}
                    </div>
                </div>

                 <Button className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> {t.payments.recordNewPayment}
                </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
