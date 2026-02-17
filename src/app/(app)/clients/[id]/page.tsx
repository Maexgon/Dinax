'use server';
import { notFound } from 'next/navigation';
import ClientDetailClientPage from './client-page';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <ClientDetailClientPage clientId={id} />;
}
