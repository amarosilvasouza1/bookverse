import { getRoomDetails } from '@/app/actions/reading-room';
import ActiveRoomClient from './components/ActiveRoomClient';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;
  const result = await getRoomDetails(id);

  if (!result.success || !result.room) {
    return (
        <div className="flex items-center justify-center p-20 text-red-500">
            Room not found or you don&apos;t have access.
        </div>
    );
  }

  return <ActiveRoomClient room={result.room} currentUserId={session.id as string} />;
}
