'use client';

import { useState } from 'react';
import { Search, Edit, Trash, BookOpen, Loader2, BarChart, X, Users } from 'lucide-react';
import Link from 'next/link';
import { deleteBook } from '@/app/actions/delete-book';
import { createRoom } from '@/app/actions/reading-room';
import { useRouter } from 'next/navigation';
import AnalyticsDashboard from './AnalyticsDashboard';

interface Book {
  id: string;
  title: string;
  coverImage: string | null;
  createdAt: Date;
  published: boolean;
}

export default function BookList({ initialBooks }: { initialBooks: Book[] }) {
  const router = useRouter();
  const [books, setBooks] = useState(initialBooks);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
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
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) return;

    setDeletingId(id);
    try {
      const result = await deleteBook(id);
      if (result.success) {
        setBooks(books.filter(b => b.id !== id));
        router.refresh();
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Failed to delete book');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search your books..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all [&>option]:bg-black"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">No books found</p>
            <p className="text-sm mb-6">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredBooks.map((book) => (
              <div key={book.id} className="p-4 flex items-center hover:bg-white/5 transition-colors group">
                <div className="w-12 h-16 bg-gray-800 rounded mr-4 shrink-0 overflow-hidden relative">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <BookOpen className="w-6 h-6 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate text-white">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(book.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${book.published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {book.published ? 'Published' : 'Draft'}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setSelectedAnalyticsBook(book.id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-400"
                      title="View Analytics"
                    >
                      <BarChart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Start a Reading Party for this book?')) {
                          const result = await createRoom(book.id);
                          if (result.success) {
                            router.push(`/dashboard/books/${book.id}/read?roomId=${result.roomId}`);
                          } else {
                            alert('Failed to create room');
                          }
                        }
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-indigo-400"
                      title="Start Reading Party"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    <Link href={`/dashboard/create-book?id=${book.id}`} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(book.id)}
                      disabled={deletingId === book.id}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400 disabled:opacity-50"
                    >
                      {deletingId === book.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      {selectedAnalyticsBook && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart className="w-5 h-5 text-primary" />
                Book Analytics
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
