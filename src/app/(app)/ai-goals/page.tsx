
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
import { mockStudents } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Student } from '@/lib/types';
import { useLanguage } from '@/context/language-context';

export default function AIGoalsPage() {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(mockStudents[0]);
    const { t } = useLanguage();

    const handleStudentChange = (studentId: string) => {
        const student = mockStudents.find(s => s.id === studentId);
        setSelectedStudent(student || null);
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
          <Select onValueChange={handleStudentChange} defaultValue={selectedStudent?.id}>
            <SelectTrigger className="w-full md:w-1/2">
              <SelectValue placeholder={t.aiGoals.selectStudent} />
            </SelectTrigger>
            <SelectContent>
              {mockStudents.map(student => (
                <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedStudent ? (
        <AIGoalSuggester studentProfile={selectedStudent.profile} />
      ) : (
        <div className="text-center py-10 text-muted-foreground">
            {t.aiGoals.pleaseSelectStudent}
        </div>
      )}
    </div>
  );
}
