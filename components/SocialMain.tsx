'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, MessageCircle, Users, Clock, Layout } from 'lucide-react';
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
}

interface SocialMainProps {
  communities: Community[];
  statuses: Status[];
}

export default function SocialMain({ communities, statuses }: SocialMainProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'chat'>('feed');
  const [viewingStatus, setViewingStatus] = useState<Status | null>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
      {/* Status Viewer Overlay */}
      {viewingStatus && (
        <StatusViewer 
          status={viewingStatus} 
          onClose={() => setViewingStatus(null)} 
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent tracking-tight">
            Social Hub
          </h1>
          <p className="text-muted-foreground text-lg">Connect, share, and explore the community.</p>
        </div>
        
        {/* Premium Tabs */}
        <div className="flex bg-black/40 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('feed')}
            className={cn(
              "flex-1 md:flex-none px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2",
              activeTab === 'feed' 
                ? "bg-white text-black shadow-lg scale-100" 
                : "text-muted-foreground hover:text-white hover:bg-white/5 scale-95 hover:scale-100"
            )}
          >
            <Layout className="w-4 h-4" />
            Feed
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "flex-1 md:flex-none px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2",
              activeTab === 'chat' 
                ? "bg-white text-black shadow-lg scale-100" 
                : "text-muted-foreground hover:text-white hover:bg-white/5 scale-95 hover:scale-100"
            )}
          >
            <MessageCircle className="w-4 h-4" />
            Messages
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-8 min-h-[calc(100vh-200px)] md:min-h-[600px]">
        {/* Feed Tab Content */}
        {activeTab === 'feed' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            {/* Status Section (Stories) */}
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-purple-500/10 to-blue-500/10 blur-3xl -z-10 rounded-full opacity-50" />
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Recent Stories
                </h2>
                <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide snap-x">
                  {/* My Status */}
                  <div className="flex flex-col items-center gap-4 shrink-0 group cursor-pointer snap-start">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 group-hover:bg-white/10 group-hover:border-primary/50 transition-all duration-300 group-hover:scale-105 shadow-lg">
                      <Plus className="w-8 h-8 text-white/50 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-white transition-colors">Add Story</span>
                  </div>

                  {statuses.map((status) => (
                    <div 
                      key={status.id} 
                      onClick={() => setViewingStatus(status)}
                      className="flex flex-col items-center gap-4 shrink-0 cursor-pointer group snap-start"
                    >
                      <div className="w-20 h-20 rounded-full p-[3px] bg-linear-to-tr from-yellow-400 via-orange-500 to-purple-600 animate-gradient-xy shadow-xl shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-105">
                        <div className="w-full h-full rounded-full border-4 border-black overflow-hidden relative">
                          {status.user.image && (status.user.image.startsWith('http') || status.user.image.startsWith('/')) ? (
                            <Image src={status.user.image} alt={status.user.name || ''} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-sm font-bold text-white">
                              {(status.user.name || '?')[0]}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-primary transition-colors truncate max-w-[80px]">
                        {status.user.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Communities Feed */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  Trending Communities
                </h2>
                <Link 
                  href="/dashboard/communities/create"
                  className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10"
                >
                  Create Community
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community) => (
                  <Link 
                    key={community.id} 
                    href={`/dashboard/communities/${community.id}`}
                    className="group relative bg-black/40 border border-white/10 hover:border-primary/50 rounded-3xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
                  >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative flex flex-col h-full">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-gray-800 to-black flex items-center justify-center text-white text-xl font-bold shadow-xl border border-white/5 group-hover:scale-110 transition-transform duration-500">
                          {community.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Community
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {community.name}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-6 leading-relaxed">
                          {community.description || 'Join this community to connect with others and share your passion for books.'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {community._count.members}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MessageCircle className="w-3.5 h-3.5" />
                            {community._count.posts}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
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
             <ChatInterface />
          </div>
        )}
      </div>
    </div>
  );
}
