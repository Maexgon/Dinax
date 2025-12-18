
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/context/language-context';
import { useTheme } from '@/components/theme-provider';
import { SlidersHorizontal, MapPin, Link as LinkIcon, Sun, Moon, Save, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';

type WorkingDay = 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D';

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>(['L', 'M', 'X', 'J', 'V']);

  const toggleWorkingDay = (day: WorkingDay) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };
  
  const weekdays: WorkingDay[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t.settings.title}</h1>
        <p className="text-muted-foreground">
          {t.settings.description}
        </p>
      </div>

      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="text-primary"/> {t.settings.generalPreferences}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{t.settings.units}</Label>
                <RadioGroup defaultValue="metric" className="grid grid-cols-2 gap-2">
                  <div>
                    <RadioGroupItem value="metric" id="metric" className="peer sr-only" />
                    <Label htmlFor="metric" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      {t.settings.metric}
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                    <Label htmlFor="imperial" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      {t.settings.imperial}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>{t.settings.appearance}</Label>
                 <RadioGroup defaultValue={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)} className="grid grid-cols-2 gap-2">
                  <div>
                    <RadioGroupItem value="light" id="light" className="peer sr-only" />
                    <Label htmlFor="light" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      <Sun className="mr-2 h-4 w-4" /> {t.settings.light}
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                    <Label htmlFor="dark" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      <Moon className="mr-2 h-4 w-4" /> {t.settings.dark}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label htmlFor="currency">{t.settings.defaultCurrency}</Label>
                <Select defaultValue="eur">
                  <SelectTrigger id="currency">
                    <SelectValue placeholder={t.settings.selectCurrency} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eur">{t.settings.eur}</SelectItem>
                    <SelectItem value="usd">{t.settings.usd}</SelectItem>
                    <SelectItem value="gbp">{t.settings.gbp}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="language">{t.settings.language}</Label>
                <Select value={language} onValueChange={(value: 'es' | 'en') => setLanguage(value)}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder={t.settings.selectLanguage} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">{t.settings.spanish}</SelectItem>
                    <SelectItem value="en">{t.settings.english}</SelectItem>
                  </SelectContent>
                </Select>
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
                    <Input id="location" defaultValue={t.settings.mainLocationPlaceholder} />
                </div>
                <div className="space-y-2">
                    <Label>{t.settings.workingDays}</Label>
                    <div className="flex gap-2">
                        {weekdays.map(day => (
                            <Button 
                                key={day} 
                                type="button"
                                variant={workingDays.includes(day) ? 'default' : 'outline'}
                                size="icon"
                                className={`w-10 h-10 rounded-full text-base ${workingDays.includes(day) ? 'bg-primary text-primary-foreground' : ''}`}
                                onClick={() => toggleWorkingDay(day)}
                            >
                                {day}
                            </Button>
                        ))}
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="startTime">{t.settings.startTime}</Label>
                        <Input id="startTime" type="time" defaultValue="08:00" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endTime">{t.settings.endTime}</Label>
                        <Input id="endTime" type="time" defaultValue="18:00" />
                    </div>
                 </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><LinkIcon className="text-primary"/> {t.settings.integrations}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                        <Image src="https://www.google.com/images/icons/product/calendar-32.png" alt="Google Calendar" width={32} height={32} />
                        <div>
                            <h4 className="font-semibold">{t.settings.googleCalendar}</h4>
                            <p className="text-sm text-muted-foreground">{t.settings.googleCalendarDescription}</p>
                        </div>
                    </div>
                    <Switch />
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" type="button">{t.settings.cancel}</Button>
                <Button type="submit"><Save className="mr-2 h-4 w-4" /> {t.settings.saveChanges}</Button>
            </CardFooter>
        </Card>
      </form>
    </div>
  );
}
