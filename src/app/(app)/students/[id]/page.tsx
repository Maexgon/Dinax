
'use server';
import { notFound } from 'next/navigation';
import StudentDetailClientPage from './client-page';

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  if (!id) {
    notFound();
  }
  
  return <StudentDetailClientPage studentId={id} />;
}
