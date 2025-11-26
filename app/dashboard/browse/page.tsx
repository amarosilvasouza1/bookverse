'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, Filter, BookOpen, Star, DollarSign, TrendingUp, X, ChevronDown } from 'lucide-react';
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

const GENRES = [
  'Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Mystery', 
  'Romance', 'Horror', 'Self-Help', 'Business', 'History'
];

function BrowseBooksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all'); // all, premium, free
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'all');

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('q', search);
        if (filter !== 'all') params.append('filter', filter);
        if (sort !== 'newest') params.append('sort', sort);
        if (genre !== 'all') params.append('genre', genre);

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

    const timeoutId = setTimeout(() => {
      fetchBooks();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, filter, sort, genre]);

  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all' && value !== 'newest') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/browse?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'filter') setFilter(value);
    if (key === 'sort') setSort(value);
    if (key === 'genre') setGenre(value);
    updateUrl(key, value);
  };

  const clearFilters = () => {
    setSearch('');
    setFilter('all');
    setSort('newest');
    setGenre('all');
    router.push('/dashboard/browse');
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Browse Books</h1>
          <p className="text-zinc-400">Discover your next favorite story</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search titles, authors, genres..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              updateUrl('q', e.target.value);
            }}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-white/10 rounded-xl font-medium"
        >
          <Filter className="w-4 h-4" /> Filters
        </button>

        {/* Sidebar Filters */}
        <aside className={`lg:w-64 space-y-8 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="space-y-6 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-400" /> Filters
              </h3>
              {(filter !== 'all' || genre !== 'all' || sort !== 'newest') && (
                <button onClick={clearFilters} className="text-xs text-indigo-400 hover:underline">
                  Reset
                </button>
              )}
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Price</label>
              <div className="space-y-2">
                {['all', 'free', 'premium'].map((opt) => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${filter === opt ? 'border-indigo-500 bg-indigo-500/20' : 'border-zinc-700 group-hover:border-zinc-500'}`}>
                      {filter === opt && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                    </div>
                    <input 
                      type="radio" 
                      name="filter" 
                      className="hidden" 
                      checked={filter === opt} 
                      onChange={() => handleFilterChange('filter', opt)} 
                    />
                    <span className={`text-sm capitalize ${filter === opt ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                      {opt === 'all' ? 'All Prices' : opt}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Genre Filter */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Genre</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('genre', 'all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${genre === 'all' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-white/5 border-transparent text-zinc-400 hover:bg-white/10'}`}
                >
                  All
                </button>
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => handleFilterChange('genre', g)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${genre === g ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-white/5 border-transparent text-zinc-400 hover:bg-white/10'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Sort By</label>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
                >
                  <option value="newest" className="bg-zinc-900">Newest Arrivals</option>
                  <option value="popular" className="bg-zinc-900">Most Popular</option>
                  <option value="price_asc" className="bg-zinc-900">Price: Low to High</option>
                  <option value="price_desc" className="bg-zinc-900">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <main className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {loading ? 'Loading...' : `${books.length} Books Found`}
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No books found</h3>
              <p className="text-zinc-400 text-center max-w-sm mb-6">
                We couldn't find any books matching your criteria. Try adjusting your filters or search terms.
              </p>
              <button 
                onClick={clearFilters}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {books.map((book) => (
                <Link 
                  href={`/dashboard/books/${book.id}`} 
                  key={book.id}
                  className="group relative bg-[#0f0f11] rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col"
                >
                  <div className="aspect-[2/3] relative overflow-hidden bg-zinc-900">
                    {book.coverImage ? (
                      <div className="relative w-full h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={book.coverImage} 
                          alt={book.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                        <BookOpen className="w-16 h-16 text-zinc-600" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                      {book.isPremium ? (
                        <span className="bg-amber-500/90 text-black text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm shadow-lg uppercase tracking-wider">
                          Premium
                        </span>
                      ) : (
                        <span className="bg-emerald-500/90 text-black text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm shadow-lg uppercase tracking-wider">
                          Free
                        </span>
                      )}
                      
                      {book.genre && (
                        <span className="bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur-md border border-white/10">
                          {book.genre}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-white leading-tight mb-1 group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4 line-clamp-1">
                      by {book.author.name || book.author.username}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold text-white">4.8</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {book._count.purchases > 0 && (
                          <div className="flex items-center text-xs text-zinc-500">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {book._count.purchases}
                          </div>
                        )}
                        <span className={`text-lg font-bold ${book.isPremium ? 'text-white' : 'text-emerald-400'}`}>
                          {book.isPremium ? `$${book.price}` : 'Free'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function BrowseBooksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <BrowseBooksContent />
    </Suspense>
  );
}
