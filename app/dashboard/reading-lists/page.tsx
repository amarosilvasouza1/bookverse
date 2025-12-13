import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ReadingListsClient from './ReadingListsClient';
import { createDefaultLists } from '@/app/actions/reading-lists';

export default async function ReadingListsPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Ensure default lists exist
  await createDefaultLists(session.id as string);

  return <ReadingListsClient />;
}
