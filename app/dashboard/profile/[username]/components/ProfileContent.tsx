'use client';

import { useState } from 'react';
import { BookOpen, Trophy, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ActivityFeed from '@/components/ActivityFeed';
import AchievementCard from '@/components/AchievementCard';

interface ProfileContentProps {
  user: any; // Using any for now to avoid complex type duplication, can refine later
  isOwnProfile: boolean;
}

type Tab = 'books' | 'activity' | 'achievements';

export default function ProfileContent({ user, isOwnProfile }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>('books');

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'books'
              ? 'bg-white/10 text-white border-b-2 border-primary'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Books
          <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-xs">{user._count.books}</span>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'activity'
              ? 'bg-white/10 text-white border-b-2 border-indigo-500'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Activity
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'achievements'
              ? 'bg-white/10 text-white border-b-2 border-yellow-500'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Achievements
          <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-xs">{user._count.userAchievements}</span>
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'books' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {user.books.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.books.map((book: any) => (
                  <Link 
                    href={`/dashboard/books/${book.id}`} 
                    key={book.id}
                    className="group relative bg-white/5 rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
                  >
                    <div className="aspect-2/3 relative overflow-hidden">
                      {book.coverImage ? (
                        <div className="relative w-full h-full">
                          <Image 
                            src={book.coverImage} 
                            alt={book.title} 
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110" 
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors">
                          <BookOpen className="w-12 h-12 text-white/20" />
                        </div>
                      )}
                      
                      {book.isPremium && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-amber-500/90 text-black text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm shadow-lg">
                            PREMIUM
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg text-white truncate mb-1 group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm mt-3">
                        <span className="text-muted-foreground">{book.genre || 'Fiction'}</span>
                        <span className="font-bold text-white">
                          {book.isPremium ? `$${book.price}` : 'Free'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-xl border border-white/5">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No books published yet</h3>
                <p className="text-muted-foreground">This author hasn&apos;t published any books yet.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'activity' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ActivityFeed userId={user.id} />
          </section>
        )}

        {activeTab === 'achievements' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {user.userAchievements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.userAchievements.map((ua: any) => (
                  <AchievementCard 
                    key={ua.id} 
                    achievement={ua.achievement} 
                    unlockedAt={ua.unlockedAt} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-xl border border-white/5">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No achievements yet</h3>
                <p className="text-muted-foreground">This author hasn&apos;t unlocked any achievements yet.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
