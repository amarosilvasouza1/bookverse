'use client';

import { useState, useEffect } from 'react';
import { getTopReaders, getTopAuthors } from '@/app/actions/gamification';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/UserAvatar';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Trophy, BookOpen, Star, Medal, Crown, TrendingUp, Sparkles, ChevronDown, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const currentList = tab === 'readers' ? readers : authors;
  const topThree = currentList.slice(0, 3);
  const restOfList = currentList.slice(3);

  return (
    <div className="min-h-screen bg-black/5 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-4 rounded-[2rem] bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-yellow-400/20 blur-xl group-hover:bg-yellow-400/30 transition-all duration-700" />
            <Trophy className="w-10 h-10 text-yellow-400 relative z-10 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight bg-gradient-to-r from-white via-yellow-100 to-yellow-500/50 bg-clip-text text-transparent"
          >
            {t('leaderboard')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 max-w-md mx-auto"
          >
            {t('leaderboardSubtitle') || "Celebrate the most active members of our community"}
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
            <div className="bg-zinc-900/50 p-1 rounded-2xl border border-white/5 backdrop-blur-xl inline-flex relative">
                <TabButton 
                    isActive={tab === 'readers'} 
                    onClick={() => setTab('readers')} 
                    icon={BookOpen} 
                    label={t('topReaders')} 
                />
                <TabButton 
                    isActive={tab === 'authors'} 
                    onClick={() => setTab('authors')} 
                    icon={Star} 
                    label={t('topAuthors')} 
                />
            </div>
        </div>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-zinc-500 animate-pulse text-sm font-medium">Calculating ranks...</p>
           </div>
        ) : currentList.length === 0 ? (
          <div className="text-center text-zinc-500 py-12 bg-zinc-900/30 rounded-3xl border border-white/5">
             <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-zinc-600" />
             </div>
             <p className="font-medium">{t('noDataYet')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Podium (Top 3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
               {/* 2nd Place */}
               {topThree[1] && <PodiumCard user={topThree[1]} rank={2} tab={tab} delay={0.2} />}
               
               {/* 1st Place */}
               {topThree[0] && <PodiumCard user={topThree[0]} rank={1} tab={tab} delay={0} />}
               
               {/* 3rd Place */}
               {topThree[2] && <PodiumCard user={topThree[2]} rank={3} tab={tab} delay={0.3} />}
            </div>

            {/* Rest of the List */}
            <div className="bg-zinc-900/30 rounded-[2rem] border border-white/5 backdrop-blur-sm overflow-hidden p-2">
               {restOfList.map((user, index) => (
                  <ListRow key={user.id} user={user} rank={index + 4} tab={tab} index={index} />
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components

function TabButton({ isActive, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
        >
            {isActive && (
                <motion.div 
                    layoutId="activeTabLeaderboard"
                    className="absolute inset-0 bg-white/10 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
            <span className="relative z-10 flex items-center gap-2">
                <Icon className={cn("w-4 h-4", isActive && "text-yellow-400")} />
                {label}
            </span>
        </button>
    );
}

function PodiumCard({ user, rank, tab, delay }: any) {
    const isFirst = rank === 1;
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, duration: 0.6, type: "spring" }}
            className={cn(
                "relative flex flex-col items-center p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border backdrop-blur-xl group hover:-translate-y-2 transition-transform duration-500",
                isFirst 
                    ? "bg-gradient-to-b from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/20 z-10 order-first md:order-none shadow-[0_0_50px_rgba(234,179,8,0.1)]" 
                    : rank === 2 
                        ? "bg-zinc-900/40 border-white/10 order-first md:order-none" 
                        : "bg-zinc-900/40 border-white/10"
            )}
        >
            {/* Crown/Medal */}
            <div className="absolute -top-4 md:-top-5">
                {isFirst ? (
                    <Crown className="w-8 h-8 md:w-10 md:h-10 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-bounce" />
                ) : (
                    <div className={cn(
                        "w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm shadow-lg border",
                        rank === 2 ? "bg-zinc-300 text-zinc-900 border-white" : "bg-orange-400 text-white border-orange-300"
                    )}>
                        #{rank}
                    </div>
                )}
            </div>

            {/* Avatar */}
            <div className={cn(
                "relative mb-3 md:mb-4 rounded-full p-1",
                isFirst ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-[0_0_30px_rgba(250,204,21,0.3)]" : "bg-white/10"
            )}>
                <UserAvatar 
                    src={user.image} 
                    alt={user.name} 
                    size={isFirst ? 80 : 64} // Reduced default size for mobile (was implied larger effectively via w- classes)
                    rarity={user.items?.[0]?.item.rarity}
                    className={cn(
                        isFirst ? "w-20 h-20 md:w-24 md:h-24" : "w-16 h-16 md:w-20 md:h-20"
                    )}
                />
            </div>

            <Link href={`/dashboard/profile/${user.username}`} className="text-center group-hover:opacity-80 transition-opacity w-full">
                <h3 className={cn("font-bold truncate max-w-[120px] md:max-w-[150px] mx-auto", isFirst ? "text-sm md:text-lg text-white" : "text-sm md:text-base text-zinc-200")}>
                    {user.name || user.username}
                </h3>
                <p className="text-[10px] md:text-xs text-zinc-500 truncate">@{user.username}</p>
            </Link>

            <div className="mt-3 md:mt-4 flex flex-col items-center">
                {tab === 'readers' ? (
                    <>
                        <div className={cn("text-base md:text-xl font-black tabular-nums tracking-wide", isFirst ? "text-yellow-400" : "text-white")}>
                            {user.xp.toLocaleString()} <span className="text-[10px] md:text-xs font-normal opacity-70">XP</span>
                        </div>
                        <div className="text-[10px] md:text-xs font-medium text-zinc-500 px-2 py-0.5 rounded-full bg-white/5 mt-1 border border-white/5">
                            Lvl {user.level}
                        </div>
                    </>
                ) : (
                    <>
                         <div className={cn("text-base md:text-xl font-black tabular-nums tracking-wide", isFirst ? "text-yellow-400" : "text-white")}>
                            {user.engagementScore?.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] md:text-xs text-zinc-500 mt-1">
                            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Score</span>
                        </div>
                    </>
                )}
            </div>
            
            {/* Decorative Glow */}
            {isFirst && <div className="absolute inset-x-0 bottom-0 h-24 md:h-32 bg-gradient-to-t from-yellow-500/10 to-transparent pointer-events-none rounded-b-[1.5rem] md:rounded-b-[2rem]" />}
        </motion.div>
    );
}

function ListRow({ user, rank, tab, index }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
        >
            <Link
                href={`/dashboard/profile/${user.username}`}
                className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all group"
            >
                <div className="w-8 font-bold text-zinc-600 text-center font-mono">#{rank}</div>
                
                <UserAvatar 
                    src={user.image} 
                    alt={user.name || user.username}
                    rarity={user.items?.[0]?.item.rarity}
                    className="w-12 h-12 border border-white/5"
                />
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-zinc-200 group-hover:text-white transition-colors truncate">
                            {user.name || user.username}
                        </h4>
                        {user.items?.[0]?.item.rarity === 'LEGENDARY' && (
                            <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
                        )}
                    </div>
                    <p className="text-xs text-zinc-500">@{user.username}</p>
                </div>
                
                <div className="text-right">
                     {tab === 'readers' ? (
                        <div className="font-bold text-white tabular-nums">{user.xp.toLocaleString()} <span className="text-zinc-600 text-xs font-normal">XP</span></div>
                     ) : (
                        <div className="font-bold text-white tabular-nums">{user.engagementScore?.toLocaleString()}</div>
                     )}
                </div>
            </Link>
        </motion.div>
    );
}
