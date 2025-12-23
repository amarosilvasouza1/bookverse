import { getActiveRooms } from '@/app/actions/reading-room';
import { prisma } from '@/lib/prisma'; // Or separate action if strict
import ReadingRoomsLobby from './components/ReadingRoomsLobby';
import { getSession } from '@/lib/auth';

export default async function ReadingRoomsPage() {
  const session = await getSession(); // Auth check or optional
  const rooms = await getActiveRooms();
  
  // For selecting a book to start a room, let's just get all published books or user's books?
  // Let's get "All Books" to allow reading anything together. 
  // Limiting to 50 for MVP speed.
  const books = await prisma.book.findMany({
    where: { published: true },
    select: { id: true, title: true, coverImage: true, genre: true },
    take: 50,
  });

  // Fetch User Skills
  let unlockedSkills: string[] = [];
  if (session?.id) {
    const skillTree = await prisma.userSkillTree.findUnique({
      where: { userId: session.id },
      select: { unlockedSkills: true }
    });
    if (skillTree?.unlockedSkills) {
      unlockedSkills = JSON.parse(skillTree.unlockedSkills);
    }
  }

  return (
    <div className="p-4 md:p-8">
      <ReadingRoomsLobby initialRooms={rooms} userBooks={books} unlockedSkills={unlockedSkills} />
    </div>
  );
}
