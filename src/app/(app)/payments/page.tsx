
'use client';
import { useState } from 'react';
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
import { PlusCircle, List, Edit, Trash, Search, DollarSign, Users, Activity, MessageSquare, Phone, Edit2, CheckCircle } from 'lucide-react';
import { mockPayments, mockServices, mockStudents } from '@/lib/data';
import { useLanguage } from '@/context/language-context';
import { Student } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

export default function PaymentsPage() {
  const { t } = useLanguage();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(mockStudents[0]);

  const getStatusVariant = (status: 'Paid' | 'Pending' | 'Overdue'): { variant: "default" | "secondary" | "destructive" | "outline" | null | undefined, text: string } => {
    switch (status) {
      case 'Paid':
        return { variant: 'secondary', text: t.payments.paid };
      case 'Pending':
        return { variant: 'outline', text: t.payments.pending };
      case 'Overdue':
        return { variant: 'destructive', text: t.payments.overdue };
      default:
        return { variant: 'default', text: '' };
    }
  };

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
                    <div className="text-2xl font-bold">$4,250</div>
                    <p className="text-xs text-green-600">+12%</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t.payments.pendingPayments}</CardTitle>
                     <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">8 <span className="text-base font-normal text-muted-foreground">{t.nav.students}</span></div>
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
                    <div className="text-2xl font-bold">125</div>
                    <p className="text-xs text-green-600">+5%</p>
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
                            <Input placeholder={t.payments.searchByName} className="pl-8" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="secondary">{t.payments.all}</Button>
                            <Button variant="ghost">{t.payments.upToDate}</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-2/5">{t.payments.student}</TableHead>
                                <TableHead>{t.payments.currentPlan}</TableHead>
                                <TableHead>{t.payments.days}</TableHead>
                                <TableHead className="text-right">{t.payments.status}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockStudents.map((student) => {
                                const payment = mockPayments.find(p => p.studentId === student.id) || { status: 'Paid', service: student.currentPlan, amount: 65 };
                                const statusInfo = getStatusVariant(payment.status);

                                return (
                                <TableRow key={student.id} onClick={() => setSelectedStudent(student)} className="cursor-pointer">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Image src={student.avatarUrl} alt={student.name} width={40} height={40} className="rounded-full" data-ai-hint={student.avatarHint}/>
                                            <div>
                                                <p className="font-semibold">{student.name}</p>
                                                <p className="text-xs text-muted-foreground">{t.payments.memberSince} {new Date(student.joinDate).getFullYear()}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-medium">{payment.service}</p>
                                        <p className="text-xs text-muted-foreground">${payment.amount.toFixed(2)} / {t.payments.month}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => {
                                                const isTrainingDay = student.trainingDays.includes(day);
                                                return (
                                                    <span key={day} className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-semibold ${isTrainingDay ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                        {day}
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
                </CardContent>
            </Card>
        </div>

        {selectedStudent && (
          <Card className="sticky top-6">
            <CardHeader className="text-center relative">
                 <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8">
                    <Edit2 className="h-4 w-4" />
                </Button>
                <Image src={selectedStudent.avatarUrl} alt={selectedStudent.name} width={80} height={80} className="rounded-full mx-auto border-4 border-primary" data-ai-hint={selectedStudent.avatarHint} />
                <CardTitle className="font-headline text-2xl">{selectedStudent.name}</CardTitle>
                <CardDescription>{selectedStudent.email}</CardDescription>
                <div className="flex justify-center gap-2 pt-2">
                    <Button variant="outline" size="icon"><MessageSquare className="h-4 w-4"/></Button>
                    <Button variant="outline" size="icon"><Phone className="h-4 w-4"/></Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs font-semibold text-muted-foreground">{t.payments.currentPlan.toUpperCase()}</p>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-lg font-bold">{selectedStudent.currentPlan}</p>
                        <p className="text-lg font-bold text-primary">${mockPayments.find(p => p.studentId === selectedStudent.id)?.amount.toFixed(2) || '65.00'}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t.payments.renewsOn} 15 Mar</p>
                    <Progress value={(12/16)*100} className="h-2 mt-2"/>
                    <p className="text-xs text-muted-foreground mt-1">12/16 {t.payments.sessionsCompleted}</p>
                </div>

                <div>
                    <h4 className="font-semibold mb-2">{t.payments.trainingDays}</h4>
                    <div className="grid grid-cols-7 gap-2">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                            <div key={day} className={`flex items-center justify-center h-8 w-8 rounded-lg text-sm font-semibold ${selectedStudent.trainingDays.includes(day) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                {selectedStudent.trainingDays.includes(day) ? day : 'X'}
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
                        {mockPayments.filter(p => p.studentId === selectedStudent.id).slice(0,2).map(payment => (
                             <div key={payment.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${payment.status === 'Paid' ? 'bg-green-100' : 'bg-gray-100'}`}>
                                        <CheckCircle className={`h-5 w-5 ${payment.status === 'Paid' ? 'text-green-600' : 'text-gray-400'}`}/>
                                    </div>
                                    <div>
                                        <p className="font-medium">{new Date(payment.date).toLocaleString(language, { month: 'long', year: 'numeric' })}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(payment.date).toLocaleDateString(language, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                            </div>
                        ))}
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
