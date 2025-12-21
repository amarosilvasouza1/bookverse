'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { MoreHorizontal, Heart, MessageSquare, Share2, Flag } from 'lucide-react';
import { togglePostLike } from '@/app/actions/community-interactions';
import CommentSection from './CommentSection';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import SharePostModal from './SharePostModal';
import ReportModal from './ReportModal';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      name: string | null;
      username: string;
      image: string | null;
    };
    mediaUrl?: string | null;
    mediaType?: string | null;
    _count: {
      comments: number;
      likes: number;
    };
    likes: { userId: string }[];
  };
  currentUserId: string;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const { t } = useLanguage();
  const [likesCount, setLikesCount] = useState(post._count.likes);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const handleReaction = async (type: string) => {
    if (isLikeLoading) return;
    
    // Determine previous state
    // For now we assume if we react with same type, we remove it. If different, we update it.
    // Since we don't have "myReactionType" from props yet (only isLiked boolean from 'post.likes.some'), 
    // we'll assume standard toggle for HEART if simply clicking button, or specific set if clicking emoji.
    
    // Ideally we need `myReaction` from backend. For now let's implement the UI and simple toggle.
    // We'll update state to include `reactionType`.
    
    const isSameReaction = currentReaction === type;
    const newReaction = isSameReaction ? null : type; // Toggle off if same
    
    setCurrentReaction(newReaction);
    setLikesCount(prev => {
        if (currentReaction && !newReaction) return prev - 1; // Removed
        if (!currentReaction && newReaction) return prev + 1; // Added
        return prev; // Changed type (count stays same)
    });
    
    setIsLikeLoading(true);

    // Call server action with type
    // We need to update togglePostLike signature in next step or use new action
    // For now, assuming togglePostLike might be updated or replaced. 
    // Let's use a new action `reactToPost` if possible, or update existing.
    // Wait, I haven't updated the action file yet. I should do that.
    // I'll assume `togglePostLike` will take a 2nd argument `type`.
    
    const result = await togglePostLike(post.id, type);
    
    if (result.error) {
       // Revert
       setCurrentReaction(currentReaction);
       setLikesCount(prev => {
         if (currentReaction && !newReaction) return prev + 1;
         if (!currentReaction && newReaction) return prev - 1;
         return prev;
       });
    }
    
    setIsLikeLoading(false);
  };

  // State for current reaction type
  const [currentReaction, setCurrentReaction] = useState<string | null>(() => {
      const myLike = post.likes.find(l => l.userId === currentUserId);
      return myLike ? ((myLike as { type?: string }).type || 'HEART') : null;
  });

  const reactionEmojis = {
    HEART: '❤️',
    LAUGH: '😂',
    CRY: '😢',
    FIRE: '🔥',
    LIT: '💯'
  };

  return (
    <>
      <div className="group relative rounded-3xl bg-zinc-900/50 backdrop-blur-xl border border-white/5 hover:border-purple-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10 hover:-translate-y-0.5">
        <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity pointer-events-none" />
        
        <div className="p-6 relative z-10">
          <div className="flex items-start gap-4">
            <Link href={`/dashboard/profile/${post.author.username}`} className="shrink-0 relative group/avatar">
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden relative border border-white/10 group-hover/avatar:border-purple-400 transition-colors">
                {post.author.image ? (
                  <Image 
                    src={post.author.image} 
                    alt={post.author.name || ''} 
                    fill
                    className="object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg bg-linear-to-br from-zinc-700 to-zinc-800">
                    {(post.author.name || '?')[0]}
                  </div>
                )}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <Link href={`/dashboard/profile/${post.author.username}`} className="font-bold text-white hover:text-purple-400 cursor-pointer transition-colors text-base">
                    {post.author.name}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Link href={`/dashboard/profile/${post.author.username}`} className="hover:text-zinc-300 transition-colors">
                      @{post.author.username}
                    </Link>
                    <span>•</span>
                    <span className="text-xs">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                    className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  {showOptionsMenu && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in duration-200">
                      <button
                        onClick={() => { setShowReportModal(true); setShowOptionsMenu(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
                      >
                        <Flag className="w-4 h-4" />
                        Report
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pl-0">
                <p className="text-zinc-100 whitespace-pre-wrap mb-4 text-[15px] leading-relaxed font-light">
                  {post.content}
                </p>

                {post.mediaUrl && (
                  <div className="mb-5 rounded-2xl overflow-hidden border border-white/5 bg-black/50 shadow-lg">
                    {post.mediaType === 'VIDEO' ? (
                      <video src={post.mediaUrl} controls className="w-full max-h-[500px] object-contain" />
                    ) : (
                      <div className="relative w-full h-auto max-h-[500px] aspect-video">
                          <Image 
                              src={post.mediaUrl} 
                              alt="Post media" 
                              fill
                              className="object-contain"
                          />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <div className="relative group/reaction">
                    <button 
                      onClick={() => handleReaction(currentReaction || 'HEART')}
                      disabled={isLikeLoading}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${currentReaction ? 'text-pink-400 bg-pink-500/10 ring-1 ring-pink-500/20' : 'text-zinc-400 hover:text-pink-400 hover:bg-pink-500/5'}`}
                    >
                      <div className={`transition-transform duration-300 ${currentReaction ? 'scale-110' : 'group-hover/reaction:scale-110'}`}>
                        {currentReaction ? (
                            <span>{reactionEmojis[currentReaction as keyof typeof reactionEmojis] || '❤️'}</span>
                        ) : (
                            <Heart className="w-4 h-4" />
                        )}
                      </div>
                      <span>{likesCount}</span>
                    </button>

                    {/* Hover Menu */}
                    <div className="absolute bottom-full left-0 mb-3 p-1.5 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl flex items-center gap-1.5 opacity-0 invisible group-hover/reaction:opacity-100 group-hover/reaction:visible transition-all duration-300 scale-90 group-hover/reaction:scale-100 origin-bottom-left z-20">
                        {Object.entries(reactionEmojis).map(([type, emoji]) => (
                            <button
                                key={type}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleReaction(type);
                                }}
                                className={`w-9 h-9 flex items-center justify-center text-xl hover:bg-white/10 rounded-full transition-transform hover:scale-125 active:scale-95 ${currentReaction === type ? 'bg-white/15 ring-1 ring-white/20' : ''}`}
                                title={t(type.toLowerCase())}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 group ${showComments ? 'text-blue-400 bg-blue-500/10 ring-1 ring-blue-500/20' : 'text-zinc-400 hover:text-blue-400 hover:bg-blue-500/5'}`}
                  >
                    <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    <span>{post._count.comments}</span>
                  </button>
                  
                  <div className="ml-auto">
                    <button 
                      onClick={() => setShowShareModal(true)}
                      className="p-2 rounded-full text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all duration-300 hover:rotate-12"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {showComments && (
                  <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <CommentSection postId={post.id} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SharePostModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={{
          id: post.id,
          content: post.content,
          author: { username: post.author.username }
        }}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="POST"
        contentId={post.id}
      />
    </>
  );
}
