
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/context/language-context';
import { useTheme } from '@/components/theme-provider';
import { SlidersHorizontal, MapPin, Link as LinkIcon, Sun, Moon, Languages, Save, X } from 'lucide-react';
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
        <h1 className="text-3xl font-bold font-headline">Ajustes</h1>
        <p className="text-muted-foreground">
          Configura el comportamiento de la aplicación y tus preferencias personales.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="text-primary"/> Preferencias Generales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Unidades de medida</Label>
                <RadioGroup defaultValue="metric" className="grid grid-cols-2 gap-2">
                  <div>
                    <RadioGroupItem value="metric" id="metric" className="peer sr-only" />
                    <Label htmlFor="metric" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      Métrico (kg, cm)
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                    <Label htmlFor="imperial" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      Imperial (lbs, in)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Apariencia</Label>
                 <RadioGroup defaultValue={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)} className="grid grid-cols-2 gap-2">
                  <div>
                    <RadioGroupItem value="light" id="light" className="peer sr-only" />
                    <Label htmlFor="light" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      <Sun className="mr-2 h-4 w-4" /> Claro
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                    <Label htmlFor="dark" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      <Moon className="mr-2 h-4 w-4" /> Oscuro
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label htmlFor="currency">Moneda por defecto</Label>
                <Select defaultValue="eur">
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Seleccionar moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eur">€ Euro</SelectItem>
                    <SelectItem value="usd">$ Dólar Estadounidense</SelectItem>
                    <SelectItem value="gbp">£ Libra Esterlina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select value={language} onValueChange={(value: 'es' | 'en') => setLanguage(value)}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Seleccionar idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="text-primary"/> Ubicación y Disponibilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="location">Ubicación principal</Label>
                    <Input id="location" defaultValue="Gimnasio Central, Madrid" />
                </div>
                <div className="space-y-2">
                    <Label>Días laborables</Label>
                    <div className="flex gap-2">
                        {weekdays.map(day => (
                            <Button 
                                key={day} 
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
                        <Label htmlFor="startTime">Hora de inicio</Label>
                        <Input id="startTime" type="time" defaultValue="08:00" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endTime">Hora de fin</Label>
                        <Input id="endTime" type="time" defaultValue="18:00" />
                    </div>
                 </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><LinkIcon className="text-primary"/> Integraciones</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                        <Image src="https://www.google.com/images/icons/product/calendar-32.png" alt="Google Calendar" width={32} height={32} />
                        <div>
                            <h4 className="font-semibold">Google Calendar</h4>
                            <p className="text-sm text-muted-foreground">Sincroniza tus sesiones automáticamente.</p>
                        </div>
                    </div>
                    <Switch />
                </div>
            </CardContent>
        </Card>
      </div>
      
       <div className="flex justify-end gap-2 sticky bottom-4">
            <Button variant="ghost" size="lg"><X className="mr-2 h-4 w-4" /> Cancelar</Button>
            <Button size="lg" className="bg-green-600 hover:bg-green-700"><Save className="mr-2 h-4 w-4" /> Guardar Cambios</Button>
        </div>
    </div>
  );
}
