'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, Filter, BookOpen, Star, TrendingUp, ChevronDown, Users, MessageCircle, X, Sparkles, Flame, Clock } from 'lucide-react';
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

  useEffect(() => {
    setInputValue(searchParams.get('q') || '');
    setTagInput(searchParams.get('tag') || '');
    setFilter(searchParams.get('filter') || 'all');
    setSort(searchParams.get('sort') || 'newest');
    setGenre(searchParams.get('genre') || 'all');
  }, [searchParams]);

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

    fetchBooks();
  }, [searchParams, currentTab, inputValue, filter, sort, genre, tagInput]);

  useEffect(() => {
    if (currentTab === 'books') return;
    
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

  const hasActiveFilters = filter !== 'all' || genre !== 'all' || sort !== 'newest' || inputValue || tagInput;

  return (
    <div className="min-h-screen pb-20" suppressHydrationWarning>
      {/* Hero Header */}
      <div className="relative mb-8 md:mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent rounded-3xl blur-3xl -z-10" />
        
        <div className="flex flex-col gap-6 py-6 md:py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                Discover Books
              </h1>
              <p className="text-zinc-400 text-lg">Find your next favorite story from our collection</p>
            </div>
            
            {/* Search Bar - Desktop */}
            <div className="relative w-full md:w-[400px] hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search books, authors, genres..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-base focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-500"
                />
              </div>
            </div>
          </div>
          
          {/* Search Bar - Mobile */}
          <div className="relative md:hidden">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl pl-12 pr-4 py-3 text-base focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tabs with Quick Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none -mx-1 px-1">
          {[
              { id: 'books', label: 'Books', icon: BookOpen },
              { id: 'users', label: 'People', icon: Users },
              { id: 'communities', label: 'Communities', icon: MessageCircle }
          ].map(tab => (
              <button
                  key={tab.id}
                  onClick={() => updateUrl('tab', tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    currentTab === tab.id
                      ? 'bg-white text-black shadow-lg shadow-white/10'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                  }`}
              >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
              </button>
          ))}
        </div>

        {currentTab === 'books' && (
          <div className="flex items-center gap-2">
            {/* Quick Sort Pills */}
            <div className="hidden lg:flex items-center gap-2">
              {[
                { id: 'newest', label: 'New', icon: Clock },
                { id: 'popular', label: 'Hot', icon: Flame },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => handleFilterChange('sort', s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    sort === s.id 
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' 
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <s.icon className="w-3 h-3" />
                  {s.label}
                </button>
              ))}
            </div>
            
            {/* Mobile Filter Button */}
            <button 
              onClick={() => setShowMobileFilters(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                hasActiveFilters 
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-white/10 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-400" />
                Filters
              </h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Tag Filter */}
            <div className="mb-6">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Tag</label>
              <input 
                type="text" 
                placeholder="#adventure" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Price</label>
              <div className="flex gap-2">
                {['all', 'free', 'premium'].map((opt) => (
                  <button 
                    key={opt}
                    onClick={() => handleFilterChange('filter', opt)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium capitalize transition-all ${
                      filter === opt 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    {opt === 'all' ? 'All' : opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Filter */}
            <div className="mb-6">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Genre</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('genre', 'all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    genre === 'all' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-zinc-400'
                  }`}
                >
                  All
                </button>
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => handleFilterChange('genre', g)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      genre === g ? 'bg-indigo-500 text-white' : 'bg-white/5 text-zinc-400'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="mb-6">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Sort By</label>
              <select
                value={sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none"
              >
                <option value="newest" className="bg-zinc-900">Newest Arrivals</option>
                <option value="popular" className="bg-zinc-900">Most Popular</option>
                <option value="price_asc" className="bg-zinc-900">Price: Low to High</option>
                <option value="price_desc" className="bg-zinc-900">Price: High to Low</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={clearFilters}
                className="flex-1 py-3 border border-white/10 rounded-xl text-zinc-400 font-medium"
              >
                Clear All
              </button>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3 bg-indigo-600 rounded-xl text-white font-bold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        {currentTab === 'books' && (
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6 p-5 bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Refine
                </h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-indigo-400 hover:underline">
                    Reset
                  </button>
                )}
              </div>

              {/* Tag Filter */}
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Tag</label>
                <input 
                  type="text" 
                  placeholder="#adventure" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Price Filter */}
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Price</label>
                <div className="space-y-2">
                  {['all', 'free', 'premium'].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        filter === opt ? 'border-indigo-500 bg-indigo-500' : 'border-zinc-600 group-hover:border-zinc-400'
                      }`}>
                        {filter === opt && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <input type="radio" name="filter" className="hidden" checked={filter === opt} onChange={() => handleFilterChange('filter', opt)} />
                      <span className={`text-sm capitalize ${filter === opt ? 'text-white font-medium' : 'text-zinc-400'}`}>
                        {opt === 'all' ? 'All Prices' : opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Genre Filter */}
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Genre</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange('genre', 'all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      genre === 'all' ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    All
                  </button>
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      onClick={() => handleFilterChange('genre', g)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        genre === g ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Sort By</label>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                  >
                    <option value="newest" className="bg-zinc-900">Newest</option>
                    <option value="popular" className="bg-zinc-900">Popular</option>
                    <option value="price_asc" className="bg-zinc-900">Price ↑</option>
                    <option value="price_desc" className="bg-zinc-900">Price ↓</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Results */}
        <main className="flex-1 min-w-0">
          {currentTab === 'books' && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-300">
                  {loading ? 'Searching...' : `${books.length} results`}
                </h2>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="aspect-[2/3] bg-zinc-800/50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : books.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/50 rounded-3xl border border-white/5">
                  <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                    <BookOpen className="w-12 h-12 text-zinc-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No books found</h3>
                  <p className="text-zinc-400 text-center max-w-sm mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <button onClick={clearFilters} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {books.map((book) => (
                    <Link 
                      href={`/dashboard/books/${book.id}`} 
                      key={book.id}
                      className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
                    >
                      <div className="aspect-[2/3] relative overflow-hidden">
                        {book.coverImage ? (
                          <>
                            <img 
                              src={book.coverImage} 
                              alt={book.title} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-70" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                            <BookOpen className="w-16 h-16 text-zinc-600" />
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                          {book.isPremium ? (
                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider">
                              Premium
                            </span>
                          ) : (
                            <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-black text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider">
                              Free
                            </span>
                          )}
                          
                          {book.genre && (
                            <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full border border-white/10">
                              {book.genre}
                            </span>
                          )}
                        </div>

                        {/* Bottom Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-bold text-white text-base leading-tight mb-1 line-clamp-2 drop-shadow-lg">
                            {book.title}
                          </h3>
                          <p className="text-sm text-zinc-300 line-clamp-1">
                            {book.author.name || book.author.username}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-3 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-bold text-white">4.8</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {book._count.purchases > 0 && (
                            <div className="flex items-center text-xs text-zinc-500">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {book._count.purchases}
                            </div>
                          )}
                          <span className={`text-base font-bold ${book.isPremium ? 'text-white' : 'text-emerald-400'}`}>
                            {book.isPremium ? `$${book.price}` : 'Free'}
                          </span>
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
                  className="flex items-center gap-4 p-5 bg-zinc-900/50 border border-white/5 rounded-2xl hover:bg-zinc-900 hover:border-white/10 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden relative ring-2 ring-white/10">
                    {user.image ? (
                      <Image src={user.image} alt={user.username} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                      {user.name || user.username}
                    </p>
                    <p className="text-sm text-zinc-500">@{user.username}</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      {user._count.followers} followers
                    </p>
                  </div>
                </Link>
              ))}
              {(!globalResults?.users.length && !loading) && (
                <p className="text-zinc-500 col-span-full text-center py-16 bg-zinc-900/30 rounded-2xl">
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
                  className="p-6 bg-zinc-900/50 border border-white/5 rounded-2xl hover:bg-zinc-900 hover:border-white/10 transition-all group"
                >
                  <h3 className="font-bold text-white text-lg mb-2 group-hover:text-indigo-400 transition-colors">{community.name}</h3>
                  <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                    {community.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Users className="w-4 h-4" />
                    {community._count.members} members
                  </div>
                </Link>
              ))}
              {(!globalResults?.communities.length && !loading) && (
                <p className="text-zinc-500 col-span-full text-center py-16 bg-zinc-900/30 rounded-2xl">
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
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </div>
    }>
      <BrowseBooksContent />
    </Suspense>
  );
}
