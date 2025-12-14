
'use client';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Dumbbell, HeartPulse, Scale, Ruler, FileText, User } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ProgressChart } from '@/components/charts/progress-chart';
import { WeightChart } from '@/components/charts/weight-chart';
import AIGoalSuggester from '@/components/ai-goal-suggester';

import { mockStudents } from '@/lib/data';
import { useLanguage } from '@/context/language-context';

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const student = mockStudents.find((s) => s.id === params.id);

  if (!student) {
    notFound();
  }

  const studentProfileForAI = {
    age: student.profile.age,
    gender: student.profile.gender,
    weight: student.profile.weight,
    height: student.profile.height,
    medicalConditions: student.profile.medicalConditions,
    biomechanicalData: student.profile.biomechanicalData,
  };

  return (
    <div className="grid gap-6 lg:gap-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Image
            src={student.avatarUrl}
            alt={`Avatar of ${student.name}`}
            data-ai-hint={student.avatarHint}
            width={120}
            height={120}
            className="rounded-full border-4 border-primary shadow-lg"
          />
          <div className="flex-1">
            <CardTitle className="text-4xl font-headline">{student.name}</CardTitle>
            <CardDescription className="text-lg">{student.email}</CardDescription>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span>{t.studentDetail.joined}: {student.joinDate}</span>
              <span>|</span>
              <span>{t.studentDetail.plan}: {student.currentPlan}</span>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t.studentDetail.age}</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{student.profile.age}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t.studentDetail.weight}</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{student.profile.weight} kg</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t.studentDetail.height}</CardTitle>
                <Ruler className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{student.profile.height} cm</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t.studentDetail.gender}</CardTitle>
                <HeartPulse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{student.profile.gender}</div>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/> {t.studentDetail.medicalConditions}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{student.profile.medicalConditions}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Dumbbell className="h-5 w-5"/> {t.studentDetail.biomechanicalData}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{student.profile.biomechanicalData}</p>
            </CardContent>
        </Card>
      </div>

      <AIGoalSuggester studentProfile={studentProfileForAI} />

      <h2 className="text-2xl font-bold font-headline mt-4">{t.studentDetail.progressVisualizations}</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <ProgressChart />
        <WeightChart />
      </div>

    </div>
  );
}
