
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Rocket, User, Languages } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageProvider, useLanguage } from '@/context/language-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const DinaxLogo = () => (
  <div className="flex items-center gap-2">
    <Image src="https://i.ibb.co/yFR9LGPD/dinax.png" alt="Dinax Logo" width={50} height={50} className="rounded-sm" data-ai-hint="logo" />
    <span className="text-xl font-bold font-headline">Dinax</span>
  </div>
);

function HeaderNav() {
    const { t, setLanguage, language } = useLanguage();
    
    const navLinks = [
      { href: '#', label: t.landing.nav.about },
      { href: '#', label: t.landing.nav.pricing },
    ];

    return (
        <>
            <div className="mr-4 hidden md:flex">
                <Link href="/" className="mr-6">
                <DinaxLogo />
                </Link>
                <nav className="flex items-center gap-6 text-sm">
                {navLinks.map((link) => (
                    <Link
                    key={link.label}
                    href={link.href}
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                    {link.label}
                    </Link>
                ))}
                </nav>
            </div>

             <div className="md:hidden">
                <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px]">
                    <div className="flex flex-col gap-6 p-6">
                    <Link href="/">
                        <DinaxLogo />
                    </Link>
                    <nav className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="text-foreground/80 hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                        ))}
                    </nav>
                    </div>
                </SheetContent>
                </Sheet>
            </div>


            <div className="flex flex-1 items-center justify-end space-x-2">
                <Button variant="ghost" asChild>
                    <Link href="/login">{t.landing.nav.trainer}</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/client/dashboard">
                    {t.landing.nav.client}
                    <User className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/register">
                    {t.landing.nav.register}
                    <Rocket className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                        <Languages className="h-5 w-5" />
                        <span className="sr-only">{t.language}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLanguage('en')} disabled={language === 'en'}>
                        English
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage('es')} disabled={language === 'es'}>
                        Español
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <ThemeToggle />
            </div>
        </>
    )
}

function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <HeaderNav />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <DinaxLogo />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              {t.landing.footer.copyright}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#">{t.landing.footer.terms}</Link>
            <Link href="#">{t.landing.footer.privacy}</Link>
            <Link href="#">{t.landing.footer.support}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <LandingPageLayout>{children}</LandingPageLayout>
    </LanguageProvider>
  )
}
