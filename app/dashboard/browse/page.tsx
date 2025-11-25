'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, Filter, BookOpen, Star, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

interface Book {
  id: string;
  title: string;
  coverImage: string | null;
  author: {
    name: string | null;
    username: string;
  };
  price: number;
  isPremium: boolean;
  genre: string | null;
  _count: {
    purchases: number;
  };
}

function BrowseBooksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all'); // all, premium, free
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest'); // newest, popular, price_asc, price_desc

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('q', search);
        if (filter !== 'all') params.append('filter', filter);
        if (sort !== 'newest') params.append('sort', sort);

        const response = await fetch(`/api/books/browse?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setBooks(data);
        }
      } catch (error) {
        console.error('Failed to fetch books', error);
      } finally {
        setLoading(false);
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchBooks();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, filter, sort]);

  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all' && value !== 'newest') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/browse?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Browse Books</h1>
        <p className="text-muted-foreground">Discover your next favorite story.</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, author, or genre..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              updateUrl('q', e.target.value);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              updateUrl('filter', e.target.value);
            }}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 transition-colors [&>option]:bg-zinc-900"
          >
            <option value="all">All Prices</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              updateUrl('sort', e.target.value);
            }}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 transition-colors [&>option]:bg-zinc-900"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-2/3 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No books found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <Link 
              href={`/dashboard/books/${book.id}`} 
              key={book.id}
              className="group relative bg-white/5 rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="aspect-2/3 relative overflow-hidden">
                {book.coverImage ? (
                  <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors">
                    <BookOpen className="w-12 h-12 text-white/20" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {book.isPremium && (
                    <span className="bg-amber-500/90 text-black text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm shadow-lg">
                      PREMIUM
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg text-white truncate mb-1 group-hover:text-primary transition-colors">
                  {book.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate mb-3">
                  by <span className="hover:text-primary transition-colors hover:underline relative z-10" onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/dashboard/profile/${book.author.username}`;
                  }}>
                    {book.author.name || book.author.username}
                  </span>
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span className="font-medium">4.8</span>
                  </div>
                  <div className="font-bold text-white">
                    {book.isPremium ? `$${book.price}` : 'Free'}
                  </div>
                </div>
                
                {book._count.purchases > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3 mr-1.5 text-green-400" />
                    {book._count.purchases} reads
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrowseBooksPage() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="aspect-2/3 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    }>
      <BrowseBooksContent />
    </Suspense>
  );
}
