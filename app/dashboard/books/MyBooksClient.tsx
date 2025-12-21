'use client';

import { Plus, BookOpen, FileText, CheckCircle, Sparkles, Library } from 'lucide-react';
import Link from 'next/link';
import BookList from '@/components/BookList';
import { useLanguage } from '@/context/LanguageContext';

interface Collaborator {
  id: string;
  userId: string;
  bookId: string;
}

interface Book {
  id: string;
  title: string;
  coverImage: string | null;
  createdAt: Date;
  published: boolean;
  authorId: string;
  collaborators: Collaborator[];
}

interface MyBooksClientProps {
  books: Book[];
}

export default function MyBooksClient({ books }: MyBooksClientProps) {
  const { t } = useLanguage();
  
  const publishedCount = books.filter(b => b.published).length;
  const draftCount = books.filter(b => !b.published).length;

  return (
    <div className="space-y-8">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-linear-to-br from-violet-600 via-purple-600 to-indigo-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')] opacity-20" />
        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
        
        {/* Decorative Elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl" />
        
        <div className="relative z-10 p-6 md:p-10 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl items-center justify-center border border-white/20">
                <Library className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">{t('myLibrary')}</h1>
                <p className="text-purple-100/80 max-w-xl text-sm md:text-base">
                  {t('manageMasterpieces', { count: books.length })}
                </p>
              </div>
            </div>
            
            <Link 
              href="/dashboard/create-book" 
              className="group bg-white text-purple-600 px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              {t('createNewBook')}
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mt-8 max-w-md">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors group">
              <div className="flex items-center gap-2 text-purple-200/80 text-xs font-medium mb-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">{t('total')}</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold">{books.length}</div>
              <div className="text-purple-200/60 text-[10px] mt-1 hidden sm:block">books</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors group">
              <div className="flex items-center gap-2 text-emerald-300/80 text-xs font-medium mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{t('publishedStatus')}</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-emerald-300">{publishedCount}</div>
              <div className="text-emerald-300/60 text-[10px] mt-1 hidden sm:block">live</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors group">
              <div className="flex items-center gap-2 text-amber-300/80 text-xs font-medium mb-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">{t('draftStatus')}</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-amber-300">{draftCount}</div>
              <div className="text-amber-300/60 text-[10px] mt-1 hidden sm:block">drafts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-zinc-400">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Your Works</h2>
        </div>
        <div className="flex-1 h-px bg-linear-to-r from-white/10 to-transparent" />
      </div>

      <BookList initialBooks={books} />
    </div>
  );
}
