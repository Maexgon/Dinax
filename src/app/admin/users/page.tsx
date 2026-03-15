
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
  UserPlus,
  AlertTriangle,
  CheckCircle2
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
import { 
  getTenantsList, 
  createUser, 
  updateUserRole, 
  resetUserPassword, 
  suspendUser,
  setUserPassword 
} from '../actions';
import { useToast } from "@/hooks/use-toast";

export default function TenantManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create User State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'coach', password: '' });

  // Role Change State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Set Password State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);

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
      setNewUser({ name: '', email: '', role: 'coach', password: '' });
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

  const handleSetPassword = async () => {
    if (!selectedUser || !tempPassword) return;
    setIsSettingPassword(true);
    const result = await setUserPassword(selectedUser.id, tempPassword, true);
    if (result.success) {
      toast({ 
        title: "Password Updated", 
        description: `A provisional password was set for ${selectedUser.name}. They will be forced to change it on next login.` 
      });
      setIsPasswordModalOpen(false);
      setTempPassword('');
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setIsSettingPassword(false);
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
             <UserPlus className="h-8 w-8 text-orange-500" /> Tenant Owners
          </h1>
          <p className="text-muted-foreground mt-1">Manage platform administrators and their permissions.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
                <Plus className="mr-2 h-4 w-4" /> Add Owner
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-card-foreground">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium">Add a new coach or tenant owner to the platform.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input 
                    value={newUser.name} 
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    placeholder="John Doe" 
                    className="bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input 
                    type="email"
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    placeholder="john@example.com" 
                    className="bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input 
                    type="password"
                    value={newUser.password} 
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Min. 6 characters" 
                    className="bg-background border-input"
                  />
                  <p className="text-[10px] text-muted-foreground">If left blank, a random password will be generated.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Role</label>
                  <Select value={newUser.role} onValueChange={v => setNewUser({...newUser, role: v})}>
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-card-foreground">
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
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create User"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-border bg-card/50">
        <CardHeader className="pb-3 px-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search owners by name or email..." 
                className="pl-10 bg-background border-input focus-visible:ring-orange-500/20 focus-visible:border-orange-500/50 transition-all"
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
                <tr className="border-b border-border text-muted-foreground font-medium bg-muted/30">
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                   Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-10 w-full animate-pulse bg-muted rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted border border-border font-bold text-muted-foreground uppercase">
                            {tenant.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{tenant.name}</div>
                            <div className="text-xs text-muted-foreground lowercase">{tenant.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">{tenant.role}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-muted/50 w-fit">PID: {tenant.project}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                          tenant.status === 'active' 
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {tenant.status === 'active' ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <AlertTriangle className="mr-1 h-3 w-3" />}
                          {tenant.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {tenant.joined}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-muted-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                            <DropdownMenuLabel className="text-xs text-muted-foreground font-medium px-3 py-2">Account Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(tenant);
                                setNewRole(tenant.role || 'coach');
                                setIsRoleModalOpen(true);
                              }}
                              className="focus:bg-muted focus:text-foreground cursor-pointer px-3 py-2"
                            >
                               <UserCog className="mr-2 h-4 w-4" /> Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(tenant);
                                setTempPassword('');
                                setIsPasswordModalOpen(true);
                              }}
                              className="focus:bg-muted focus:text-foreground cursor-pointer px-3 py-2"
                            >
                               <Key className="mr-2 h-4 w-4" /> Set Provisory Password
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handlePasswordReset(tenant.email)}
                              className="focus:bg-muted focus:text-foreground cursor-pointer px-3 py-2"
                            >
                               <Mail className="mr-2 h-4 w-4" /> Send Reset Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem 
                              onClick={() => handleSuspend(tenant.id, tenant.status)}
                              className={cn(
                                "cursor-pointer px-3 py-2 font-medium",
                                tenant.status === 'suspended' ? "text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10" : "text-red-500 focus:text-red-500 focus:bg-red-500/10"
                              )}
                            >
                               {tenant.status === 'suspended' ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                               {tenant.status === 'suspended' ? "Activate Account" : "Suspend Account"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No owners found matching your criteria.
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
        <DialogContent className="bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Change permissions for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select New Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-card-foreground">
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRoleModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateRole} 
              disabled={isUpdatingRole}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
            >
              {isUpdatingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle>Set Provisory Password</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              This will update the password for {selectedUser?.name}. 
              The user will be required to change it upon their next login.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Provisory Password</label>
              <Input 
                type="password"
                value={tempPassword} 
                onChange={e => setTempPassword(e.target.value)}
                placeholder="Enter temporary password" 
                className="bg-background border-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSetPassword} 
              disabled={isSettingPassword || !tempPassword}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
            >
              {isSettingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
