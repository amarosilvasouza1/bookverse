import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MyBooksClient from './MyBooksClient';

async function getMyBooks(userId: string) {
  return await prisma.book.findMany({
    where: {
      OR: [
        { authorId: userId },
        { collaborators: { some: { userId } } }
      ]
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      collaborators: true
    }
  });
}

export default async function MyBooksPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const books = await getMyBooks(session.id as string);

  return <MyBooksClient books={books} />;
}
