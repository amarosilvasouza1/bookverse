'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, Send, User } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    username: string;
    image: string | null;
  };
}

export function ReviewSection({ bookId }: { bookId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/books/${bookId}/reviews`);
      if (res.ok) {
        setReviews(await res.json());
      }
    } catch {
      console.error('Failed to fetch reviews');
    }
  }, [bookId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, content }),
      });

      if (res.ok) {
        setContent('');
        fetchReviews();
      }
    } catch {
      console.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 border-t border-white/10 pt-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
      >
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          Reviews ({reviews.length})
        </h2>
        <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">
          {isOpen ? 'Hide Reviews' : 'Show Reviews'}
        </span>
      </button>

      {isOpen && (
        <div className="space-y-8 mt-8 animate-in slide-in-from-top-4 fade-in duration-300">
          {/* Add Review Form */}
          <form onSubmit={handleSubmit} className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="font-semibold text-lg">Write a Review</h3>
            
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star 
                    className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} 
                  />
                </button>
              ))}
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you think about this book?"
              className="w-full bg-black/20 border border-white/10 rounded-xl p-4 min-h-[100px] focus:outline-none focus:border-indigo-500/50 transition-colors"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Post Review
            </button>
          </form>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {review.user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={review.user.image} alt={review.user.username} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-zinc-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{review.user.name || review.user.username}</p>
                      <div className="flex text-amber-400 text-xs">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-zinc-300 leading-relaxed">{review.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
