'use client';

import { Plus, Users, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import CommunityCard from '@/components/CommunityCard';
import { useLanguage } from '@/context/LanguageContext';

interface Community {
  id: string;
  name: string;
  description: string | null;
  privacy: string;
  createdAt: Date;
  creatorId: string;
  _count: {
    members: number;
    posts: number;
  };
  isMember: boolean;
}

interface CommunitiesClientProps {
  communities: Community[];
}

export default function CommunitiesClient({ communities }: CommunitiesClientProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-4xl bg-black border border-white/10 shadow-2xl min-h-[400px] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50" />
          <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-purple-500/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-full bg-blue-500/20 blur-[120px] rounded-full animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>
        
        <div className="relative z-10 w-full p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl space-y-8 text-center md:text-left">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-200 backdrop-blur-xl shadow-lg shadow-purple-900/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">{t('connectCollaborate')}</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              {t('discoverTribe').split(' ').slice(0, -1).join(' ')} <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 via-purple-400 to-indigo-400 animate-gradient-x">{t('discoverTribe').split(' ').pop()}</span>
            </h1>
            
            <p className="text-lg text-purple-100/70 max-w-lg mx-auto md:mx-0 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              {t('communitiesDesc')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link 
                href="/dashboard/communities/create"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-xl shadow-white/10 hover:scale-105 active:scale-95 w-full sm:w-auto text-base group"
              >
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                {t('createCommunity')}
              </Link>
              <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
                <input 
                  type="text" 
                  placeholder={t('searchCommunities')}
                  className="w-full sm:w-72 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all backdrop-blur-md text-base shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Visual Element / 3D-like Card Stack */}
          <div className="hidden lg:block relative w-96 h-96 animate-in fade-in zoom-in duration-1000 delay-300">
             <div className="absolute top-0 right-0 w-72 h-80 bg-linear-to-br from-purple-600 to-indigo-600 rounded-3xl rotate-6 opacity-40 blur-sm transform translate-x-4 translate-y-4" />
             <div className="absolute top-0 right-0 w-72 h-80 bg-linear-to-br from-pink-600 to-purple-600 rounded-3xl -rotate-3 opacity-60 blur-sm transform -translate-x-2 -translate-y-2" />
             
             <div className="absolute top-0 right-0 w-72 h-80 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl transform hover:-translate-y-2 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-2xl text-white shadow-lg">
                    B
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">{t('bookVerseHub')}</div>
                    <div className="text-sm text-white/50">{t('officialCommunity')}</div>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-linear-to-r from-pink-500 to-purple-500 animate-pulse"></div>
                  </div>
                  <div className="h-2 w-1/2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-linear-to-r from-blue-500 to-cyan-500 animate-pulse delay-75"></div>
                  </div>
                </div>
                <div className="flex -space-x-3 mb-6">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-xs text-white font-bold">
                       U{i}
                     </div>
                   ))}
                   <div className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-xs text-white font-bold">
                     +1k
                   </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {t('activeNow')}
                  </span>
                  <button className="text-xs font-bold text-white bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors">
                    {t('join')}
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Categories / Filters */}
      <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide snap-x">
        {[
          t('allCommunities'),
          t('popular'),
          t('newest'),
          t('myCommunities'),
          t('fiction'),
          t('nonFiction'),
          t('romance'),
          t('sciFi')
        ].map((filter, i) => (
          <button 
            key={filter}
            className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all snap-start ${
              i === 0 
                ? 'bg-white text-black shadow-lg shadow-white/10 scale-105' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/10'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {communities.length === 0 ? (
        <div className="glass-card rounded-4xl p-24 text-center border border-white/5 bg-black/20 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-24 h-24 mb-8 bg-white/5 rounded-full flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
            <Users className="w-12 h-12 text-white/50 relative z-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">{t('noCommunitiesFound')}</h2>
          <p className="text-gray-400 mb-10 max-w-md mx-auto text-lg">
            {t('noCommunitiesDesc')}
          </p>
          <Link 
            href="/dashboard/communities/create" 
            className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('createFirstCommunity')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {communities.map((community, index) => (
            <Link 
              key={community.id} 
              href={`/dashboard/communities/${community.id}`} 
              className="block h-full animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CommunityCard community={community} isMember={community.isMember} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
