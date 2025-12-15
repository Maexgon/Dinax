'use server';
import { notFound } from 'next/navigation';
// We are removing mock data import as we will fetch real data.
// import { mockStudents } from '@/lib/data';
import StudentDetailClientPage from './client-page';

// This server component can be used to fetch initial data if needed,
// but the client component will handle real-time updates from Firestore.
// For simplicity, we'll pass the ID and let the client component fetch.

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  if (!id) {
    notFound();
  }

  // We no longer pre-fetch the student here.
  // The client component `StudentDetailClientPage` will fetch the data from Firestore.
  // This allows for real-time updates and a more dynamic experience.
  
  // We just need to pass the student ID to the client component.
  // The tenant ID will be derived from the coach's session on the client.
  return <StudentDetailClientPage studentId={id} />;
}
