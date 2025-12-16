
'use client';
import { useState } from 'react';
import AIGoalSuggester from '@/components/ai-goal-suggester';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockClients } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Client } from '@/lib/types';
import { useLanguage } from '@/context/language-context';

export default function AIGoalsPage() {
    const [selectedClient, setSelectedClient] = useState<Client | null>(mockClients[0]);
    const { t } = useLanguage();

    const handleClientChange = (clientId: string) => {
        const client = mockClients.find(s => s.id === clientId);
        setSelectedClient(client || null);
    }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t.aiGoals.title}</h1>
        <p className="text-muted-foreground">
          {t.aiGoals.description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.aiGoals.selectStudent}</CardTitle>
          <CardDescription>{t.aiGoals.selectStudentDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleClientChange} defaultValue={selectedClient?.id}>
            <SelectTrigger className="w-full md:w-1/2">
              <SelectValue placeholder={t.aiGoals.selectStudent} />
            </SelectTrigger>
            <SelectContent>
              {mockClients.map(client => (
                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedClient ? (
        <AIGoalSuggester studentProfile={selectedClient.profile} />
      ) : (
        <div className="text-center py-10 text-muted-foreground">
            {t.aiGoals.pleaseSelectStudent}
        </div>
      )}
    </div>
  );
}
