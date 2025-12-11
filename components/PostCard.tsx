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
  const [isLiked, setIsLiked] = useState(post.likes.some(like => like.userId === currentUserId));
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
  const [currentReaction, setCurrentReaction] = useState<string | null>(
      post.likes.some(like => like.userId === currentUserId) ? (post.likes.find(l => l.userId === currentUserId) as any)?.type || 'HEART' : null
  );

  const reactionEmojis = {
    HEART: '❤️',
    LAUGH: '😂',
    CRY: '😢',
    FIRE: '🔥',
    LIT: '💯'
  };

  return (
    <>
      <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all bg-black/20">
        <div className="flex items-start gap-4">
          <Link href={`/dashboard/profile/${post.author.username}`} className="shrink-0">
            <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden relative border border-white/10 hover:border-primary/50 transition-colors">
              {post.author.image ? (
                <Image 
                  src={post.author.image} 
                  alt={post.author.name || ''} 
                  fill
                  className="object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg bg-linear-to-br from-gray-700 to-gray-800">
                  {(post.author.name || '?')[0]}
                </div>
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/profile/${post.author.username}`} className="font-bold text-white hover:text-primary hover:underline cursor-pointer transition-colors">
                  {post.author.name}
                </Link>
                <Link href={`/dashboard/profile/${post.author.username}`} className="text-sm text-muted-foreground hover:text-white transition-colors">
                  @{post.author.username}
                </Link>
                <span className="text-xs text-muted-foreground">• {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="text-muted-foreground hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showOptionsMenu && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
                    <button
                      onClick={() => { setShowReportModal(true); setShowOptionsMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition-colors"
                    >
                      <Flag className="w-4 h-4" />
                      Report
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-gray-200 whitespace-pre-wrap mb-4 text-base leading-relaxed">
              {post.content}
            </p>

            {post.mediaUrl && (
              <div className="mb-4 rounded-lg overflow-hidden border border-white/5 bg-black/50">
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

            <div className="flex items-center gap-6 pt-2 border-t border-white/5 mt-4">
              <div className="relative group/reaction">
                <button 
                  onClick={() => handleReaction(currentReaction || 'HEART')}
                  disabled={isLikeLoading}
                  className={`flex items-center gap-2 text-sm transition-colors ${currentReaction ? 'text-pink-500' : 'text-muted-foreground hover:text-pink-400'}`}
                >
                  <div className={`p-2 rounded-full group-hover/reaction:bg-pink-500/10 transition-colors ${currentReaction ? 'bg-pink-500/10' : ''}`}>
                    {currentReaction ? (
                        <span>{reactionEmojis[currentReaction as keyof typeof reactionEmojis] || '❤️'}</span>
                    ) : (
                        <Heart className="w-4 h-4" />
                    )}
                  </div>
                  <span>{likesCount} {likesCount === 1 ? t('like') : t('likes')}</span>
                </button>

                {/* Hover Menu */}
                <div className="absolute bottom-full left-0 mb-2 p-1 bg-zinc-800 border border-white/10 rounded-full shadow-xl flex items-center gap-1 opacity-0 invisible group-hover/reaction:opacity-100 group-hover/reaction:visible transition-all duration-200 scale-95 group-hover/reaction:scale-100 origin-bottom-left z-10">
                    {Object.entries(reactionEmojis).map(([type, emoji]) => (
                        <button
                            key={type}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleReaction(type);
                            }}
                            className={`w-8 h-8 flex items-center justify-center text-lg hover:bg-white/20 rounded-full transition-transform hover:scale-125 ${currentReaction === type ? 'bg-white/10' : ''}`}
                            title={t(type.toLowerCase())}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
              </div>
              
              <button 
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-2 text-sm transition-colors group ${showComments ? 'text-blue-400' : 'text-muted-foreground hover:text-blue-400'}`}
              >
                <div className={`p-2 rounded-full group-hover:bg-blue-500/10 transition-colors ${showComments ? 'bg-blue-500/10' : ''}`}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span>{post._count.comments} {t('comments')}</span>
              </button>
              
              <button 
                 onClick={() => setShowShareModal(true)}
                 className="flex items-center gap-2 text-sm text-muted-foreground hover:text-green-400 transition-colors group ml-auto"
              >
                <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                  <Share2 className="w-4 h-4" />
                </div>
              </button>
            </div>

            {showComments && (
              <div className="mt-6 animate-in fade-in slide-in-from-top-2">
                <CommentSection postId={post.id} />
              </div>
            )}
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
