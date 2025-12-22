
import { ArrowLeft, Search, Filter, Star, BookOpen, Heart } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';

// Force dynamic rendering since we are fetching data
export const dynamic = 'force-dynamic';

export default async function BooksPage() {
  // Fetch books from database
  const books = await prisma.book.findMany({
    where: { published: true },
    include: {
      author: {
        select: {
          name: true,
          username: true,
          image: true,
        }
      },
      _count: {
        select: { likes: true, pages: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  const featuredBook = books[0]; // For now, just take the latest one
  const remainingBooks = books.slice(1);

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-purple-500/30">
        {/* Background Gradients */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-900/20 via-[#020202] to-[#020202] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <Link href="/" className="group inline-flex items-center text-zinc-400 hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 group-hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Back to Home</span>
                </Link>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                            type="text" 
                            placeholder="Search by title, author, or genre..." 
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder:text-zinc-600"
                        />
                    </div>
                    <button className="p-3 bg-zinc-900/50 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Featured Section (Weekly Free Rotation style) */}
            {featuredBook && (
                <div className="mb-20">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        </div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-amber-200 to-amber-500">
                            Book of the Week
                        </h2>
                    </div>

                    <div className="group relative rounded-3xl overflow-hidden bg-zinc-900/30 border border-white/10 p-8 md:p-12">
                        {/* Ambient Background */}
                        <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center md:items-start">
                            {/* Book Cover */}
                            <div className="shrink-0 w-48 md:w-64 aspect-[2/3] relative rounded-lg shadow-2xl shadow-purple-900/20 group-hover:shadow-purple-500/20 transition-all duration-500 group-hover:-translate-y-2">
                                {featuredBook.coverImage ? (
                                    <Image 
                                        src={featuredBook.coverImage} 
                                        alt={featuredBook.title} 
                                        fill
                                        className="object-cover rounded-lg"
                                        sizes="(max-width: 768px) 192px, 256px"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-600 border border-white/5">
                                        <BookOpen className="w-12 h-12 mb-2" />
                                        <span className="text-xs uppercase tracking-widest font-medium">No Cover</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 text-center md:text-left space-y-6">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
                                        <span>Featured Selection</span>
                                    </div>
                                    
                                    <h3 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                                        {featuredBook.title}
                                    </h3>
                                    
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden relative">
                                            {featuredBook.author.image ? (
                                                <Image 
                                                    src={featuredBook.author.image} 
                                                    alt={featuredBook.author.name || ''} 
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <span className="text-xs font-bold text-zinc-400">
                                                    {(featuredBook.author.name || featuredBook.author.username || 'A').charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-lg text-zinc-300">
                                            by <span className="text-white font-medium">{featuredBook.author.name || featuredBook.author.username}</span>
                                        </p>
                                    </div>
                                </div>

                                <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl line-clamp-3 md:line-clamp-4">
                                    {featuredBook.description || "No description available for this masterpiece yet. Dive in to discover a world of imagination."}
                                </p>

                                <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                                    <Link 
                                        href={`/books/${featuredBook.id}`}
                                        className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2"
                                    >
                                        <BookOpen className="w-5 h-5" />
                                        Start Reading
                                    </Link>
                                    <button className="p-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors">
                                        <Heart className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Browse Grid */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Explore Library</h2>
                    <div className="text-sm text-zinc-500">Showing {books.length} books</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
                    {remainingBooks.map((book) => (
                        <Link href={`/books/${book.id}`} key={book.id} className="group block">
                            <div className="relative aspect-2/3 rounded-xl overflow-hidden mb-4 bg-zinc-900 shadow-lg ring-1 ring-white/10 group-hover:ring-purple-500/50 transition-all duration-300 transform group-hover:-translate-y-2">
                                {book.coverImage ? (
                                    <Image 
                                        src={book.coverImage} 
                                        alt={book.title} 
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 150px, 200px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-zinc-700 bg-linear-to-b from-zinc-800 to-zinc-900">
                                        <BookOpen className="w-8 h-8 mb-2 opacity-50" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">No Cover</span>
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                    <span className="px-4 py-2 bg-white/90 text-black text-xs font-bold rounded-full transform scale-90 group-hover:scale-100 transition-transform shadow-xl">
                                        View Details
                                    </span>
                                </div>

                                {/* Likes Overlay */}
                                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-medium text-white flex items-center gap-1 border border-white/10">
                                    <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                                    {book._count.likes}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-bold text-base text-white leading-tight line-clamp-1 group-hover:text-purple-400 transition-colors">
                                    {book.title}
                                </h3>
                                <p className="text-sm text-zinc-500 line-clamp-1">
                                    {book.author.name || book.author.username}
                                </p>
                            </div>
                        </Link>
                    ))}
                    
                    {/* Empty State placeholder if no books */}
                    {remainingBooks.length === 0 && !featuredBook && (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                <BookOpen className="w-8 h-8 text-zinc-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No books found</h3>
                            <p className="text-zinc-500">The library is currently empty. Be the first to publish!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
