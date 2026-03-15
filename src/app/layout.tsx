import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/context/language-context';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Poppins, DM_Sans } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-headline',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Dinax',
  description: 'Personalized fitness coaching powered by AI.',
  appleWebApp: {
    capable: true,
    title: 'Dinax',
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${poppins.variable} ${dmSans.variable} font-body antialiased`} suppressHydrationWarning>
        <ThemeProvider
          defaultTheme="system"
        >
          <LanguageProvider>
            <FirebaseClientProvider>
              {children}
              <Toaster />
            </FirebaseClientProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
