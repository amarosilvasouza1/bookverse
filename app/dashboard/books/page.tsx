import { Plus, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BookList from '@/components/BookList';

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Books</h1>
          <p className="text-muted-foreground">Manage your published works and drafts</p>
        </div>
        <Link href="/dashboard/create-book" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="glass-card rounded-xl overflow-hidden p-12 text-center text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium mb-2">No books yet</p>
          <p className="text-sm mb-6">Start your writing journey today!</p>
          <Link href="/dashboard/create-book" className="text-primary hover:underline">
            Create your first book
          </Link>
        </div>
      ) : (
        <BookList initialBooks={books} />
      )}
    </div>
  );
}
