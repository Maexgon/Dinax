
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/context/language-context';
import { useTheme } from '@/components/theme-provider';
import { useFirebase, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { AppSettings } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SlidersHorizontal, MapPin, Link as LinkIcon, Sun, Moon, Save, X, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';

type WorkingDay = 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D';
const weekdays: WorkingDay[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const settingsSchema = z.object({
  units: z.enum(['metric', 'imperial']),
  theme: z.enum(['light', 'dark', 'system']),
  currency: z.string(),
  language: z.enum(['es', 'en']),
  location: z.string().optional(),
  workingDays: z.array(z.string()),
  startTime: z.string(),
  endTime: z.string(),
  googleCalendarSync: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const tenantId = user?.uid;

  const settingsDocRef = useMemoFirebase(
    () => (firestore && tenantId ? doc(firestore, `tenants/${tenantId}/settings`, 'preferences') : null),
    [firestore, tenantId]
  );
  
  const { data: settingsData, isLoading: areSettingsLoading } = useDoc<AppSettings>(settingsDocRef);

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      units: 'metric',
      theme: 'system',
      currency: 'eur',
      language: 'es',
      location: '',
      workingDays: ['L', 'M', 'X', 'J', 'V'],
      startTime: '08:00',
      endTime: '18:00',
      googleCalendarSync: false,
    },
  });

  useEffect(() => {
    if (settingsData) {
      reset(settingsData);
      setLanguage(settingsData.language);
      setTheme(settingsData.theme);
    }
  }, [settingsData, reset, setLanguage, setTheme]);
  
  const onSubmit = async (data: SettingsFormData) => {
    if (!settingsDocRef) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la configuración.' });
        return;
    }
    
    // Also update context providers
    setLanguage(data.language);
    setTheme(data.theme);

    await setDocumentNonBlocking(settingsDocRef, data, { merge: true });
    toast({ variant: 'success', title: 'Configuración Guardada', description: 'Tus preferencias han sido actualizadas.'});
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t.settings.title}</h1>
        <p className="text-muted-foreground">{t.settings.description}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="text-primary"/> {t.settings.generalPreferences}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{t.settings.units}</Label>
                <Controller
                  name="units"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-2 gap-2">
                      <div>
                        <RadioGroupItem value="metric" id="metric" className="peer sr-only" />
                        <Label htmlFor="metric" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                          {t.settings.metric}
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                        <Label htmlFor="imperial" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                          {t.settings.imperial}
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.settings.appearance}</Label>
                 <Controller
                    name="theme"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-2 gap-2">
                            <div>
                                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                                <Label htmlFor="light" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <Sun className="mr-2 h-4 w-4" /> {t.settings.light}
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                                <Label htmlFor="dark" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <Moon className="mr-2 h-4 w-4" /> {t.settings.dark}
                                </Label>
                            </div>
                        </RadioGroup>
                    )}
                 />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label htmlFor="currency">{t.settings.defaultCurrency}</Label>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder={t.settings.selectCurrency} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eur">{t.settings.eur}</SelectItem>
                        <SelectItem value="usd">{t.settings.usd}</SelectItem>
                        <SelectItem value="ars">{t.settings.ars}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="language">{t.settings.language}</Label>
                <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="language">
                                <SelectValue placeholder={t.settings.selectLanguage} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="es">{t.settings.spanish}</SelectItem>
                                <SelectItem value="en">{t.settings.english}</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="text-primary"/> {t.settings.locationAndAvailability}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="location">{t.settings.mainLocation}</Label>
                    <Input id="location" {...register('location')} placeholder={t.settings.mainLocationPlaceholder} />
                </div>
                <Controller
                    name="workingDays"
                    control={control}
                    render={({ field }) => (
                        <div className="space-y-2">
                            <Label>{t.settings.workingDays}</Label>
                            <div className="flex gap-2">
                                {weekdays.map(day => (
                                    <Button 
                                        key={day} 
                                        type="button"
                                        variant={field.value.includes(day) ? 'default' : 'outline'}
                                        size="icon"
                                        className={`w-10 h-10 rounded-full text-base ${field.value.includes(day) ? 'bg-primary text-primary-foreground' : ''}`}
                                        onClick={() => {
                                            const newDays = field.value.includes(day)
                                                ? field.value.filter(d => d !== day)
                                                : [...field.value, day];
                                            field.onChange(newDays);
                                        }}
                                    >
                                        {day}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="startTime">{t.settings.startTime}</Label>
                        <Input id="startTime" type="time" {...register('startTime')} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endTime">{t.settings.endTime}</Label>
                        <Input id="endTime" type="time" {...register('endTime')} />
                    </div>
                 </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><LinkIcon className="text-primary"/> {t.settings.integrations}</CardTitle>
            </CardHeader>
            <CardContent>
                <Controller
                    name="googleCalendarSync"
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                                <Image src="https://www.google.com/images/icons/product/calendar-32.png" alt="Google Calendar" width={32} height={32} />
                                <div>
                                    <h4 className="font-semibold">{t.settings.googleCalendar}</h4>
                                    <p className="text-sm text-muted-foreground">{t.settings.googleCalendarDescription}</p>
                                </div>
                            </div>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </div>
                    )}
                />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => reset()}>{t.settings.cancel}</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                    {t.settings.saveChanges}
                </Button>
            </CardFooter>
        </Card>
      </form>
    </div>
  );
}
