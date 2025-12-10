'use client';

import { Users, MessageSquare, Calendar, Settings, Shield, Lock, Globe, Sparkles, Loader2, Clock, ArrowRight } from 'lucide-react';
import CreatePostForm from '@/components/CreatePostForm';
import Link from 'next/link';
import Image from 'next/image';
import PostCard from '@/components/PostCard';
import DeleteCommunityButton from '@/components/DeleteCommunityButton';
import { useLanguage } from '@/context/LanguageContext';
import { joinCommunity } from '@/app/actions/join-community';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Creator {
  username: string;
  name: string | null;
  image: string | null;
}

interface Post {
  id: string;
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  createdAt: Date;
  updatedAt: Date;
  communityId: string;
  authorId: string;
  author: {
    username: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    comments: number;
    likes: number;
  };
  likes: { userId: string }[];
}

interface Community {
  id: string;
  name: string;
  description: string | null;
  privacy: 'OPEN' | 'CLOSED';
  createdAt: Date | string;
  creatorId: string;
  isMember: boolean;
  memberRole?: 'ADMIN' | 'MEMBER' | null;
  memberStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  _count: {
    members: number;
    posts: number;
  };
  posts: Post[];
  creator: Creator;
}

interface Session {
  id: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface CommunityDetailsClientProps {
  community: Community;
  session: Session | null;
}

export default function CommunityDetailsClient({ community, session }: CommunityDetailsClientProps) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleJoin = () => {
    startTransition(async () => {
      try {
        const result = await joinCommunity(community.id);
        if (result.success) {
           router.refresh();
        } else {
           alert(result.error);
        }
      } catch (error) {
        console.error('Failed to join community', error);
      }
    });
  };

  // Deterministic gradient based on name
  const getGradient = (name: string) => {
    const gradients = [
      'from-pink-600 via-purple-600 to-indigo-600',
      'from-blue-600 via-cyan-600 to-teal-600',
      'from-emerald-600 via-green-600 to-lime-600',
      'from-orange-600 via-amber-600 to-yellow-600',
      'from-red-600 via-rose-600 to-pink-600',
    ];
    const index = name.length % gradients.length;
    return gradients[index];
  };

  const gradient = getGradient(community.name);

