
'use client';

import React, { useState } from 'react';
import { 
  Search, 
  MoreHorizontal, 
  Mail, 
  Plus, 
  ArrowUpDown, 
  UserCog, 
  ShieldCheck, 
  Ban, 
  Key,
  Database,
  Loader2,
  CheckCircle2,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTenantsList, createUser, updateUserRole, resetUserPassword, suspendUser } from '../actions';
import { useToast } from "@/hooks/use-toast";

export default function TenantManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create User State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'coach' });

  // Role Change State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    const data = await getTenantsList();
    setTenants(data);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.name) return;
    setIsCreating(true);
    const result = await createUser(newUser);
    if (result.success) {
      toast({ title: "User created", description: `${newUser.name} has been added.` });
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', role: 'coach' });
      fetchTenants();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setIsCreating(false);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    setIsUpdatingRole(true);
    const result = await updateUserRole(selectedUser.id, newRole);
    if (result.success) {
      toast({ title: "Role updated", description: `Role for ${selectedUser.name} is now ${newRole}.` });
      setIsRoleModalOpen(false);
      fetchTenants();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setIsUpdatingRole(false);
  };

  const handleSuspend = async (uid: string, currentStatus: string) => {
    const shouldSuspend = currentStatus !== 'suspended';
    const result = await suspendUser(uid, shouldSuspend);
    if (result.success) {
      toast({ 
        title: shouldSuspend ? "Account Suspended" : "Account Activated", 
        description: `Status updated successfully.` 
      });
      fetchTenants();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handlePasswordReset = async (email: string) => {
    const result = await resetUserPassword(email);
    if (result.success) {
      toast({ 
        title: "Reset link generated", 
        description: "The link has been copied to clipboard (Simulated).",
      });
      // In a real app we might email it, but for admin we can show it
      console.log("Reset Link:", result.link);
      alert(`Password reset link generated:\n\n${result.link}`);
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
             <UserPlus className="h-8 w-8 text-orange-500" /> Tenant Owners
          </h1>
          <p className="text-zinc-400 mt-1">Manage platform administrators and their permissions.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold">
                <Plus className="mr-2 h-4 w-4" /> Add Owner
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription className="text-zinc-400">Add a new coach or tenant owner to the platform.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input 
                    value={newUser.name} 
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    placeholder="John Doe" 
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input 
                    type="email"
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    placeholder="john@example.com" 
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Role</label>
                  <Select value={newUser.role} onValueChange={v => setNewUser({...newUser, role: v})}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreateUser} 
                  disabled={isCreating}
                  className="bg-orange-500 hover:bg-orange-600 text-zinc-950"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create User"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="pb-3 px-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search owners by name or email..." 
                className="pl-10 bg-zinc-950 border-zinc-800 focus-visible:ring-orange-500/20 focus-visible:border-orange-500/50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-medium bg-zinc-950/50">
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                   Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-10 w-full animate-pulse bg-zinc-800/50 rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="group hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 font-bold text-zinc-300 uppercase">
                            {tenant.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-100">{tenant.name}</div>
                            <div className="text-xs text-zinc-500">{tenant.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-300 w-fit border border-zinc-700">
                          {tenant.role === 'admin' ? <ShieldCheck className="h-3 w-3 text-orange-500" /> : <UserCog className="h-3 w-3 text-blue-500" />}
                          {tenant.role || 'Coach'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className={cn(
                             "h-1.5 w-1.5 rounded-full",
                             tenant.status === 'suspended' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                           )} />
                           <span className='text-zinc-200 capitalize'>{tenant.status || 'active'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {tenant.joined}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-zinc-700/50 rounded-full h-8 w-8 text-zinc-500 hover:text-zinc-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(tenant);
                                setNewRole(tenant.role || 'coach');
                                setIsRoleModalOpen(true);
                              }}
                              className="focus:bg-zinc-800 focus:text-white cursor-pointer px-3 py-2"
                            >
                               <UserCog className="mr-2 h-4 w-4" /> Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handlePasswordReset(tenant.email)}
                              className="focus:bg-zinc-800 focus:text-white cursor-pointer px-3 py-2"
                            >
                               <Key className="mr-2 h-4 w-4" /> Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem 
                              onClick={() => handleSuspend(tenant.id, tenant.status)}
                              className={cn(
                                "focus:text-white cursor-pointer px-3 py-2",
                                tenant.status === 'suspended' ? "focus:bg-emerald-950 text-emerald-500" : "focus:bg-red-950 text-red-500"
                              )}
                            >
                               <Ban className="mr-2 h-4 w-4" /> 
                               {tenant.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      No tenants found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Role Change Modal */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update permissions for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="bg-zinc-950 border-zinc-800">
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <SelectItem value="coach">Coach / Tenant Owner</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="admin">Platform Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRoleModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateRole} 
              disabled={isUpdatingRole}
              className="bg-orange-500 hover:bg-orange-600 text-zinc-950"
            >
              {isUpdatingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
