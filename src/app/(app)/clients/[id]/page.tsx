
'use server';
import { notFound } from 'next/navigation';
import ClientDetailClientPage from './client-page';

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  if (!id) {
    notFound();
  }
  
  return <ClientDetailClientPage clientId={id} />;
}
