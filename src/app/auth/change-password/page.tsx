
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { completePasswordChange } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Loader2, KeyRound, Unlock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ChangePasswordPage() {
  const { auth, user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    if (newPassword.length < 6) {
      toast({ title: "Error", description: "New password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1. Re-authenticate with current (provisory) password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 2. Update password in Firebase Auth
      await updatePassword(user, newPassword);
      
      // 3. Clear the force reset flag in Firestore
      const result = await completePasswordChange(user.uid);
      
      if (result.success) {
        toast({ title: "Success", description: "Your password has been updated." });
        
        // Use window.location.href to force a full refresh and clear context state
        window.location.href = '/dashboard';
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Password change error:", error);
      let message = error.message || "Failed to update password.";
      if (error.code === 'auth/wrong-password') {
        message = "The current password you entered is incorrect.";
      }
      toast({ 
        title: "Security Error", 
        description: message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Security Required</span>
          </div>
          <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
          <CardDescription className="text-zinc-400">
            You must enter your temporary password and choose a new one.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current (Temporary) Password</label>
              <div className="relative">
                <Unlock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 pl-10"
                  placeholder="The password provided by Admin"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Password & Continue
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
