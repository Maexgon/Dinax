'use server';
import { notFound } from 'next/navigation';
import { mockStudents } from '@/lib/data';
import StudentDetailClientPage from './client-page';

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const student = mockStudents.find((s) => s.id === id);

  if (!student) {
    notFound();
  }

  return <StudentDetailClientPage student={student} />;
}
