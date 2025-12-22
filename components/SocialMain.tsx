'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, MessageCircle, Users, Clock, Layout, ArrowRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatInterface from '@/components/ChatInterface';
import StatusViewer from '@/components/StatusViewer';
import { followUser } from '@/app/actions/social';
import { toast } from 'sonner';
import CreateStatusModal from './CreateStatusModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

interface Community {
  id: string;
  name: string;
  description: string | null;
  _count: {
    members: number;
    posts: number;
  };
}

export interface StatusData {
  bookId: string;
  bookTitle: string;
  coverImage?: string | null;
  chapterTitle?: string;
  chapterId?: string;
  authorName?: string;
  releaseDate?: Date | string;
}

export interface Status {
  id: string;
  type: string;
  data: StatusData;
  user: {
    name: string | null;
    image: string | null;
    username: string; // Added username to type definition
  };
  expiresAt: Date;
  createdAt: string | Date;
}

interface SuggestedUser {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  bio: string | null;
  _count: {
    followers: number;
    books: number;
  };
}

interface SocialMainProps {
  communities: Community[];
  statuses: Status[];
  suggestedUsers: SuggestedUser[];
}

export default function SocialMain({ communities, statuses, suggestedUsers }: SocialMainProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'feed' | 'chat'>('feed');
  const [viewingStatus, setViewingStatus] = useState<Status | null>(null);
  const [showCreateStatus, setShowCreateStatus] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 py-6 md:p-8" suppressHydrationWarning>
      {/* Status Viewer Overlay */}
      <AnimatePresence>
        {viewingStatus && (
          <StatusViewer 
            status={viewingStatus} 
            onClose={() => setViewingStatus(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateStatus && (
          <CreateStatusModal onClose={() => setShowCreateStatus(false)} />
        )}
      </AnimatePresence>

      {/* Header - Hidden on mobile when in Chat */}
      <div className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300",
        activeTab === 'chat' ? "hidden md:flex" : "flex"
      )}>
        <div>
          <motion.h1 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-3xl md:text-4xl font-bold mb-1 bg-linear-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent tracking-tight"
          >
            {t('socialHub')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-sm md:text-base font-medium"
          >
            {t('socialHubDesc')}
          </motion.p>
        </div>
        
        {/* Premium Tabs */}
        <div className="flex bg-zinc-900/50 backdrop-blur-xl p-1.5 rounded-2xl border border-white/5 shadow-2xl w-full md:w-auto relative">
          <button
            onClick={() => setActiveTab('feed')}
            className={cn(
              "flex-1 md:flex-none px-6 md:px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 relative z-10",
              activeTab === 'feed' ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {activeTab === 'feed' && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-white/10 rounded-xl"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <Layout className="w-4 h-4" />
            {t('feed')}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "flex-1 md:flex-none px-6 md:px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 relative z-10",
              activeTab === 'chat' ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
           {activeTab === 'chat' && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-white/10 rounded-xl"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <MessageCircle className="w-4 h-4" />
            {t('messages')}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-6 md:mt-8 min-h-[calc(100vh-200px)] md:min-h-[600px]">
        {/* Feed Tab Content */}
        {activeTab === 'feed' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-12"
          >
            {/* Status Section (Stories) */}
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-purple-500/5 to-blue-500/5 blur-3xl -z-10 rounded-full" />
              <div className="bg-zinc-900/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  {t('recentStories')}
                </h2>
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
                  {/* My Status */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateStatus(true)}
                    className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center bg-white/5 group-hover:bg-white/10 group-hover:border-purple-500/50 transition-colors">
                      <Plus className="w-6 h-6 md:w-8 md:h-8 text-zinc-500 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-xs font-medium text-zinc-500 group-hover:text-white transition-colors">{t('addStory')}</span>
                  </motion.div>

                  {statuses.map((status, i) => (
                    <motion.div 
                      key={status.id} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setViewingStatus(status)}
                      className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group"
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all relative">
                        <div className="w-full h-full rounded-full border-4 border-black overflow-hidden relative">
                          {status.user.image ? (
                            <Image src={status.user.image} alt={status.user.name || ''} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-sm font-bold text-white">
                              {(status.user.name || status.user.username || '?')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors truncate max-w-[80px]">
                        {status.user.name || status.user.username}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested Authors */}
            {suggestedUsers.length > 0 && (
              <div className="space-y-4">
                 <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-pink-400" />
                   {t('suggestedAuthors')}
                 </h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestedUsers.map((user, i) => (
                      <SuggestedUserCard key={user.id} user={user} delay={i * 0.1} />
                    ))}
                 </div>
              </div>
            )}

            {/* Communities Feed */}
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Users className="w-6 h-6 text-purple-400" />
                  {t('trendingCommunities')}
                </h2>
                <Link 
                  href="/dashboard/communities/create"
                  className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] text-center flex items-center justify-center gap-2 group"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  {t('createCommunity')}
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community, i) => (
                  <motion.div
                    key={community.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                  >
                    <Link 
                      href={`/dashboard/communities/${community.id}`}
                      className="group relative block bg-zinc-900/40 border border-white/5 hover:border-purple-500/30 rounded-4xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 overflow-hidden h-full"
                    >
                      <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative flex flex-col h-full">
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-zinc-800 to-black flex items-center justify-center text-xl font-bold text-white shadow-lg border border-white/5 group-hover:scale-110 group-hover:shadow-purple-500/20 transition-all duration-500">
                            {community.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400 uppercase tracking-wider group-hover:bg-purple-500/10 group-hover:text-purple-300 transition-colors">
                            {t('community')}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xl text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-1">
                            {community.name}
                          </h3>
                          <p className="text-sm text-zinc-400 line-clamp-2 mb-6 leading-relaxed group-hover:text-zinc-300 transition-colors">
                            {community.description || t('defaultCommunityDesc')}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-white/5 group-hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                            <span className="flex items-center gap-1.5 group-hover:text-zinc-300 transition-colors">
                              <Users className="w-3.5 h-3.5" />
                              {community._count.members}
                            </span>
                            <span className="flex items-center gap-1.5 group-hover:text-zinc-300 transition-colors">
                              <MessageCircle className="w-3.5 h-3.5" />
                              {community._count.posts}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-purple-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 flex items-center gap-1">
                            {t('join')} <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Chat Tab Content */}
        {activeTab === 'chat' && (
          <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             className="h-full"
          >
             <ChatInterface onBack={() => setActiveTab('feed')} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SuggestedUserCard({ user, delay }: { user: SuggestedUser, delay: number }) {
  const { t } = useLanguage();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    setIsFollowing(true); // Optimistic
    
    try {
      const result = await followUser(user.id);
      if (result.error) {
        setIsFollowing(false);
        toast.error(result.error);
      } else {
        toast.success(t('followingUser').replace('{name}', user.name || user.username));
      }
    } catch {
      setIsFollowing(false);
      toast.error(t('failedToUpdateFollow'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-white/10 hover:bg-zinc-900/80 transition-all group"
    >
      <Link href={`/dashboard/profile/${user.username}`}>
        <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-white/10 group-hover:border-purple-500/30 transition-colors">
          {user.image ? (
            <Image src={user.image} alt={user.username} width={48} height={48} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold bg-linear-to-br from-zinc-700 to-black">
              {(user.name || user.username)[0].toUpperCase()}
            </div>
          )}
        </div>
      </Link>
      
        <div className="flex-1 min-w-0">
        <Link href={`/dashboard/profile/${user.username}`} className="font-bold text-sm text-white hover:text-purple-400 transition-colors truncate block">
          {user.name || user.username}
        </Link>
        <p className="text-xs text-zinc-500 truncate">
          {user._count.followers} {t('followers')} • {user._count.books} {t('books')}
        </p>
      </div>

      <button
        onClick={handleFollow}
        disabled={loading || isFollowing}
        className={cn(
          "px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0",
          isFollowing 
            ? "bg-zinc-800 text-zinc-500 cursor-default" 
            : "bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-lg shadow-white/5"
        )}
      >
        {isFollowing ? t('following') : t('follow')}
      </button>
    </motion.div>
  );
}
