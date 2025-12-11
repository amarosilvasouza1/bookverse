'use client';

import { useState, useEffect } from 'react';
import { getTopReaders, getTopAuthors } from '@/app/actions/gamification';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/UserAvatar';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Trophy, BookOpen, Star, Medal, Crown } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  xp: number;
  level: number;
  items?: { item: { rarity: string | null } }[];
  engagementScore?: number;
  totalLikes?: number;
  totalReviews?: number;
}

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'readers' | 'authors'>('readers');
  const [readers, setReaders] = useState<LeaderboardUser[]>([]);
  const [authors, setAuthors] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [readersResult, authorsResult] = await Promise.all([
        getTopReaders(20),
        getTopAuthors(20)
      ]);
      
      if (readersResult.success && readersResult.data) {
        setReaders(readersResult.data);
      }
      if (authorsResult.success && authorsResult.data) {
        setAuthors(authorsResult.data as LeaderboardUser[]);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-zinc-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-zinc-500">#{rank}</span>;
  };

  const currentList = tab === 'readers' ? readers : authors;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('leaderboard')}</h1>
          <p className="text-zinc-400">{t('leaderboardSubtitle')}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            onClick={() => setTab('readers')}
            className={cn(
              "flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2",
              tab === 'readers' ? "border-primary text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            <BookOpen className="w-4 h-4" />
            {t('topReaders')}
          </button>
          <button
            onClick={() => setTab('authors')}
            className={cn(
              "flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2",
              tab === 'authors' ? "border-primary text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Star className="w-4 h-4" />
            {t('topAuthors')}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center text-zinc-500 py-12">
            <p>{t('noDataYet')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((user, index) => (
              <Link
                key={user.id}
                href={`/dashboard/profile/${user.username}`}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01]",
                  index < 3 
                    ? "bg-gradient-to-r from-white/10 to-transparent border border-white/10" 
                    : "bg-white/5 hover:bg-white/10"
                )}
              >
                {/* Rank */}
                <div className="w-8 text-center">{getRankIcon(index + 1)}</div>
                
                {/* Avatar */}
                <UserAvatar 
                  src={user.image} 
                  alt={user.name || user.username}
                  rarity={user.items?.[0]?.item.rarity}
                  className="w-12 h-12"
                />
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{user.name || user.username}</p>
                  <p className="text-xs text-zinc-500">@{user.username}</p>
                </div>
                
                {/* Stats */}
                <div className="text-right">
                  {tab === 'readers' ? (
                    <>
                      <p className="text-lg font-bold text-white">{user.xp.toLocaleString()} XP</p>
                      <p className="text-xs text-zinc-500">Level {user.level}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-white">{user.engagementScore?.toLocaleString()}</p>
                      <p className="text-xs text-zinc-500">{user.totalLikes} ❤️ · {user.totalReviews} ⭐</p>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
