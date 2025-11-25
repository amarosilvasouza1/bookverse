'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Lock, BookOpen, Heart } from 'lucide-react';
import Link from 'next/link';

interface BookReaderProps {
  book: {
    id: string;
    title: string;
    content: string;
    isPremium: boolean;
    price: number;
    pages: {
      title: string | null;
      content: string;
      pageNumber: number;
    }[];
    author: {
      name: string | null;
      username: string;
    };
  };
  canRead: boolean;
  isAuthor: boolean;
}

export function BookReader({ book, canRead, isAuthor }: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);

  // Combine legacy content with new pages if necessary, or just use pages
  const pages = book.pages.length > 0 
    ? book.pages 
    : [{ title: 'Chapter 1', content: book.content, pageNumber: 1 }];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const [buying, setBuying] = useState(false);
  const [error, setError] = useState('');
  
  const handleBuy = async () => {
    setBuying(true);
    setError('');
    try {
      const { buyBook } = await import('@/app/actions/buy-book');
      const result = await buyBook(book.id);
      
      if (result.error) {
        setError(result.error);
      } else {
        window.location.reload();
      }
    } catch (e) {
      setError('Something went wrong');
    } finally {
      setBuying(false);
    }
  };

  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    try {
      const res = await fetch(`/api/books/${book.id}/like`);
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setIsLiked(data.isLiked);
      }
    } catch (error) {
      console.error('Failed to fetch likes', error);
    }
  };

  const handleLike = async () => {
    if (likeLoading) return;
    
    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes(prev => newIsLiked ? prev + 1 : prev - 1);
    setLikeLoading(true);

    try {
      const res = await fetch(`/api/books/${book.id}/like`, { method: 'POST' });
      if (!res.ok) {
        // Revert on error
        setIsLiked(!newIsLiked);
        setLikes(prev => newIsLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikes(prev => newIsLiked ? prev - 1 : prev + 1);
    } finally {
      setLikeLoading(false);
    }
  };

  // Determine content to show
  // If canRead is false, we force show the first page (index 0) and show the overlay
  const activePage = canRead ? pages[currentPage] : pages[0];
  const showOverlay = !canRead;

  return (
    <div className="space-y-8 pb-20 relative">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/dashboard/browse" className="text-sm text-muted-foreground hover:text-white flex items-center">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Browse
          </Link>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike}
              disabled={likeLoading}
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80 disabled:opacity-50"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              <span className={isLiked ? 'text-red-500' : 'text-muted-foreground'}>{likes}</span>
            </button>
            {isAuthor && (
              <Link href={`/dashboard/create-book?id=${book.id}`} className="text-sm text-primary hover:underline">
                Edit Book
              </Link>
            )}
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">{book.title}</h1>
        <p className="text-muted-foreground">
          by <Link href={`/dashboard/profile/${book.author.username}`} className="hover:text-primary transition-colors hover:underline">
            {book.author.name || book.author.username}
          </Link>
        </p>
      </div>

      {/* Content */}
      <div className={`prose prose-invert prose-lg max-w-none font-serif leading-relaxed relative ${showOverlay ? 'select-none' : ''}`}>
        {activePage.title && (
          <h2 className="text-2xl font-bold mb-6 text-white/90">{activePage.title}</h2>
        )}
        
        <div className={`whitespace-pre-wrap text-white/80 ${showOverlay ? 'mask-image-gradient' : ''}`}>
          {activePage.content}
        </div>

        {/* Preview Overlay */}
        {showOverlay && (
          <div className="absolute inset-x-0 bottom-0 h-[500px] bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent flex flex-col items-center justify-end pb-12">
            <div className="text-center space-y-6 p-8 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-md mx-4 animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Continue Reading</h3>
                <p className="text-muted-foreground">
                  You've reached the end of the free preview. Purchase this book to unlock all chapters and support the author.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button 
                onClick={handleBuy}
                disabled={buying}
                className="w-full group relative px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {buying ? (
                    'Processing...'
                  ) : (
                    <>
                      Unlock for ${book.price}
                      <BookOpen className="w-4 h-4" />
                    </>
                  )}
                </span>
              </button>
              
              <p className="text-xs text-muted-foreground">
                Secure payment • Instant access
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation - Only show if canRead */}
      {!showOverlay && (
        <div className="fixed bottom-[56px] md:bottom-0 left-0 right-0 p-4 bg-[#0a0a0a]/80 backdrop-blur-lg border-t border-white/10 md:pl-64 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="flex items-center px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {pages.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === pages.length - 1}
              className="flex items-center px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
