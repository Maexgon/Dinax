
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockStudents } from '@/lib/data';
import { useLanguage } from '@/context/language-context';

export default function StudentsPage() {
  const { t } = useLanguage();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">{t.students.title}</h1>
            <p className="text-muted-foreground">{t.students.description}</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> {t.students.addNewStudent}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockStudents.map((student) => (
          <Card key={student.id} className="flex flex-col">
            <CardHeader className="items-center">
              <Image
                src={student.avatarUrl}
                alt={`Avatar of ${student.name}`}
                data-ai-hint={student.avatarHint}
                width={80}
                height={80}
                className="rounded-full border-2 border-primary"
              />
            </CardHeader>
            <CardContent className="flex-grow text-center">
              <CardTitle className="font-headline">{student.name}</CardTitle>
              <CardDescription>{student.email}</CardDescription>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t.students.planProgress}
                </p>
                <Progress value={student.progress} className="h-2" />
                <p className="text-xs text-accent mt-1">{student.progress}{t.students.complete}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/students/${student.id}`}>{t.students.viewProfile}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