  return (
    <div className="-mt-4 -mx-4 md:-mt-8 md:-mx-8">
      {/* Immersive Header */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden group">
        {/* Dynamic Background */}
        <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-80`} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        
        {/* Animated Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto w-full z-20">
          <div className="flex flex-col md:flex-row items-end gap-8">
            {/* Avatar with Glow - Enhanced */}
            <div className="relative group/avatar">
              <div className={`absolute inset-0 bg-linear-to-br ${gradient} blur-3xl opacity-60 group-hover/avatar:opacity-90 transition-opacity duration-700`} />
              <div className="w-24 h-24 md:w-44 md:h-44 rounded-4xl bg-zinc-900 border-4 border-zinc-950/50 shadow-2xl flex items-center justify-center text-white font-bold text-3xl md:text-6xl shrink-0 relative z-10 -mb-10 md:-mb-16 transform group-hover/avatar:scale-105 group-hover/avatar:-rotate-2 transition-transform duration-500 overflow-hidden">
                <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-20`} />
                {community.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 mb-2 md:mb-6 w-full">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {community.privacy === 'CLOSED' && (
                      <span className="px-3 py-1 rounded-full bg-red-500/10 backdrop-blur-md border border-red-500/20 text-xs font-bold text-red-200 flex items-center gap-1.5 shadow-lg shadow-red-900/20">
                        <Lock className="w-3 h-3" /> {t('private')}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-white/80 flex items-center gap-1.5 shadow-lg shadow-black/20 hover:bg-white/20 transition-colors cursor-default">
                      <Globe className="w-3 h-3" /> {t('community')}
                    </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-8xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">
                    {community.name}
                  </h1>
                  
                  <p className="text-lg md:text-xl text-gray-200/90 max-w-2xl line-clamp-2 leading-relaxed font-medium drop-shadow-md">
                    {community.description || t('noDescription')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-4 pb-2">
                  {community.isMember ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/20 text-emerald-300 rounded-2xl font-bold border border-emerald-500/30 backdrop-blur-xl shadow-lg shadow-emerald-900/20 animate-in zoom-in duration-300">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                        {t('member')}
                      </div>
                      
                      {community.memberRole === 'ADMIN' && (
                        <Link 
                          href={`/dashboard/communities/${community.id}/settings`}
                          className="inline-flex items-center px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95 group"
                        >
                          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
                        </Link>
                      )}
                      
                      {community.creatorId === session?.id && (
                        <DeleteCommunityButton communityId={community.id} />
                      )}
                    </div>
                  ) : community.memberStatus === 'PENDING' ? (
                    <div className="inline-flex items-center px-6 py-3 bg-amber-500/10 text-amber-300 rounded-2xl font-bold border border-amber-500/20 backdrop-blur-md shadow-lg shadow-amber-900/20">
                       <Clock className="w-4 h-4 mr-2 animate-spin-slow" />
                       {t('requestPending')}
                    </div>
                  ) : (
                    <button 
                      onClick={handleJoin}
                      disabled={isPending}
                      className="group relative overflow-hidden bg-white text-black hover:bg-gray-100 px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-105 active:scale-95 text-lg flex items-center gap-2"
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      {isPending ? (
                         <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                         <>
                           <span>{community.privacy === 'CLOSED' ? t('requestToJoin') : t('joinCommunityButton')}</span>
                           <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                         </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 pt-24 md:pt-32 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left Column: Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-8 order-2 lg:order-1">
            
            {/* Stats Grid for Mobile (Visible on small screens) */}
            <div className="grid grid-cols-3 gap-4 lg:hidden mb-8">
               <div className="glass-card p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{community._count.members}</div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{t('members')}</div>
               </div>
               <div className="glass-card p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{community._count.posts}</div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{t('posts')}</div>
               </div>
               <div className="glass-card p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{new Date().getFullYear()}</div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{t('est')}</div>
               </div>
            </div>

            {community.isMember && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <CreatePostForm communityId={community.id} />
              </div>
            )}

            <div className="flex items-center justify-between pb-4 border-b border-white/5 sticky top-[80px] z-10 bg-zinc-950/80 backdrop-blur-xl py-4 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent md:backdrop-blur-none">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                {t('communityFeed')}
              </h3>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button className="px-4 py-1.5 text-sm font-bold text-black bg-white rounded-lg shadow-lg transition-all">{t('latest')}</button>
                <button className="px-4 py-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">{t('top')}</button>
              </div>
            </div>

            <div className="space-y-6 min-h-[500px]">
              {community.posts.map((post, i) => (
                <div key={post.id} className="animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards" style={{ animationDelay: `${i * 100}ms` }}>
                  <PostCard post={post} currentUserId={session?.id || ''} />
                </div>
              ))}

              {community.posts.length === 0 && (
                <div className="text-center py-20 px-6 text-muted-foreground glass-card rounded-3xl border-dashed border-2 border-white/10 flex flex-col items-center justify-center group hover:border-white/20 transition-colors bg-white/5">
                  <div className="w-20 h-20 mb-6 bg-linear-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="w-10 h-10 text-purple-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{t('quietInHere')}</h3>
                  <p className="text-lg max-w-sm mx-auto leading-relaxed">{t('beTheFirst')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
            {/* About Card - Enhanced */}
            <div className="glass-card p-8 rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl sticky top-24 shadow-2xl shadow-black/40">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                 <div className={`p-3 rounded-xl bg-linear-to-br ${gradient} bg-opacity-10`}>
                    <Globe className="w-6 h-6 text-white" />
                 </div>
                 <h3 className="font-bold text-xl text-white">
                   {t('aboutCommunity')}
                 </h3>
              </div>
              
              <p className="text-base text-gray-300 mb-8 leading-relaxed font-light">
                {community.description || t('aboutCommunityDesc')}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <Link href={`/dashboard/communities/${community.id}/members`} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl text-center border border-white/5 hover:border-white/10 transition-all group cursor-pointer hover:-translate-y-1">
                    <div className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{community._count.members}</div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('members')}</div>
                 </Link>
                 <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                    <div className="text-2xl font-bold text-white mb-1">{community._count.posts}</div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('posts')}</div>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-sm text-gray-400 p-3 rounded-xl bg-white/5 border border-white/5">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Created {new Date(community.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                 </div>
                 
                 <div className="flex items-center gap-3 text-sm text-gray-400 p-3 rounded-xl bg-white/5 border border-white/5">
                    {community.privacy === 'OPEN' ? (
                       <Globe className="w-4 h-4 text-emerald-400" />
                    ) : (
                       <Lock className="w-4 h-4 text-red-400" />
                    )}
                    <span className="capitalize">{community.privacy.toLowerCase()} Group</span>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Shield className="w-3 h-3" /> {t('createdBy')}
                </h4>
                <Link href={`/dashboard/profile/${community.creator.username}`} className="flex items-center gap-4 group bg-black/20 p-3 rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden relative ring-2 ring-white/10 group-hover:ring-primary transition-all">
                    {community.creator.image ? (
                      <Image src={community.creator.image} alt={community.creator.name || ''} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white bg-linear-to-br from-zinc-700 to-zinc-900">
                        {(community.creator.name || '?')[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                      {community.creator.name}
                    </div>
                    <div className="text-xs text-gray-500">@{community.creator.username}</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
