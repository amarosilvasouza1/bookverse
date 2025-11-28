'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { MoreHorizontal, Heart, MessageSquare, Share2 } from 'lucide-react';
import { togglePostLike } from '@/app/actions/community-interactions';
import CommentSection from './CommentSection';
import { formatDistanceToNow } from 'date-fns';

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
    _count: {
      comments: number;
      likes: number;
    };
    likes: { userId: string }[];
  };
  currentUserId: string;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.likes.some(like => like.userId === currentUserId));
  const [likesCount, setLikesCount] = useState(post._count.likes);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (isLikeLoading) return;
    
    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
    setIsLikeLoading(true);

    const result = await togglePostLike(post.id);
    
    if (result.error) {
      // Revert if failed
      setIsLiked(!newIsLiked);
      setLikesCount(prev => !newIsLiked ? prev + 1 : prev - 1);
    }
    
    setIsLikeLoading(false);
  };

  return (
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
            <button className="text-muted-foreground hover:text-white transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-gray-200 whitespace-pre-wrap mb-4 text-base leading-relaxed">
            {post.content}
          </p>

          <div className="flex items-center gap-6 pt-2 border-t border-white/5 mt-4">
            <button 
              onClick={handleLike}
              disabled={isLikeLoading}
              className={`flex items-center gap-2 text-sm transition-colors group ${isLiked ? 'text-pink-500' : 'text-muted-foreground hover:text-pink-400'}`}
            >
              <div className={`p-2 rounded-full group-hover:bg-pink-500/10 transition-colors ${isLiked ? 'bg-pink-500/10' : ''}`}>
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </div>
              <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
            </button>
            
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 text-sm transition-colors group ${showComments ? 'text-blue-400' : 'text-muted-foreground hover:text-blue-400'}`}
            >
              <div className={`p-2 rounded-full group-hover:bg-blue-500/10 transition-colors ${showComments ? 'bg-blue-500/10' : ''}`}>
                <MessageSquare className="w-4 h-4" />
              </div>
              <span>{post._count.comments} Comments</span>
            </button>
            
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-green-400 transition-colors group ml-auto">
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
  );
}
