
'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { mockTrainingPlans } from '@/lib/data';
import { useLanguage } from '@/context/language-context';

export default function PlansPage() {
  const { t } = useLanguage();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">{t.plans.title}</h1>
          <p className="text-muted-foreground">
            {t.plans.description}
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> {t.plans.createNewPlan}
        </Button>
      </div>

      <div className="space-y-6">
        {mockTrainingPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="mesocycles">
                  <AccordionTrigger className="text-lg font-semibold">{t.plans.mesocycles}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-4">
                      {plan.mesocycles.map((cycle) => (
                        <div key={cycle.name}>
                          <h4 className="font-semibold">{cycle.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            <strong>{t.plans.focus}:</strong> {cycle.focus}
                          </p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="microcycles">
                  <AccordionTrigger className="text-lg font-semibold">{t.plans.microcycles}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-4">
                      {plan.microcycles.map((cycle) => (
                        <div key={cycle.name}>
                          <h4 className="font-semibold">{cycle.name} ({cycle.duration})</h4>
                           <p className="text-sm text-muted-foreground mb-2">
                            <strong>{t.plans.focus}:</strong> {cycle.focus}
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {cycle.workouts.map((workout) => (
                              <li key={workout.day}>
                                <strong>{workout.day}:</strong> {workout.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
