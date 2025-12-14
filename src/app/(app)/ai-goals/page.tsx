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

export default function AIGoalsPage() {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(mockStudents[0]);

    const handleStudentChange = (studentId: string) => {
        const student = mockStudents.find(s => s.id === studentId);
        setSelectedStudent(student || null);
    }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI Goal Setter</h1>
        <p className="text-muted-foreground">
          Generate personalized goals for your students using cutting-edge AI.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select a Student</CardTitle>
          <CardDescription>Choose a student to generate personalized goal recommendations for.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleStudentChange} defaultValue={selectedStudent?.id}>
            <SelectTrigger className="w-full md:w-1/2">
              <SelectValue placeholder="Select a student" />
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
            Please select a student to begin.
        </div>
      )}
    </div>
  );
}
