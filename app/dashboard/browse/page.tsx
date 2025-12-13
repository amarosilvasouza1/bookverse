'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, Filter, BookOpen, Star, TrendingUp, ChevronDown, Users, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchGlobal, SearchResult } from '@/app/actions/search';
import Image from 'next/image';

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

  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all'); 
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'all');

  const [tagInput, setTagInput] = useState(searchParams.get('tag') || '');
  const currentTab = searchParams.get('tab') || 'books';

  const [globalResults, setGlobalResults] = useState<SearchResult | null>(null);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
    // Immediate update for selects/buttons
    if (key === 'filter') setFilter(value);
    if (key === 'sort') setSort(value);
    if (key === 'genre') setGenre(value);
    updateUrl(key, value);
  };

  const clearFilters = () => {
    setInputValue('');
    setTagInput('');
    setFilter('all');
    setSort('newest');
    setGenre('all');
    router.push('/dashboard/browse');
  };

  // Sync URL params to local state on load/nav
  useEffect(() => {
    setInputValue(searchParams.get('q') || '');
    setTagInput(searchParams.get('tag') || '');
    setFilter(searchParams.get('filter') || 'all');
    setSort(searchParams.get('sort') || 'newest');
    setGenre(searchParams.get('genre') || 'all');
  }, [searchParams]);

  // Debounce Search & Tag Input
  useEffect(() => {
    const timer = setTimeout(() => {
        if (inputValue !== (searchParams.get('q') || '')) {
            updateUrl('q', inputValue);
        }
        if (tagInput !== (searchParams.get('tag') || '')) {
            updateUrl('tag', tagInput);
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue, tagInput]);


  // Fetch Books (Only if tab is books)
  useEffect(() => {
    if (currentTab !== 'books') return;

    async function fetchBooks() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (inputValue) params.append('q', inputValue);
        if (filter !== 'all') params.append('filter', filter);
        if (sort !== 'newest') params.append('sort', sort);
        if (genre !== 'all') params.append('genre', genre);
        if (tagInput) params.append('tag', tagInput);

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

    // Call fetch immediately since URL changes are debounced
    fetchBooks();
  }, [searchParams, currentTab, inputValue, filter, sort, genre, tagInput]);

  // Fetch Global Search (Users/Communities)
  useEffect(() => {
    if (currentTab === 'books') return;
    
    // Only search if we have query > 1 char
    if (inputValue.length < 2) {
       setGlobalResults(null);
       return;
    }

    const timer = setTimeout(async () => {
       setLoading(true);
       try {
         const res = await searchGlobal(inputValue);
         setGlobalResults(res);
       } catch (e) {
         console.error(e);
       } finally {
         setLoading(false);
       }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue, currentTab]);



  return (
    <div className="min-h-screen pb-20" suppressHydrationWarning>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Browse Books</h1>
          <p className="text-zinc-400">Discover your next favorite story</p>
        </div>
        
        <div className="relative w-full md:w-96" suppressHydrationWarning>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search titles, authors, genres..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {[
            { id: 'books', label: 'Books', icon: BookOpen },
            { id: 'users', label: 'People', icon: Users },
            { id: 'communities', label: 'Communities', icon: MessageCircle }
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => updateUrl('tab', tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  currentTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
            >
                <tab.icon className="w-4 h-4" />
                {tab.label}
            </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {currentTab === 'books' && (
          <>
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
              {(filter !== 'all' || genre !== 'all' || sort !== 'newest' || inputValue || tagInput) && (
                <button onClick={clearFilters} className="text-xs text-indigo-400 hover:underline">
                  Reset
                </button>
              )}
            </div>

            {/* Tag Filter */}
             <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tag</label>
              <input 
                type="text" 
                placeholder="#adventure" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
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
          </>
        )}

        {/* Results Grid */}
        <main className="flex-1">
          {currentTab === 'books' && (
            <>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {loading ? 'Loading...' : `${books.length} Books Found`}
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-2/3 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No books found</h3>
              <p className="text-zinc-400 text-center max-w-sm mb-6">
                We couldn t find any books matching your criteria. Try adjusting your filters or search terms.
              </p>
              <button 
                onClick={clearFilters}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {books.map((book) => (
                <Link 
                  href={`/dashboard/books/${book.id}`} 
                  key={book.id}
                  className="group relative bg-[#0f0f11] rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col"
                >
                  <div className="aspect-2/3 relative overflow-hidden bg-zinc-900">
                    {book.coverImage ? (
                      <div className="relative w-full h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={book.coverImage} 
                          alt={book.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
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
            </>
          )}
          
          {/* Users Grid */}
          {currentTab === 'users' && (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {globalResults?.users.map(user => (
                    <Link
                      key={user.id}
                      href={`/dashboard/profile/${user.username}`}
                      className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden relative border border-white/10">
                        {user.image ? (
                          <Image src={user.image} alt={user.username} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {user.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {user.name || user.username}
                        </p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {user._count.followers} followers
                        </p>
                      </div>
                    </Link>
                 ))}
                 {(!globalResults?.users.length && !loading) && (
                     <p className="text-zinc-500 col-span-full text-center py-10">
                        {inputValue.length < 2 ? 'Type to search people...' : 'No users found.'}
                     </p>
                 )}
             </div>
          )}

          {/* Communities Grid */}
          {currentTab === 'communities' && (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {globalResults?.communities.map(community => (
                    <Link
                      key={community.id}
                      href={`/dashboard/communities/${community.id}`}
                      className="p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex flex-col justify-between h-full"
                    >
                      <div>
                        <h3 className="font-bold text-white mb-2">{community.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {community.description || 'No description'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Users className="w-3 h-3" />
                        {community._count.members} members
                      </div>
                    </Link>
                 ))}
                 {(!globalResults?.communities.length && !loading) && (
                     <p className="text-zinc-500 col-span-full text-center py-10">
                        {inputValue.length < 2 ? 'Type to search communities...' : 'No communities found.'}
                     </p>
                 )}
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
