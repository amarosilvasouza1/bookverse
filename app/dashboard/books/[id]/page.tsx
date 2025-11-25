import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { BookReader } from '@/components/BookReader';

async function getBook(id: string) {
  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          name: true,
          username: true,
        }
      },
      pages: {
        orderBy: {
          pageNumber: 'asc'
        }
      }
    }
  });

  if (!book) return null;
  return book;
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const book = await getBook(id);

  if (!book) {
    notFound();
  }

  // Check if user has access (is author or purchased or free)
  const isAuthor = session?.id === book.authorId;
  const hasPurchased = session ? await prisma.purchase.findFirst({
    where: {
      bookId: id,
      buyerId: session.id,
    }
  }) : false;

  const subscription = session ? await prisma.subscription.findUnique({
    where: { userId: session.id },
  }) : null;

  const hasSubscription = subscription?.status === 'ACTIVE' && subscription?.endDate > new Date();

  const canRead = !book.isPremium || isAuthor || hasPurchased || hasSubscription;

  return (
    <div className="max-w-4xl mx-auto">
      <BookReader 
        book={book} 
        canRead={!!canRead} 
        isAuthor={isAuthor}
      />
    </div>
  );
}
