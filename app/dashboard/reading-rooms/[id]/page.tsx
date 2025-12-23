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

  // Transform room data to match client props (convert Dates to strings)
  // Transform room data to match client props (convert Dates to strings)
  const roomForClient = {
    ...result.room,
    book: {
      ...result.room.book,
      pages: result.room.book.pages.map(page => ({
        title: page.title,
        content: page.content,
        pageNumber: page.pageNumber,
        scheduledAt: page.scheduledAt ? page.scheduledAt.toISOString() : undefined,
      }))
    },
    messages: result.room.messages.map(msg => ({
      ...msg,
      createdAt: msg.createdAt.toISOString(),
      updatedAt: undefined // Ensure we don't pass dates if they exist
    })),
    participants: result.room.participants.map(p => ({
      ...p,
      joinedAt: p.joinedAt.toISOString()
    }))
  };

  return <ActiveRoomClient room={roomForClient} currentUserId={session.id as string} />;
}
