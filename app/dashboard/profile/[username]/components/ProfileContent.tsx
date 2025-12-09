'use client';

import { useState } from 'react';
import { BookOpen, Trophy, TrendingUp, Filter, Star, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ActivityFeed from '@/components/ActivityFeed';
import AchievementCard from '@/components/AchievementCard';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface ProfileContentProps {
  user: any;
  isOwnProfile: boolean;
}

type Tab = 'books' | 'activity' | 'achievements';

export default function ProfileContent({ user, isOwnProfile }: ProfileContentProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('books');

  const stats = [
    { label: t('booksCount'), value: user._count.books, icon: BookOpen, color: 'text-blue-400' },
    { label: t('communitiesCount'), value: user._count.communities, icon: Filter, color: 'text-purple-400' },
    { label: t('trophiesCount'), value: user._count.userAchievements, icon: Trophy, color: 'text-yellow-400' },
    { label: t('followersCount'), value: user._count.followers, icon: Star, color: 'text-pink-400' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Stats Grid - Moved here for translation support */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors group">
            <div className={`p-3 rounded-full bg-white/5 group-hover:scale-110 transition-transform ${stat.color.replace('text-', 'bg-')}/10`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-white block">{stat.value}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="glass-card p-1.5 rounded-xl bg-black/40 border border-white/5 inline-flex w-full md:w-auto overflow-x-auto">
        {[
          { id: 'books', label: t('booksCount'), icon: BookOpen },
          { id: 'activity', label: t('activity'), icon: TrendingUp },
          { id: 'achievements', label: t('achievements'), icon: Trophy },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex-1 md:flex-none px-6 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-white/10 text-white shadow-lg shadow-black/20"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-primary" : "opacity-50")} />
            {tab.label}
            {tab.id === 'books' && <span className="ml-1 opacity-50 text-xs">({user._count.books})</span>}
            {tab.id === 'achievements' && <span className="ml-1 opacity-50 text-xs">({user._count.userAchievements})</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'books' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {user.books.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.books.map((book: any, i: number) => (
                  <Link 
                    href={`/dashboard/books/${book.id}`} 
                    key={book.id}
                    className="group relative bg-black/40 rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 flex flex-col h-full"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="aspect-[2/3] relative overflow-hidden bg-zinc-900">
                      {book.coverImage ? (
                        <Image 
                          src={book.coverImage} 
                          alt={book.title} 
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors p-4 text-center">
                          <BookOpen className="w-12 h-12 text-white/20 mb-2" />
                          <span className="text-xs text-white/20">No Cover</span>
                        </div>
                      )}
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                      {book.isPremium && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md shadow-lg flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            PREMIUM
                          </span>
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                         <div className="flex items-center gap-2 text-xs text-white/70 mb-1">
                            <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] backdrop-blur-sm">{book.genre || 'Fiction'}</span>
                            <span>•</span>
                            <span>{new Date(book.createdAt).getFullYear()}</span>
                         </div>
                         <h3 className="font-bold text-lg text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                            {book.title}
                         </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-black/20 rounded-3xl border border-white/5 border-dashed">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                   <BookOpen className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('noBooksTitle')}</h3>
                <p className="text-muted-foreground max-w-sm text-center">{t('noBooksDesc')}</p>
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
                {user.userAchievements.map((ua: any, i: number) => (
                  <div key={ua.id} className="animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 50}ms` }}>
                      <AchievementCard 
                        achievement={ua.achievement} 
                        unlockedAt={ua.unlockedAt} 
                      />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-black/20 rounded-3xl border border-white/5 border-dashed">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                   <Trophy className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('noAchievementsTitle')}</h3>
                <p className="text-muted-foreground max-w-sm text-center">{t('noAchievementsDesc')}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
