'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Users, DollarSign, TrendingUp, Sparkles, ArrowRight, Star, PenTool, Plus, BookMarked, MessageSquare, ChevronRight } from 'lucide-react';
import ActivityFeed from '@/components/ActivityFeed';
import { useLanguage } from '@/context/LanguageContext';
import UserAvatar from '@/components/UserAvatar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Book {
  id: string;
  title: string;
  coverImage: string | null;
  published: boolean;
  createdAt: Date;
  description: string | null;
}

interface DashboardContentProps {
  userName: string;
  userImage: string | null;
  equippedFrame: {
    rarity: string;
  } | null;
  stats: {
    booksCount: number;
    communitiesCount: number;
    totalEarnings: number;
    recentBooks: Book[];
  };
  tags?: string | null;
}

const containerVars = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { 
            staggerChildren: 0.1 
        } 
    }
};

const itemVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function DashboardContent({ userName, userImage, equippedFrame, stats, tags }: DashboardContentProps) {
  const { t } = useLanguage();

  return (
    <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="visible"
        className="space-y-8 pb-12"
    >
      {/* Welcome Section - Cleaner Version */}
      <motion.div variants={itemVars} className="relative overflow-hidden rounded-[2rem] bg-zinc-900 border border-white/10 shadow-2xl">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

         <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  <div className="relative">
                     <UserAvatar 
                        src={userImage} 
                        alt={userName} 
                        size={100}
                        rarity={equippedFrame?.rarity}
                        className="w-24 h-24 sm:w-28 sm:h-28 shadow-xl ring-4 ring-zinc-800"
                     />
                     <div className="absolute -bottom-2 -right-2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        PRO
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                        {tags?.includes('DEV') && <Badge text="DEV" color="bg-blue-500/10 text-blue-400 border-blue-500/20" />}
                        {tags?.includes('BETA') && <Badge text="BETA" color="bg-yellow-500/10 text-yellow-400 border-yellow-500/20" />}
                     </div>
                     
                     <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                        {t('welcomeBack', { name: userName })}
                     </h1>
                     <p className="text-zinc-400 text-sm sm:text-base max-w-xl">
                        {t('readyToCreate', { books: stats.booksCount, communities: stats.communitiesCount })}
                     </p>
                  </div>
               </div>

               <Link 
                  href="/dashboard/create-book"
                  className="group px-6 py-3 bg-white text-black font-bold rounded-xl shadow-lg shadow-white/5 hover:shadow-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
               >
                  <span className="flex items-center gap-2">
                     <PenTool className="w-4 h-4" />
                     {t('writeNewBook')}
                  </span>
               </Link>
            </div>
         </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
         <StatsCard 
            title={t('totalBooksPublished')}
            value={stats.booksCount.toString()}
            icon={BookOpen}
            trend="+2 This Month"
            color="blue"
            delay={0.1}
         />
         <StatsCard 
            title={t('communitiesJoined')}
            value={stats.communitiesCount.toString()}
            icon={Users}
            trend={t('active')}
            color="purple"
            delay={0.2}
         />
         <StatsCard 
            title={t('totalRevenue')}
            value={`$${stats.totalEarnings.toFixed(2)}`}
            icon={DollarSign}
            trend="+12%"
            color="emerald"
            delay={0.3}
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
         {/* Recent Books */}
         <motion.div variants={itemVars} className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-1">
               <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 rounded-xl border border-pink-500/20">
                     <BookOpen className="w-5 h-5 text-pink-500" />
                  </div>
                  {t('recentProjects')}
               </h2>
               <Link href="/dashboard/books" className="text-sm font-medium text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1 group">
                  {t('viewAll')}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <Link 
                  href="/dashboard/create-book" 
                  className="group flex flex-col items-center justify-center min-h-[160px] rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-purple-500/50 transition-all duration-300"
               >
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300 mb-3">
                     <Plus className="w-6 h-6 text-zinc-500 group-hover:text-purple-400" />
                  </div>
                  <span className="font-semibold text-zinc-400 group-hover:text-white transition-colors">{t('createNewBook')}</span>
               </Link>

               {stats.recentBooks.length > 0 && stats.recentBooks.map((book) => (
                  <BookCard key={book.id} book={book} t={t} />
               ))}
            </div>
         </motion.div>

         {/* Quick Actions & Feed */}
         <motion.div variants={itemVars} className="space-y-6">
            <div className="flex items-center gap-3 px-1 mb-2">
               <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
               </div>
               <h2 className="text-lg font-bold text-white">{t('quickActions')}</h2>
            </div>
            
            <div className="space-y-3">
               <QuickAction 
                  href="/dashboard/reading-lists" 
                  icon={BookMarked} 
                  title={t('readingLists') || 'Reading Lists'} 
                  subtitle="Collections"
                  color="indigo" 
               />
               <QuickAction 
                  href="/dashboard/communities" 
                  icon={Users} 
                  title={t('joinCommunity')} 
                  subtitle="Connect"
                  color="purple" 
               />
               <QuickAction 
                  href="/dashboard/wallet" 
                  icon={DollarSign} 
                  title={t('wallet')} 
                  subtitle="Earnings"
                  color="emerald" 
               />
            </div>

            <div className="rounded-[2rem] bg-zinc-900/30 border border-white/5 backdrop-blur-xl p-6">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                     <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-white">{t('communityActivity')}</h3>
               </div>
               <ActivityFeed />
            </div>
         </motion.div>
      </div>
    </motion.div>
  );
}

