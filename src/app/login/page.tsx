'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function LoginPage() {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-lg shadow-primary/20">
        <CardHeader className="text-center">
           <Image src="https://i.ibb.co/yFR9LGPD/dinax.png" alt="Dinax Logo" width={60} height={60} className="mx-auto rounded-sm" data-ai-hint="logo" />
          <CardTitle className="font-headline text-2xl">{t.login.title}</CardTitle>
          <CardDescription>
            {t.login.description}{' '}
            <Link href="/register" className="text-primary hover:underline">
              {t.login.registerNow}
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.register.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="entrenador@example.com"
                required
              />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t.register.password}</Label>
                    <Link href="#" className="text-sm text-primary hover:underline">
                        {t.login.forgotPassword}
                    </Link>
                </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            
            <Button type="submit" className="w-full">
              {t.login.loginButton}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
