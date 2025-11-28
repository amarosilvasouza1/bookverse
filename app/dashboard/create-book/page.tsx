import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CreateBookClient from './client';
import { Loader2 } from 'lucide-react';

async function CreateBook({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch user data for API key
  const user = await prisma.user.findUnique({
    where: { id: session.id as string },
    select: { 
      id: true,
      username: true,
      geminiApiKey: true 
    }
  });

  const { id } = await searchParams;
  let book = null;

  if (id) {
    book = await prisma.book.findUnique({
      where: { id },
      include: {
        pages: true,
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (!book) {
      // Handle book not found or unauthorized
      // For now, just redirect or let client handle empty state (though client expects book if ID is present)
    } else {
        // Verify ownership
        const isAuthor = book.authorId === (session.id as string);
        const isCollaborator = book.collaborators.some(c => c.userId === (session.id as string));
        
        if (!isAuthor && !isCollaborator) {
            redirect('/dashboard');
        }
    }
  }

  const sanitizedBook = book ? {
    ...book,
    coverImage: book.coverImage || undefined,
    description: book.description || undefined,
    genre: book.genre || undefined,
    price: book.price || undefined,
    ambience: book.ambience || undefined,
    pages: book.pages.map(page => ({
      ...page,
      title: page.title || '',
      scheduledAt: page.scheduledAt ? page.scheduledAt.toISOString() : undefined
    })),
    // Ensure pages and collaborators are compatible if needed, usually Prisma types match well enough except for nulls
  } : undefined;

  const sanitizedUser = user ? {
    ...user,
    geminiApiKey: user.geminiApiKey || undefined
  } : undefined;

  return <CreateBookClient initialBook={sanitizedBook} user={sanitizedUser} />;
}

export default function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black/95 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    }>
      <CreateBook searchParams={searchParams} />
    </Suspense>
  );
}
