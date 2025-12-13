import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { BookReader } from '@/components/BookReader';
import { ReviewSection } from '@/components/ReviewSection';

async function getBook(id: string) {
  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          name: true,
          username: true,
          image: true,
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
      buyerId: session.id as string,
    }
  }) : false;

  const subscription = session ? await prisma.subscription.findUnique({
    where: { userId: session.id as string },
  }) : null;

  const hasSubscription = subscription?.status === 'ACTIVE' && subscription?.endDate > new Date();

  const canRead = !book.isPremium || isAuthor || hasPurchased || hasSubscription;

  const listsContainingBook = session ? await prisma.readingList.findMany({
    where: {
      userId: session.id as string,
      books: { some: { bookId: id } }
    },
    select: { id: true }
  }).then(lists => lists.map(l => l.id)) : [];

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <BookReader 
        book={{
          ...book,
          pages: book.pages.map(page => ({
            ...page,
            scheduledAt: page.scheduledAt ? page.scheduledAt.toISOString() : null
          }))
        }} 
        canRead={!!canRead} 
        isAuthor={isAuthor}
        isSubscriber={!!hasSubscription}
        listsContainingBook={listsContainingBook}
      />
      
      <div className="px-6 space-y-8">
        {/* Author Section */}
        <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden border-2 border-white/10 shrink-0" suppressHydrationWarning>
              {book.author.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={book.author.image} alt={book.author.name || book.author.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-500/20 text-indigo-500 text-xl font-bold">
                  {(book.author.name || book.author.username)[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{book.author.name || book.author.username}</h3>
              <p className="text-zinc-400 text-sm">@{book.author.username}</p>
            </div>
          </div>
          
          <a 
            href={`/dashboard/profile/${book.author.username}`}
            className="w-full sm:w-auto px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors text-sm flex items-center justify-center"
          >
            View Profile
          </a>
        </div>

        <ReviewSection bookId={book.id} />
      </div>
    </div>
  );
}
