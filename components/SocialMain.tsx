'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, MessageCircle, Users, Clock, Layout, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatInterface from '@/components/ChatInterface';

import StatusViewer from '@/components/StatusViewer';

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
  };
  expiresAt: Date;
  createdAt: string | Date;
}

import { followUser } from '@/app/actions/social';

import { toast } from 'sonner';
import CreateStatusModal from './CreateStatusModal';

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
  const [activeTab, setActiveTab] = useState<'feed' | 'chat'>('feed');
  const [viewingStatus, setViewingStatus] = useState<Status | null>(null);
  const [showCreateStatus, setShowCreateStatus] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 px-2 py-4 sm:p-4 md:p-8 overflow-x-hidden" suppressHydrationWarning>
      {/* Status Viewer Overlay */}
      {viewingStatus && (
        <StatusViewer 
          status={viewingStatus} 
          onClose={() => setViewingStatus(null)} 
        />
      )}

      {showCreateStatus && (
        <CreateStatusModal onClose={() => setShowCreateStatus(false)} />
      )}

      {/* Header - Hidden on mobile when in Chat */}
      <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", activeTab === 'chat' ? "hidden md:flex" : "flex")}>
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 bg-linear-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent tracking-tight">
            Social Hub
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Connect, share, and explore the community.</p>
        </div>
        
        {/* Premium Tabs */}
        <div className="flex bg-black/40 backdrop-blur-xl p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl shadow-black/50 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('feed')}
            className={cn(
              "flex-1 md:flex-none px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2",
              activeTab === 'feed' 
                ? "bg-white text-black shadow-lg scale-100" 
                : "text-muted-foreground hover:text-white hover:bg-white/5 scale-95 hover:scale-100"
            )}
          >
            <Layout className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Feed
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "flex-1 md:flex-none px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2",
              activeTab === 'chat' 
                ? "bg-white text-black shadow-lg scale-100" 
                : "text-muted-foreground hover:text-white hover:bg-white/5 scale-95 hover:scale-100"
            )}
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Messages
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-4 sm:mt-6 md:mt-8 min-h-[calc(100vh-200px)] md:min-h-[600px]">
        {/* Feed Tab Content */}
        {activeTab === 'feed' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            {/* Status Section (Stories) */}
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-purple-500/10 to-blue-500/10 blur-3xl -z-10 rounded-full opacity-50" />
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl">
                <h2 className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  Recent Stories
                </h2>
                <div className="flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto pb-4 scrollbar-hide snap-x -mx-2 px-2">
                  {/* My Status */}
                  <div 
                    onClick={() => setShowCreateStatus(true)}
                    className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 shrink-0 group cursor-pointer snap-start"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 group-hover:bg-white/10 group-hover:border-primary/50 transition-all duration-300 group-hover:scale-105 shadow-lg">
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white/50 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-muted-foreground group-hover:text-white transition-colors">Add Story</span>
                  </div>

                  {statuses.map((status) => (
                    <div 
                      key={status.id} 
                      onClick={() => setViewingStatus(status)}
                      className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 shrink-0 cursor-pointer group snap-start"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full p-[2px] sm:p-[3px] bg-linear-to-tr from-yellow-400 via-orange-500 to-purple-600 animate-gradient-xy shadow-xl shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-105">
                        <div className="w-full h-full rounded-full border-2 sm:border-4 border-black overflow-hidden relative">
                          {status.user.image && (status.user.image.startsWith('http') || status.user.image.startsWith('/')) ? (
                            <Image src={status.user.image} alt={status.user.name || ''} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-xs sm:text-sm font-bold text-white">
                              {(status.user.name || '?')[0]}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-white group-hover:text-primary transition-colors truncate max-w-[60px] sm:max-w-[80px]">
                        {status.user.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested Authors */}
            {suggestedUsers.length > 0 && (
              <div className="space-y-4">
                 <h2 className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Suggested Authors</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {suggestedUsers.map(user => (
                      <SuggestedUserCard key={user.id} user={user} />
                    ))}
                 </div>
              </div>
            )}

            {/* Communities Feed */}
            <div className="space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4" suppressHydrationWarning>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  Trending Communities
                </h2>
                <Link 
                  href="/dashboard/communities/create"
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-black rounded-full text-xs sm:text-sm font-bold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10 text-center"
                >
                  Create Community
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {communities.map((community) => (
                  <Link 
                    key={community.id} 
                    href={`/dashboard/communities/${community.id}`}
                    className="group relative bg-black/40 border border-white/10 hover:border-primary/50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
                  >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4 sm:mb-5 md:mb-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-linear-to-br from-gray-800 to-black flex items-center justify-center text-white text-sm sm:text-base md:text-xl font-bold shadow-xl border border-white/5 group-hover:scale-110 transition-transform duration-500">
                          {community.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/5 border border-white/10 text-[8px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Community
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg md:text-xl text-white mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {community.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mb-4 sm:mb-5 md:mb-6 leading-relaxed">
                          {community.description || 'Join this community to connect with others and share your passion for books.'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 sm:pt-5 md:pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-medium text-gray-400">
                          <span className="flex items-center gap-1 sm:gap-1.5">
                            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            {community._count.members}
                          </span>
                          <span className="flex items-center gap-1 sm:gap-1.5">
                            <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            {community._count.posts}
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          Join Now →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Tab Content */}
        {activeTab === 'chat' && (
          <div className="animate-in fade-in zoom-in-95 duration-300 -mx-4 md:mx-0">
             <ChatInterface onBack={() => setActiveTab('feed')} />
          </div>
        )}
      </div>
    </div>
  );
}
function SuggestedUserCard({ user }: { user: SuggestedUser }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    // Optimistic
    setIsFollowing(true);
    
    try {
      const result = await followUser(user.id);
      if (result.error) {
        setIsFollowing(false);
        toast.error(result.error);
      } else {
        toast.success(`Seguindo ${user.name || user.username}`);
      }
    } catch {
      setIsFollowing(false);
      toast.error('Falha ao atualizar status de seguir');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 md:gap-4 hover:border-white/20 transition-all">
      <Link href={`/dashboard/profile/${user.username}`}>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
          {user.image ? (
            <Image src={user.image} alt={user.username} width={48} height={48} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold">
              {(user.name || user.username)[0].toUpperCase()}
            </div>
          )}
        </div>
      </Link>
      
      <div className="flex-1 min-w-0 overflow-hidden">
        <Link href={`/dashboard/profile/${user.username}`} className="font-bold text-sm sm:text-base text-white hover:underline truncate block">
          {user.name || user.username}
        </Link>
        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
          {user._count.followers} followers • {user._count.books} books
        </p>
      </div>

      <button
        onClick={handleFollow}
        disabled={loading || isFollowing}
        className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all shrink-0 ${
          isFollowing 
            ? 'bg-zinc-800 text-zinc-400 cursor-default' 
            : 'bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-95'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}