// Sub-components
function Badge({ text, color }: { text: string, color: string }) {
   return <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider", color)}>{text}</span>;
}

function StatsCard({ title, value, icon: Icon, trend, color, delay }: any) {
   const colors: any = {
      blue: "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/20",
      purple: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/20",
      emerald: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/20",
   };

   return (
      <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ delay, duration: 0.4 }}
         className="relative group p-6 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1"
      >
         <div className="flex items-start justify-between mb-4">
            <div className={cn("p-3 rounded-2xl bg-gradient-to-br border", colors[color])}>
               <Icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-zinc-400 group-hover:bg-white/10 transition-colors">
               {trend}
            </span>
         </div>
         <div>
            <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</h3>
            <p className="text-sm text-zinc-500 font-medium">{title}</p>
         </div>
      </motion.div>
   );
}

function BookCard({ book, t }: any) {
   return (
      <Link href={`/dashboard/create-book?id=${book.id}`} className="group relative overflow-hidden rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-purple-500/30 transition-all hover:bg-zinc-900/60">
         <div className="flex sm:block h-full">
            <div className="w-24 sm:w-full h-full sm:h-32 bg-zinc-800 relative overflow-hidden">
               {book.coverImage ? (
                  <Image src={book.coverImage} alt={book.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
               ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                     <BookOpen className="w-8 h-8 text-white/10 group-hover:text-purple-400/50 transition-colors" />
                  </div>
               )}
            </div>
            <div className="p-4 flex-1 flex flex-col justify-center">
               <h3 className="font-bold text-base text-white truncate mb-1 group-hover:text-purple-400 transition-colors">{book.title}</h3>
               <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed">{book.description || t('noDescription')}</p>
               <div className="mt-auto flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", book.published ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]")} />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{book.published ? t('published') : t('draft')}</span>
               </div>
            </div>
         </div>
      </Link>
   );
}

function QuickAction({ href, icon: Icon, title, subtitle, color }: any) {
   const colors: any = {
      indigo: "group-hover:text-indigo-400 group-hover:bg-indigo-500/20",
      purple: "group-hover:text-purple-400 group-hover:bg-purple-500/20",
      emerald: "group-hover:text-emerald-400 group-hover:bg-emerald-500/20",
   };

   return (
      <Link href={href} className="group flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/30 border border-white/5 hover:bg-white/5 transition-all">
         <div className={cn("p-3 rounded-xl bg-white/5 text-zinc-400 transition-all duration-300", colors[color])}>
            <Icon className="w-5 h-5" />
         </div>
         <div className="flex-1">
            <h4 className="font-bold text-white text-sm group-hover:text-white transition-colors">{title}</h4>
            <p className="text-xs text-zinc-500">{subtitle}</p>
         </div>
         <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
      </Link>
   );
}
