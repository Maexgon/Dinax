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

export default function PlansPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Training Plans</h1>
          <p className="text-muted-foreground">
            Create and manage customized workout plans for your students.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Plan
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
                  <AccordionTrigger className="text-lg font-semibold">Mesocycles</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-4">
                      {plan.mesocycles.map((cycle) => (
                        <div key={cycle.name}>
                          <h4 className="font-semibold">{cycle.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            <strong>Focus:</strong> {cycle.focus}
                          </p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="microcycles">
                  <AccordionTrigger className="text-lg font-semibold">Microcycles</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-4">
                      {plan.microcycles.map((cycle) => (
                        <div key={cycle.name}>
                          <h4 className="font-semibold">{cycle.name} ({cycle.duration})</h4>
                           <p className="text-sm text-muted-foreground mb-2">
                            <strong>Focus:</strong> {cycle.focus}
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
