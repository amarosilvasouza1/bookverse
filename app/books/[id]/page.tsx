
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Lock, LogIn } from 'lucide-react';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function BookDetailsPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: {
          name: true,
          username: true,
          image: true,
        },
      },
      pages: {
        orderBy: { pageNumber: 'asc' },
        take: 1, 
      },
      _count: {
        select: { likes: true, pages: true },
      },
    },
  });

  if (!book) {
    notFound();
  }

  const firstPage = book.pages[0];

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-purple-500/30 font-sans">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-900/20 via-[#020202] to-[#020202] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/books" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Browsing</span>
          </Link>
          
          {!session && (
             <Link href="/login" className="px-4 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2">
               <LogIn className="w-4 h-4" />
               Login
             </Link>
          )}
        </div>
      </nav>

      <main className="relative z-10 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Book Header */}
        <div className="text-center mb-16 space-y-6">
           {book.coverImage && (
             <div className="w-48 h-72 mx-auto relative rounded-xl shadow-2xl shadow-purple-900/30 mb-8 border border-white/10 group overflow-hidden">
                <Image 
                  src={book.coverImage} 
                  alt={book.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
             </div>
           )}

           <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-linear-to-b from-white to-zinc-400">
             {book.title}
           </h1>

           <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 relative overflow-hidden">
                {book.author.image ? (
                   <Image src={book.author.image} alt={book.author.name || ''} fill className="object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold">
                      {(book.author.name || book.author.username || 'A').charAt(0).toUpperCase()}
                   </div>
                )}
              </div>
              <div className="text-left">
                 <p className="text-sm text-zinc-500">Written by</p>
                 <p className="font-medium text-white">{book.author.name || book.author.username}</p>
              </div>
           </div>
        </div>

        {/* First Page Preview */}
        <div className="relative bg-zinc-900/30 border border-white/5 rounded-2xl p-8 md:p-12 shadow-2xl backdrop-blur-xs">
           <div className="prose prose-invert prose-lg max-w-none">
              <h2 className="text-2xl font-bold mb-8 text-zinc-200">
                {firstPage?.title || `Page 1`}
              </h2>
              
              <div dangerouslySetInnerHTML={{ __html: firstPage?.content || '<p>No content available for this preview.</p>' }} />
              
              {/* Blur Fade for Content */}
              {firstPage?.content && (
                  <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-[#020202] via-[#020202]/90 to-transparent flex items-end justify-center pb-12 rounded-b-2xl" />
              )}
           </div>

           {/* Call to Action Overlay */}
           <div className="absolute inset-x-0 bottom-12 flex flex-col items-center justify-center gap-4 z-20">
              <Lock className="w-12 h-12 text-zinc-500 mb-2" />
              <h3 className="text-2xl font-bold text-white text-center">
                 Want to keep reading?
              </h3>
              <p className="text-zinc-400 text-center max-w-md mb-4 px-4">
                 Sign in to access the full book, save your progress, and join the community discussion.
              </p>
              
              {session ? (
                 <Link 
                   href={`/dashboard/books/${book.id}`}
                   className="px-8 py-4 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-500 transition-all hover:scale-105 shadow-xl shadow-purple-900/20 flex items-center gap-2"
                 >
                   <BookOpen className="w-5 h-5" />
                   Continue Reading
                 </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
                   <Link 
                     href="/login"
                     className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-2"
                   >
                     <LogIn className="w-5 h-5" />
                     Login to Read
                   </Link>
                   <Link 
                     href="/register"
                     className="px-8 py-4 bg-zinc-800 text-white border border-white/10 rounded-full font-bold hover:bg-zinc-700 transition-all hover:scale-105 flex items-center justify-center gap-2"
                   >
                     Create Account
                   </Link>
                </div>
              )}
           </div>
        </div>
        
        {/* Book Details Footer */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
           <div className="p-4 rounded-xl bg-zinc-900/20 border border-white/5">
              <p className="text-zinc-500 text-sm uppercase tracking-wider mb-1">Length</p>
              <p className="text-xl font-bold text-white">{book._count.pages} Pages</p>
           </div>
           <div className="p-4 rounded-xl bg-zinc-900/20 border border-white/5">
              <p className="text-zinc-500 text-sm uppercase tracking-wider mb-1">Likes</p>
              <p className="text-xl font-bold text-white">{book._count.likes}</p>
           </div>
            <div className="p-4 rounded-xl bg-zinc-900/20 border border-white/5">
              <p className="text-zinc-500 text-sm uppercase tracking-wider mb-1">Published</p>
              <p className="text-xl font-bold text-white">{book.createdAt.getFullYear()}</p>
           </div>
           <div className="p-4 rounded-xl bg-zinc-900/20 border border-white/5">
              <p className="text-zinc-500 text-sm uppercase tracking-wider mb-1">Genre</p>
              <p className="text-xl font-bold text-white">Fiction</p>
           </div>
        </div>

      </main>
    </div>
  );
}
