'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createComment, deleteComment, getComments } from '@/app/actions/community-interactions';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Send, Trash2, Flag } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import ReportModal from './ReportModal';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
}

export default function CommentSection({ postId }: { postId: string }) {
  const { t } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<string | null>(null);

  useEffect(() => {
    // Fetch comments and current user
    const loadData = async () => {
      try {
        const result = await getComments(postId);
        if (result.success && result.data) {
          setComments(result.data);
          setCurrentUserId(result.currentUserId as string | null);
        }
      } catch (error) {
        console.error('Failed to load comments', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    const result = await createComment(postId, newComment);
    
    if (result.success && result.comment) {
      // Optimistically add comment
      // The server action returns the comment with author included now (if we updated it to do so, but createComment currently includes post, not author fully populated maybe? Let's check)
      // Actually createComment in actions includes `post`, but we need `author`. 
      // Let's assume we refresh or we construct it. For now, let's just cast or fetch again.
      // Better to just refresh the list or append if we have data.
      // Let's fetch again for simplicity to get full author data.
      const updated = await getComments(postId);
      if (updated.success && updated.data) {
        setComments(updated.data);
      }
      setNewComment('');
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    
    setComments(prev => prev.filter(c => c.id !== commentId));
    await deleteComment(commentId);
  };

  if (loading) {
    return <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-zinc-500" /></div>;
  }

  return (
    <div className="space-y-4 pt-2">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden shrink-0 relative">
           {/* Placeholder for current user avatar - ideally passed as prop or fetched */}
           <div className="w-full h-full bg-white/10" />
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('writeComment')}
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:bg-white/10 transition-colors"
          />
          <button 
            type="submit" 
            disabled={submitting || !newComment.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 disabled:opacity-50 p-1"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <Link href={`/dashboard/profile/${comment.author.username}`} className="shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden relative border border-white/10 hover:border-primary/50 transition-colors">
                {comment.author.image ? (
                  <Image src={comment.author.image} alt={comment.author.name || ''} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-gray-700">
                    {(comment.author.name || '?')[0]}
                  </div>
                )}
              </div>
            </Link>
            <div className="flex-1">
              <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-2 inline-block max-w-full">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <Link href={`/dashboard/profile/${comment.author.username}`} className="text-sm font-bold text-white hover:text-primary hover:underline transition-colors">
                    {comment.author.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                </div>
                <div className="text-sm text-zinc-300">
                  {comment.content.split(/(\s+)/).map((part, i) => {
                    const match = part.match(/^@(\w+(\.\w+)*)$/);
                    if (match) {
                      return (
                        <Link 
                          key={i} 
                          href={`/dashboard/profile/${match[1]}`}
                          className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          {part}
                        </Link>
                      );
                    }
                    return part;
                  })}
                </div>
              </div>
              
              {currentUserId === comment.author.id && (
                <div className="flex gap-2 mt-1 ml-2">
                  <button 
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              )}
              
              {currentUserId !== comment.author.id && (
                <button 
                  onClick={() => setReportTarget(comment.id)}
                  className="text-xs text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 ml-2"
                >
                  <Flag className="w-3 h-3" /> Report
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={!!reportTarget}
        onClose={() => setReportTarget(null)}
        contentType="COMMENT"
        contentId={reportTarget || ''}
      />
    </div>
  );
}
