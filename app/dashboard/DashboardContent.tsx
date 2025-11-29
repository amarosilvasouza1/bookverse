'use client';


import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Users, DollarSign, TrendingUp, Sparkles, ArrowRight, Star, PenTool, Plus, ShoppingBag } from 'lucide-react';
import ActivityFeed from '@/components/ActivityFeed';
import { useLanguage } from '@/context/LanguageContext';
import UserAvatar from '@/components/UserAvatar';


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

export default function DashboardContent({ userName, userImage, equippedFrame, stats, tags }: DashboardContentProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-0 right-0 p-12 opacity-30">
          <Sparkles className="w-64 h-64 text-white blur-3xl" />
        </div>
        
        <div className="relative z-10 p-6 md:p-10 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
              <UserAvatar 
                src={userImage} 
                alt={userName} 
                size={96} // 24 * 4 = 96px (w-24)
                rarity={equippedFrame?.rarity}
                className="md:w-24 md:h-24 w-20 h-20"
              />
              
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 border border-white/20 text-xs md:text-sm font-medium backdrop-blur-md mb-3">
                  <Star className="w-3 h-3 md:w-4 md:h-4 mr-2 text-yellow-300 fill-yellow-300" />
                  {t('premiumAuthorDashboard')}
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h1 className={`text-2xl md:text-5xl font-bold mb-2 tracking-tight ${tags?.includes('BETA') ? 'text-yellow-300 drop-shadow-md' : ''}`}>
                    {t('welcomeBack', { name: userName })}
                  </h1>
                  {tags?.includes('DEV') && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-200 text-xs font-bold border border-blue-500/30 mb-2">
                      DEV
                    </span>
                  )}
                  {tags?.includes('BETA') && (
                    <span className="px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-200 text-xs font-bold border border-yellow-500/30 mb-2">
                      BETA
                    </span>
                  )}
                </div>
                <p className="text-purple-100 text-sm md:text-lg max-w-xl">
                  {t('readyToCreate', { books: stats.booksCount, communities: stats.communitiesCount })}
                </p>
              </div>
            </div>
            
            <Link 
              href="/dashboard/create-book"
              className="w-full md:w-auto group flex items-center justify-center bg-white text-purple-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-purple-50 transition-all hover:scale-105 active:scale-95"
            >
              <PenTool className="w-5 h-5 mr-2" />
              {t('writeNewBook')}
              <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-muted-foreground">+2 this month</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-white">{stats.booksCount}</h3>
            <p className="text-sm text-muted-foreground">{t('totalBooksPublished')}</p>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-muted-foreground">{t('active')}</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-white">{stats.communitiesCount}</h3>
            <p className="text-sm text-muted-foreground">{t('communitiesJoined')}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-500/20 text-green-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12%
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-white">${stats.totalEarnings.toFixed(2)}</h3>
            <p className="text-sm text-muted-foreground">{t('totalRevenue')}</p>
          </div>
        </div>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Books */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pink-500" />
              {t('recentProjects')}
            </h2>
            <Link href="/dashboard/books" className="text-sm text-muted-foreground hover:text-white transition-colors">
              {t('viewAll')}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.recentBooks.length === 0 ? (
              <div className="col-span-2 glass-card p-8 rounded-2xl border border-dashed border-white/10 text-center">
                <p className="text-muted-foreground">{t('noBooksCreated')}</p>
              </div>
            ) : (
              stats.recentBooks.map((book) => (
                <Link 
                  href={`/dashboard/create-book?id=${book.id}`} 
                  key={book.id} 
                  className="group glass-card p-4 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all flex gap-4"
                >
                  <div className="w-16 h-24 bg-gray-800 rounded-lg overflow-hidden shrink-0 shadow-lg group-hover:shadow-xl transition-all relative">
                    {book.coverImage ? (
                      <Image 
                        src={book.coverImage} 
                        alt={book.title} 
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-700 to-gray-800">
                        <BookOpen className="w-6 h-6 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <h3 className="font-bold text-white truncate group-hover:text-primary transition-colors mb-1">
                      {book.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        book.published 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {book.published ? t('published') : t('draft')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(book.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {book.description || 'No description'}
                    </p>
                  </div>
                </Link>
              ))
            )}
            
            <Link 
              href="/dashboard/create-book" 
              className="group glass-card p-4 rounded-2xl border border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-center min-h-[120px]"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-primary/20">
                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">{t('createNewBook')}</span>
            </Link>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            {t('quickActions')}
          </h2>
          
          <div className="space-y-3">
            <Link href="/dashboard/store" className="block glass-card p-4 rounded-xl border border-white/5 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-pink-400 transition-colors">Item Store</div>
                  <div className="text-xs text-muted-foreground">Buy frames & accessories</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/dashboard/communities" className="block glass-card p-4 rounded-xl border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-purple-400 transition-colors">{t('joinCommunity')}</div>
                  <div className="text-xs text-muted-foreground">{t('connectWithOthers')}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/dashboard/settings" className="block glass-card p-4 rounded-xl border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{t('editProfile')}</div>
                  <div className="text-xs text-muted-foreground">{t('updateBio')}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/dashboard/wallet" className="block glass-card p-4 rounded-xl border border-white/5 hover:border-green-500/50 hover:bg-green-500/5 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-green-400 transition-colors">{t('wallet')}</div>
                  <div className="text-xs text-muted-foreground">{t('manageEarnings')}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Activity Feed */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              {t('communityActivity')}
            </h3>
            <ActivityFeed />
          </div>

          {/* Mini Ad / Tip */}
          <div className="glass-card p-6 rounded-2xl bg-linear-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20">
            <h3 className="font-bold text-white mb-2">{t('proTip')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('proTipContent')}
            </p>
            <Link href="/dashboard/communities" className="text-sm font-bold text-pink-400 hover:text-pink-300 hover:underline">
              {t('goToCommunities')} &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
