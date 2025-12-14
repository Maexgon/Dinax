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
import { PlusCircle, List, Edit, Trash } from 'lucide-react';
import { mockPayments, mockServices } from '@/lib/data';

export default function PaymentsPage() {
  const getBadgeVariant = (status: 'Paid' | 'Pending' | 'Overdue') => {
    switch (status) {
      case 'Paid':
        return 'secondary';
      case 'Pending':
        return 'outline';
      case 'Overdue':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
       <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Payment History</CardTitle>
                    <CardDescription>Track all payments from your students.</CardDescription>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Record Payment
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.studentName}</TableCell>
                    <TableCell>{payment.service}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getBadgeVariant(payment.status)}>{payment.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
           <CardHeader>
             <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Services</CardTitle>
                    <CardDescription>Manage your training services and fees.</CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                    <PlusCircle className="h-5 w-5" />
                </Button>
            </div>
           </CardHeader>
          <CardContent>
            <ul className="space-y-3">
                {mockServices.map(service => (
                    <li key={service.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                            <p className="font-semibold">{service.name}</p>
                            <p className="text-sm text-muted-foreground">${service.fee.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                             <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4"/>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash className="h-4 w-4"/>
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
