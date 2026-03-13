
'use client';

import React from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Filter, 
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Wallet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminBilling() {
  const invoices = [
    { id: 'INV-2024-001', tenant: 'Gym Pro', owner: 'Juan Perez', amount: '$120.00', status: 'Paid', date: '2024-03-01' },
    { id: 'INV-2024-002', tenant: 'Fit Coach', owner: 'Maria Silva', amount: '$85.00', status: 'Pending', date: '2024-03-05' },
    { id: 'INV-2024-003', tenant: 'Peak Performance', owner: 'Alex Thompson', amount: '$210.00', status: 'Paid', date: '2024-02-15' },
    { id: 'INV-2024-004', tenant: 'Vital Fit', owner: 'Elena Rodriguez', amount: '$55.00', status: 'Overdue', date: '2024-02-01' },
    { id: 'INV-2024-005', tenant: 'Ultra Fitness', owner: 'Carlos Gomez', amount: '$340.00', status: 'Paid', date: '2024-02-10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
             <Wallet className="h-8 w-8 text-orange-500" /> Revenue Management
          </h1>
          <p className="text-zinc-400 mt-1">Monitor billing status and transaction history for all tenants.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold">
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,820</div>
            <p className="text-xs text-zinc-500 mt-1">7 tenants with outstanding balance</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2%</div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3" /> -0.4% improvement
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Review and manage all billing documents.</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input placeholder="Search invoice or tenant..." className="pl-10 bg-zinc-950 border-zinc-800" />
              </div>
              <Button variant="outline" size="icon" className="border-zinc-800 bg-zinc-950">
                <Filter className="h-4 w-4 text-zinc-400" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
           <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-medium bg-zinc-950/50">
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Tenant / Owner</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="group hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-zinc-300">
                      {inv.id}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-zinc-100">{inv.tenant}</div>
                        <div className="text-xs text-zinc-500">{inv.owner}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-zinc-200">
                      {inv.amount}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {inv.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit border ${
                        inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        inv.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                         {inv.status === 'Paid' ? <CheckCircle2 className="h-3 w-3" /> : 
                          inv.status === 'Pending' ? <Clock className="h-3 w-3" /> : 
                          <AlertCircle className="h-3 w-3" />}
                         {inv.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Button variant="ghost" size="icon" className="hover:bg-zinc-700/50 rounded-full h-8 w-8 text-zinc-500 hover:text-zinc-100">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-zinc-700/50 rounded-full h-8 w-8 text-zinc-500 hover:text-zinc-100 ml-1">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
