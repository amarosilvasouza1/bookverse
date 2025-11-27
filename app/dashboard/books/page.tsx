import { Plus, BookOpen, FileText, CheckCircle } from 'lucide-react';
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
  
  const publishedCount = books.filter(b => b.published).length;
  const draftCount = books.filter(b => !b.published).length;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-pink-600 via-purple-600 to-indigo-600 shadow-xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative z-10 p-8 md:p-10 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Library</h1>
              <p className="text-purple-100 max-w-xl">
                Manage your masterpieces. You have <span className="font-bold text-white">{books.length} projects</span> in total.
              </p>
            </div>
            <Link 
              href="/dashboard/create-book" 
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-purple-50 transition-all hover:scale-105 active:scale-95 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Book
            </Link>
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 text-purple-200 text-xs font-medium mb-1">
                <BookOpen className="w-3 h-3" /> Total
              </div>
              <div className="text-2xl font-bold">{books.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 text-green-200 text-xs font-medium mb-1">
                <CheckCircle className="w-3 h-3" /> Published
              </div>
              <div className="text-2xl font-bold">{publishedCount}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 text-yellow-200 text-xs font-medium mb-1">
                <FileText className="w-3 h-3" /> Drafts
              </div>
              <div className="text-2xl font-bold">{draftCount}</div>
            </div>
          </div>
        </div>
      </div>

      <BookList initialBooks={books} />
    </div>
  );
}
