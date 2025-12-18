
'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Pen,
  CreditCard,
  Tag,
  Star,
  Plus,
  Trash2,
  Rocket,
  Save,
  Check,
  Info,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/context/language-context';

const benefitSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'El beneficio no puede estar vacío.'),
});

const servicePlanSchema = z.object({
  name: z.string().min(1, 'El nombre del plan es obligatorio.'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo.'),
  frequency: z.enum(['monthly', 'quarterly', 'semiannually', 'annually', 'once']),
  hasPromo: z.boolean(),
  promoType: z.enum(['percentage', 'fixed']).optional(),
  promoValue: z.coerce.number().optional(),
  promoDuration: z.enum(['indefinite', 'first_month', 'custom']).optional(),
  promoMonths: z.coerce.number().optional(),
  benefits: z.array(benefitSchema),
});

type ServicePlanFormData = z.infer<typeof servicePlanSchema>;

export default function ServicePlansPage() {
  const { t } = useLanguage();
  const [newBenefit, setNewBenefit] = useState('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ServicePlanFormData>({
    resolver: zodResolver(servicePlanSchema),
    defaultValues: {
      name: 'Reto Transformación',
      description: 'El programa definitivo para cambiar tu cuerpo y mente en solo 12 semanas.',
      price: 49,
      frequency: 'monthly',
      hasPromo: true,
      promoType: 'percentage',
      promoValue: 20,
      promoDuration: 'custom',
      promoMonths: 3,
      benefits: [
        { id: '1', text: 'Plan de Nutrición Personalizado' },
        { id: '2', text: 'Seguimiento por WhatsApp' },
        { id: '3', text: 'Videos de Rutinas HD' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'benefits',
  });

  const watchData = watch();

  const handleAddBenefit = () => {
    if (newBenefit.trim() !== '') {
      append({ id: crypto.randomUUID(), text: newBenefit.trim() });
      setNewBenefit('');
    }
  };

  const onSubmit = (data: ServicePlanFormData) => {
    console.log(data);
  };

  const finalPrice =
    watchData.hasPromo && watchData.promoValue
      ? watchData.promoType === 'percentage'
        ? watchData.price * (1 - watchData.promoValue / 100)
        : watchData.price - watchData.promoValue
      : watchData.price;
      
  const planFrequencies = [
    { value: 'monthly', label: t.services.monthly },
    { value: 'quarterly', label: t.services.quarterly },
    { value: 'semiannually', label: t.services.semiannually },
    { value: 'annually', label: t.services.annually },
    { value: 'once', label: t.services.once },
  ];

  const promoDurations = [
    { value: 'indefinite', label: t.services.indefinite },
    { value: 'first_month', label: t.services.firstMonth },
    { value: 'custom', label: t.services.customMonths },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">{t.services.title}</h1>
        <p className="text-muted-foreground max-w-2xl">{t.services.description}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        {/* Main content */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary p-2 rounded-lg"><Pen /></span>
                <CardTitle>{t.services.generalDetails}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t.services.planName}</Label>
                <Input id="name" {...register('name')} placeholder={t.services.planNamePlaceholder} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t.services.shortDescription}</Label>
                <Textarea id="description" {...register('description')} placeholder={t.services.shortDescriptionPlaceholder} />
                <p className="text-xs text-muted-foreground text-right">{watchData.description?.length || 0}/150</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="bg-green-500/10 text-green-600 p-2 rounded-lg"><CreditCard /></span>
                <CardTitle>{t.services.priceAndFrequency}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">{t.services.subscriptionAmount}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                    <Input id="price" type="number" {...register('price')} className="pl-7 font-bold text-lg" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">USD</span>
                  </div>
                   {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">{t.services.subscriptionType}</Label>
                   <Controller
                    name="frequency"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="frequency">
                          <SelectValue placeholder="Seleccionar frecuencia" />
                        </SelectTrigger>
                        <SelectContent>
                          {planFrequencies.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-3">
                <Info className="text-primary h-5 w-5 mt-0.5" />
                <p className="text-sm text-foreground/80">{t.services.autoChargeMessage}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
             <CardHeader>
                <div className="flex items-center gap-3">
                    <span className="bg-orange-500/10 text-orange-600 p-2 rounded-lg"><Tag /></span>
                    <CardTitle>{t.services.discountsAndPromos}</CardTitle>
                </div>
             </CardHeader>
             <CardContent>
                <div className="flex items-center justify-between mb-6 pb-6 border-b">
                    <div>
                        <Label htmlFor="hasPromo" className="text-base font-semibold">{t.services.enablePromoPrice}</Label>
                        <p className="text-sm text-muted-foreground">{t.services.enablePromoDescription}</p>
                    </div>
                    <Controller
                        name="hasPromo"
                        control={control}
                        render={({ field }) => (
                            <Switch id="hasPromo" checked={field.value} onCheckedChange={field.onChange} />
                        )}
                    />
                </div>

                {watchData.hasPromo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>{t.services.discountType}</Label>
                             <Controller
                                name="promoType"
                                control={control}
                                render={({ field }) => (
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="percentage">{t.services.percentage}</SelectItem>
                                      <SelectItem value="fixed">{t.services.fixedAmount}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                        </div>
                        <div className="space-y-2">
                           <Label>{t.services.discountValue}</Label>
                           <div className="relative">
                                <Input type="number" {...register('promoValue')} className="pr-12"/>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                                    {watchData.promoType === 'percentage' ? '%' : '$'}
                                </span>
                           </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t.services.promoDuration}</Label>
                             <Controller
                                name="promoDuration"
                                control={control}
                                render={({ field }) => (
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                      {promoDurations.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                        </div>
                        {watchData.promoDuration === 'custom' && (
                             <div className="space-y-2">
                               <Label>{t.services.validityMonths}</Label>
                               <div className="relative">
                                   <Input type="number" {...register('promoMonths')} />
                                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{t.services.months}</span>
                               </div>
                            </div>
                        )}
                    </div>
                )}
             </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
               <div className="flex items-center gap-3">
                <span className="bg-purple-500/10 text-purple-600 p-2 rounded-lg"><Star /></span>
                <CardTitle>{t.services.includedBenefits}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input 
                        placeholder={t.services.benefitPlaceholder}
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBenefit(); } }}
                    />
                    <Button type="button" onClick={handleAddBenefit}><Plus /></Button>
                </div>
                 <div className="space-y-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border group">
                            <div className="flex items-center gap-3">
                                <Check className="text-green-500 h-4 w-4" />
                                <span className="text-sm font-medium">{field.text}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))}
                 </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview column */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{t.services.preview}</h3>
            <div className="bg-card rounded-2xl overflow-hidden shadow-2xl border transform transition-transform hover:scale-[1.02] duration-300">
                <div className="h-32 bg-gradient-to-br from-primary to-blue-600 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "20px 20px"}}></div>
                    <div className="absolute bottom-4 left-6 flex gap-2">
                        <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-white/30">{t.services.mostPopular}</Badge>
                         {watchData.hasPromo && (
                           <Badge variant="destructive" className="bg-orange-500 text-white border-orange-400 animate-pulse">{t.services.offer}</Badge>
                         )}
                    </div>
                </div>
                <div className="p-6 md:p-8 flex flex-col items-center text-center">
                    <h3 className="text-2xl font-black mb-2">{watchData.name || t.services.planNamePlaceholder}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2 h-10">{watchData.description || t.services.shortDescriptionPlaceholder}</p>
                    
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-4xl font-black text-primary">${finalPrice.toFixed(2)}</span>
                        {watchData.hasPromo && <span className="text-lg text-muted-foreground line-through">${watchData.price.toFixed(2)}</span>}
                        <span className="text-muted-foreground font-medium">/ {t.services.month}</span>
                    </div>

                    {watchData.hasPromo && (
                        <div className="mb-8">
                             <Badge variant="secondary" className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                                <Tag className="mr-1 h-3 w-3"/>
                                {watchData.promoValue}{watchData.promoType === 'percentage' ? '%' : '$'} OFF {watchData.promoDuration === 'custom' ? `x ${watchData.promoMonths} ${t.services.months}`: ''}
                            </Badge>
                        </div>
                    )}
                    
                    <ul className="w-full flex flex-col gap-3 mb-8 text-left">
                       {watchData.benefits.map((benefit, index) => (
                         <li key={index} className="flex items-center gap-3 text-sm">
                            <Check className="text-primary h-4 w-4" /> {benefit.text}
                         </li>
                       ))}
                    </ul>

                    <Button size="lg" className="w-full shadow-lg">{t.services.subscribeNow}</Button>
                    <p className="mt-4 text-xs text-muted-foreground">{t.services.freeCancellation}</p>
                </div>
            </div>
            <div className="mt-4 flex flex-col gap-3">
                <Button className="w-full bg-foreground text-background hover:bg-foreground/80 font-bold shadow-xl">
                    <Rocket className="mr-2"/> {t.services.publishPlan}
                </Button>
                 <Button variant="outline" className="w-full font-bold">
                    {t.services.saveDraft}
                </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
