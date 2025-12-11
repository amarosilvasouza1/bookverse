'use client';

import { useState } from 'react';
import { Search, Edit, Trash, BookOpen, Loader2, BarChart, X, Users, Calendar, Filter, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';
import { deleteBook } from '@/app/actions/delete-book';
import { createRoom } from '@/app/actions/reading-room';
import { useRouter } from 'next/navigation';
import AnalyticsDashboard from './AnalyticsDashboard';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

interface Book {
  id: string;
  title: string;
  coverImage: string | null;
  createdAt: Date;
  published: boolean;
}

export default function BookList({ initialBooks }: { initialBooks: Book[] }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [books, setBooks] = useState(initialBooks);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedAnalyticsBook, setSelectedAnalyticsBook] = useState<string | null>(null);

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' 
      ? true 
      : filter === 'published' 
        ? book.published 
        : !book.published;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirmation'))) return;

    setDeletingId(id);
    try {
      const result = await deleteBook(id);
      if (result.success) {
        setBooks(books.filter(b => b.id !== id));
        router.refresh();
      } else {
        alert(result.error);
      }
    } catch {
      alert(t('failedToDelete'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Search, Filter, and View Toggle Bar */}
        <div className="flex flex-col md:flex-row gap-3 p-4 bg-linear-to-r from-white/5 to-white/[0.02] rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-black/40 border border-white/10 rounded-xl pl-10 pr-8 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all [&>option]:bg-zinc-900 cursor-pointer min-w-[160px]"
              >
                <option value="all">{t('allStatus')}</option>
                <option value="published">{t('publishedStatus')}</option>
                <option value="draft">{t('draftStatus')}</option>
              </select>
            </div>
            
            <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-primary/20 text-primary shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                title={t('gridView')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-primary/20 text-primary shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                title={t('listView')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="rounded-3xl p-12 md:p-16 text-center border border-dashed border-white/10 bg-linear-to-br from-zinc-900/50 to-black/30">
            <div className="w-20 h-20 bg-linear-to-br from-primary/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
              <BookOpen className="w-10 h-10 text-primary/70" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{t('noBooksFound')}</h3>
            <p className="text-zinc-400 mb-6 max-w-sm mx-auto">
              {t('noBooksFoundDesc')}
            </p>
            <button 
              onClick={() => { setSearch(''); setFilter('all'); }}
              className="px-6 py-2.5 bg-linear-to-r from-primary to-purple-600 text-white rounded-xl font-bold hover:from-primary/90 hover:to-purple-500 transition-all shadow-lg shadow-primary/20"
            >
              {t('clearFilters')}
            </button>
          </div>
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredBooks.map((book) => (
                <div key={book.id} className="group bg-linear-to-br from-zinc-900/90 to-zinc-950/90 rounded-2xl overflow-hidden border border-white/5 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col hover:-translate-y-1">
                  {/* Cover Image Area */}
                  <div className="relative aspect-2/3 bg-gray-800 overflow-hidden">
                    {book.coverImage ? (
                      <Image 
                        src={book.coverImage} 
                        alt={book.title} 
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-gray-800 to-gray-900 p-6 text-center">
                        <BookOpen className="w-12 h-12 text-white/10 mb-4" />
                        <span className="text-white/20 text-sm font-medium uppercase tracking-widest">{t('noCover')}</span>
                      </div>
                    )}
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-xs">
                      <Link 
                        href={`/dashboard/create-book?id=${book.id}`}
                        className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-lg"
                        title={t('editBook')}
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => setSelectedAnalyticsBook(book.id)}
                        className="p-3 bg-white/10 text-white border border-white/20 rounded-full hover:bg-white/20 hover:scale-110 transition-all backdrop-blur-md"
                        title={t('viewAnalytics')}
                      >
                        <BarChart className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md shadow-sm ${
                        book.published 
                          ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                          : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                      }`}>
                        {book.published ? t('publishedStatus') : t('draftStatus')}
                      </span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-white truncate mb-1" title={book.title}>{book.title}</h3>
                    <div className="flex items-center text-xs text-muted-foreground mb-4">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(book.createdAt).toLocaleDateString()}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
                      <button
                        onClick={async () => {
                          if (confirm(t('startReadingParty'))) {
                            const result = await createRoom(book.id);
                            if (result.success) {
                              router.push(`/dashboard/books/${book.id}/read?roomId=${result.roomId}`);
                            } else {
                              alert(t('failedToCreateRoom'));
                            }
                          }
                        }}
                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center transition-colors"
                      >
                        <Users className="w-3 h-3 mr-1" />
                        {t('readingParty')}
                      </button>

                      <button 
                        onClick={() => handleDelete(book.id)}
                        disabled={deletingId === book.id}
                        className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                        title={t('deleteBookTitle')}
                      >
                        {deletingId === book.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-white/5 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
               {filteredBooks.map((book) => (
                 <div key={book.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group">
                   <div className="w-12 h-16 relative bg-gray-800 rounded overflow-hidden shrink-0">
                      {book.coverImage ? (
                        <Image src={book.coverImage} alt={book.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white/20">
                           <BookOpen className="w-6 h-6" />
                        </div>
                      )}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                     <h3 className="font-bold text-white truncate">{book.title}</h3>
                     <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(book.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                           book.published ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                           {book.published ? t('publishedStatus') : t('draftStatus')}
                        </span>
                     </div>
                   </div>

                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/dashboard/create-book?id=${book.id}`}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                        title={t('editBook')}
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(book.id)}
                        disabled={deletingId === book.id}
                        className="p-2 bg-white/10 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-zinc-400 transition-colors"
                        title={t('deleteBookTitle')}
                      >
                         {deletingId === book.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                      </button>
                   </div>
                 </div>
               ))}
            </div>
          )
        )}
      </div>

      {/* Analytics Modal */}
      {selectedAnalyticsBook && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart className="w-5 h-5 text-primary" />
                {t('bookAnalytics')}
              </h2>
              <button 
                onClick={() => setSelectedAnalyticsBook(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <AnalyticsDashboard bookId={selectedAnalyticsBook} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
