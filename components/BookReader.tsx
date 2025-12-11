'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Lock, BookOpen, Heart, Settings, Maximize, Minimize, Type, Palette, Monitor, X, MessageCircle, Share2, Volume2, VolumeX, Calendar, Menu, Home } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CharacterChat from './CharacterChat';
import ReadingRoomControl from './ReadingRoomControl';
import ShareQuoteModal from './ShareQuoteModal';
import { getRoomState, updateRoomPage } from '@/app/actions/reading-room';
import { updateReadingProgress } from '@/app/actions/analytics';
import { buyBook } from '@/app/actions/buy-book';
import { startReadingSession, endReadingSession, addBookmark, removeBookmark, getBookmarks } from '@/app/actions/reading';

interface BookReaderProps {
  book: {
    id: string;
    title: string;
    content: string;
    isPremium: boolean;
    allowDownload: boolean;
    ambience: string | null;
    price: number;
    pages: {
      title: string | null;
      content: string;
      pageNumber: number;
      scheduledAt?: string | null;
    }[];
    author: {
      name: string | null;
      username: string;
    };
  };
  canRead: boolean;
  isAuthor: boolean;
  isSubscriber: boolean;
}

type Theme = 'dark' | 'light' | 'sepia';
type FontFamily = 'serif' | 'sans' | 'mono';

export function BookReader({ book, canRead, isSubscriber, isAuthor }: BookReaderProps) {
  // --- State: Content & Navigation ---
  const [currentPage, setCurrentPage] = useState(0);
  const [showTopBar, setShowTopBar] = useState(true);
  const [showBottomBar, setShowBottomBar] = useState(true);
  const lastScrollY = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // --- State: Reading Room ---
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');
  const [roomState, setRoomState] = useState<{
    isActive: boolean;
    isHost: boolean;
    participants: { id: string; name: string | null; image: string | null }[];
    hostName?: string;
  }>({ isActive: false, isHost: false, participants: [] });

  const pages = book.pages.length > 0 
    ? book.pages 
    : [{ title: 'Chapter 1', content: book.content, pageNumber: 1 }];

  // --- State: Settings ---
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
  const [theme, setTheme] = useState<Theme>('dark');
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTOC, setShowTOC] = useState(false);

  // --- State: Actions ---
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState('');
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // --- State: Sharing ---
  const [selectedQuote, setSelectedQuote] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);

  // --- State: Reading Session & Bookmarks ---
  const [readingSessionId, setReadingSessionId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<{ id: string; pageNumber: number; note: string | null }[]>([]);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const pagesReadRef = useRef(0);

  // --- State: Swipe Gestures ---
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);
  const minSwipeDistance = 60;
  const isScrolling = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
    isScrolling.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    
    // Detect if scrolling vertically (shouldn't trigger page change)
    const deltaX = Math.abs(currentX - touchStart.current.x);
    const deltaY = Math.abs(currentY - touchStart.current.y);
    
    if (deltaY > deltaX && deltaY > 10) {
      isScrolling.current = true;
    }
    
    touchEnd.current = { x: currentX, y: currentY };
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current || isScrolling.current) return;
    
    // Don't swipe if text is selected
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    
    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = Math.abs(touchStart.current.y - touchEnd.current.y);
    
    // Only horizontal swipes (ignore if too much vertical movement)
    if (distanceY > 50) return;
    
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  // Hide bars on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowTopBar(false);
        setShowBottomBar(false);
      } else {
        setShowTopBar(true);
        setShowBottomBar(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tap to show/hide bars on mobile
  const handleContentTap = (e: React.MouseEvent) => {
    // Only on mobile and not on buttons/links
    if (window.innerWidth > 768) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;
    
    setShowTopBar(prev => !prev);
    setShowBottomBar(prev => !prev);
  };

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectionPosition(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectedQuote(text);
        setSelectionPosition({
          x: rect.left + (rect.width / 2),
          y: rect.top - 10
        });
      } else {
        setSelectionPosition(null);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  // --- Effects: Reading Session Tracking ---
  useEffect(() => {
    let sessionId: string | null = null;

    const startSession = async () => {
      const result = await startReadingSession(book.id);
      if (result.success && result.sessionId) {
        sessionId = result.sessionId;
        setReadingSessionId(sessionId);
      }
    };

    startSession();

    // End session on unmount
    return () => {
      if (sessionId) {
        endReadingSession(sessionId, pagesReadRef.current);
      }
    };
  }, [book.id]);

  // Track pages read
  useEffect(() => {
    pagesReadRef.current += 1;
  }, [currentPage]);

  // Load bookmarks on mount
  useEffect(() => {
    const loadBookmarks = async () => {
      const result = await getBookmarks(book.id);
      if (result.success && result.data) {
        setBookmarks(result.data);
      }
    };
    loadBookmarks();
  }, [book.id]);

  // --- Effects: Reading Room Sync ---
  useEffect(() => {
    if (!roomId) return;

    const syncRoom = async () => {
      try {
        const result = await getRoomState(roomId);
        
        if (result.success && result.data) {
          const { currentPage: roomPage, status, host, participants, isHost } = result.data;
          
          setRoomState(prev => {
            const newState = {
              isActive: status === 'ACTIVE',
              isHost: !!isHost,
              participants,
              hostName: host.name || 'Host'
            };

            if (
              prev.isActive === newState.isActive &&
              prev.isHost === newState.isHost &&
              prev.hostName === newState.hostName &&
              JSON.stringify(prev.participants) === JSON.stringify(newState.participants)
            ) {
              return prev;
            }
            return newState;
          });

          if (!isHost && status === 'ACTIVE') {
            const targetPage = roomPage - 1;
            setCurrentPage(prev => {
              if (prev !== targetPage) return targetPage;
              return prev;
            });
          }
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    };

    syncRoom();
    const interval = setInterval(syncRoom, 2000);
    return () => clearInterval(interval);
  }, [roomId]);

  // --- Handlers ---
  const handleNext = useCallback(() => {
    if (currentPage < pages.length - 1) {
      if (roomState.isActive && !roomState.isHost) return;

      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      updateReadingProgress(book.id, newPage + 1);

      if (roomState.isActive && roomState.isHost && roomId) {
        updateRoomPage(roomId, newPage + 1);
      }
    }
  }, [currentPage, pages.length, book.id, roomState.isActive, roomState.isHost, roomId]);

  const handlePrev = useCallback(() => {
    if (currentPage > 0) {
      if (roomState.isActive && !roomState.isHost) return;

      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });

      updateReadingProgress(book.id, newPage + 1);

      if (roomState.isActive && roomState.isHost && roomId) {
        updateRoomPage(roomId, newPage + 1);
      }
    }
  }, [currentPage, book.id, roomState.isActive, roomState.isHost, roomId]);

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    setShowTOC(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateReadingProgress(book.id, pageIndex + 1);
  };

  // --- Effects: Persistence & Keyboard ---
  const fetchLikes = useCallback(async () => {
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
  }, [book.id]);

  useEffect(() => {
    const saved = localStorage.getItem('reader-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (parsed.fontFamily) setFontFamily(parsed.fontFamily);
        if (parsed.theme) setTheme(parsed.theme);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
    fetchLikes();
  }, [fetchLikes]);

  useEffect(() => {
    localStorage.setItem('reader-settings', JSON.stringify({ fontSize, fontFamily, theme }));
  }, [fontSize, fontFamily, theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canRead) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, canRead]);

  // --- More Handlers ---
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleBuy = async () => {
    setBuying(true);
    setError('');
    try {
      const result = await buyBook(book.id);
      
      if (result.error) {
        setError(result.error);
      } else {
        window.location.reload();
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setBuying(false);
    }
  };

  const handleLike = async () => {
    if (likeLoading) return;
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes(prev => newIsLiked ? prev + 1 : prev - 1);
    setLikeLoading(true);

    try {
      const res = await fetch(`/api/books/${book.id}/like`, { method: 'POST' });
      if (!res.ok) {
        setIsLiked(!newIsLiked);
        setLikes(prev => newIsLiked ? prev - 1 : prev + 1);
      }
    } catch {
      setIsLiked(!newIsLiked);
      setLikes(prev => newIsLiked ? prev - 1 : prev + 1);
    } finally {
      setLikeLoading(false);
    }
  };

  // --- Render Helpers ---
  const activePage = canRead ? pages[currentPage] : pages[0];
  
  const isScheduled = activePage.scheduledAt && new Date(activePage.scheduledAt) > new Date();
  const isLockedSchedule = isScheduled && !isAuthor;
  const showOverlay = !canRead || isLockedSchedule;

  const themeStyles = {
    dark: 'bg-[#0a0a0a] text-zinc-300',
    light: 'bg-[#fafafa] text-zinc-800',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
  };

  const fontStyles = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono',
  };

  const handleDownloadPDF = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      
      doc.setFont('times', 'bold');
      doc.setFontSize(24);
      doc.text(book.title, 105, 100, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('times', 'normal');
      doc.text(`By ${book.author.name || book.author.username}`, 105, 115, { align: 'center' });
      
      let pageNum = 1;
      
      pages.forEach((page) => {
        doc.addPage();
        pageNum++;
        
        if (page.title) {
          doc.setFont('times', 'bold');
          doc.setFontSize(18);
          doc.text(page.title, 20, 30);
          doc.setFont('times', 'normal');
          doc.setFontSize(12);
        }
        
        const splitText = doc.splitTextToSize(page.content, 170);
        const y = page.title ? 45 : 30;
        
        if (splitText.length > 0) {
           doc.text(splitText, 20, y);
        }
        
        doc.setFontSize(10);
        doc.text(`Page ${pageNum}`, 105, 285, { align: 'center' });
      });
      
      doc.save(`${book.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeStyles[theme]}`}>
      {/* Top Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-all duration-300
        ${showTopBar ? 'translate-y-0' : '-translate-y-full'}
        ${theme === 'dark' ? 'bg-[#0a0a0a]/95 border-white/10' : 
          theme === 'light' ? 'bg-white/95 border-zinc-200' : 
          'bg-[#f4ecd8]/95 border-[#e3dccb]'}`}
      >
        <div className="max-w-4xl mx-auto px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Link href="/dashboard/browse" className={`p-2 rounded-lg transition-colors shrink-0
               ${theme === 'dark' ? 'text-zinc-400 hover:bg-white/10' : 'text-zinc-600 hover:bg-black/5'}`}>
              <Home className="w-5 h-5" />
            </Link>
            
            <button 
              onClick={() => setShowTOC(true)}
              className={`p-2 rounded-lg transition-colors shrink-0 md:hidden
                ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <h1 className="font-semibold truncate text-sm md:text-base">
              {book.title}
            </h1>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {canRead && (isAuthor || book.allowDownload) && (
              <button 
                onClick={handleDownloadPDF}
                className={`items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hidden md:flex
                  ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-zinc-300' : 'bg-black/5 hover:bg-black/10 text-zinc-700'}`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            )}

            <button 
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${isLiked ? 'bg-red-500/10 text-red-500' : `${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs md:text-sm">{likes}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={() => setShowBookmarkModal(true)}
              className={`p-2 rounded-lg transition-colors relative
                ${bookmarks.some(b => b.pageNumber === currentPage + 1) ? 'text-yellow-500' : ''}
                ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
              title="Bookmarks"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill={bookmarks.some(b => b.pageNumber === currentPage + 1) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-primary text-white rounded-full flex items-center justify-center">{bookmarks.length}</span>
              )}
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-lg transition-colors hidden md:flex
                ${showChat ? `${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'} text-primary` : `${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}`}
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors
                ${showSettings ? `${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}` : `${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}`}
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-lg transition-colors hidden md:block
                ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bookmark Modal */}
      {showBookmarkModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowBookmarkModal(false)}>
          <div 
            className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${theme === 'dark' ? 'bg-zinc-900 border border-white/10' : 'bg-white border border-zinc-200'}`}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">📚 Bookmarks</h2>
            
            {/* Add Bookmark */}
            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm mb-2">Page {currentPage + 1}</p>
              <input 
                type="text"
                placeholder="Add a note (optional)..."
                value={bookmarkNote}
                onChange={(e) => setBookmarkNote(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm mb-2"
              />
              <button
                onClick={async () => {
                  const result = await addBookmark(book.id, currentPage + 1, bookmarkNote || undefined);
                  if (result.success && result.bookmark) {
                    setBookmarks(prev => [...prev, result.bookmark!]);
                    setBookmarkNote('');
                  }
                }}
                className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Add Bookmark
              </button>
            </div>

            {/* Bookmark List */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {bookmarks.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">No bookmarks yet</p>
              ) : (
                bookmarks.map(bm => (
                  <div key={bm.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                    <button onClick={() => { goToPage(bm.pageNumber - 1); setShowBookmarkModal(false); }} className="flex-1 text-left">
                      <span className="font-medium text-sm">Page {bm.pageNumber}</span>
                      {bm.note && <p className="text-xs text-zinc-500 truncate">{bm.note}</p>}
                    </button>
                    <button 
                      onClick={async () => {
                        await removeBookmark(bm.id);
                        setBookmarks(prev => prev.filter(b => b.id !== bm.id));
                      }}
                      className="p-1.5 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table of Contents (Mobile) */}
      {showTOC && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={() => setShowTOC(false)}>
          <div 
            className={`absolute left-0 top-0 bottom-0 w-72 max-w-[80vw] p-4 overflow-y-auto animate-in slide-in-from-left
              ${theme === 'dark' ? 'bg-zinc-900' : theme === 'light' ? 'bg-white' : 'bg-[#f4ecd8]'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Chapters</h2>
              <button onClick={() => setShowTOC(false)} className="p-2 hover:opacity-70">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-1">
              {pages.map((page, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors
                    ${currentPage === index 
                      ? `${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'} font-medium`
                      : `${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'} opacity-70`}`}
                >
                  <span className="opacity-50 mr-2">{index + 1}.</span>
                  {page.title || `Page ${index + 1}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div 
          className={`fixed top-14 md:top-[60px] right-2 md:right-4 z-50 w-[calc(100vw-1rem)] md:w-72 max-w-72 rounded-xl shadow-2xl border p-4 animate-in fade-in slide-in-from-top-2
            ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 
              theme === 'light' ? 'bg-white border-zinc-200 text-zinc-800' : 
              'bg-[#eaddcf] border-[#d3c4b1] text-[#5b4636]'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Reader Settings</h3>
            <button onClick={() => setShowSettings(false)} className="hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Theme */}
            <div className="space-y-2">
              <label className="text-xs font-medium opacity-70 flex items-center gap-2">
                <Palette className="w-3 h-3" /> Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'sepia', 'dark'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`h-10 rounded-lg border flex items-center justify-center transition-all
                      ${theme === t ? 'ring-2 ring-indigo-500 border-transparent' : 'border-current opacity-50 hover:opacity-100'}
                      ${t === 'light' ? 'bg-white' : t === 'sepia' ? 'bg-[#f4ecd8]' : 'bg-[#0a0a0a]'}`}
                  >
                    <span className={`text-xs font-medium ${t === 'dark' ? 'text-white' : 'text-black'}`}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div className="space-y-2">
              <label className="text-xs font-medium opacity-70 flex items-center gap-2">
                <Type className="w-3 h-3" /> Font
              </label>
              <div className={`flex p-1 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                {(['serif', 'sans', 'mono'] as FontFamily[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFontFamily(f)}
                    className={`flex-1 py-2 text-xs rounded-md transition-all
                      ${fontFamily === f ? `${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm font-medium` : 'opacity-60 hover:opacity-100'}`}
                  >
                    {f === 'serif' ? 'Serif' : f === 'sans' ? 'Sans' : 'Mono'}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <label className="text-xs font-medium opacity-70 flex items-center gap-2">
                <Monitor className="w-3 h-3" /> Size ({fontSize}px)
              </label>
              <input
                type="range"
                min="14"
                max="28"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-indigo-500 ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}
              />
              <div className="flex justify-between text-[10px] opacity-50 font-mono">
                <span>14px</span>
                <span>28px</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div 
        ref={contentRef}
        className="pt-14 md:pt-16 pb-24 md:pb-20"
        onClick={handleContentTap}
      >
        <div 
          className={`max-w-2xl mx-auto px-5 md:px-8 py-8 md:py-12 min-h-[70vh] ${fontStyles[fontFamily]} ${showOverlay ? 'select-none blur-[1px]' : 'select-auto'}`}
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {activePage.title && (
            <h2 className={`text-xl md:text-2xl font-bold mb-6 md:mb-8 opacity-90`}>
              {activePage.title}
            </h2>
          )}
          
          <div 
            className="prose prose-lg dark:prose-invert max-w-none opacity-90"
            dangerouslySetInnerHTML={{ __html: activePage.content }}
          />
        </div>

        {/* Locked Overlay */}
        {showOverlay && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95">
              {isLockedSchedule ? (
                <>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-indigo-500/20">
                    <Calendar className="w-7 h-7 md:w-8 md:h-8 text-indigo-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Coming Soon</h3>
                  <p className="text-zinc-400 mb-6 text-sm md:text-base">
                    This chapter is scheduled to be released on:
                    <br />
                    <span className="text-white font-bold mt-2 block">
                      {new Date(activePage.scheduledAt!).toLocaleString()}
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-amber-500/20">
                    <Lock className="w-7 h-7 md:w-8 md:h-8 text-amber-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Premium Content</h3>
                  <p className="text-zinc-400 mb-6 text-sm md:text-base">
                    Purchase this book to unlock all chapters and support the author.
                  </p>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <button 
                    onClick={handleBuy}
                    disabled={buying}
                    className="w-full py-3.5 md:py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    {buying ? 'Processing...' : (
                      <>
                        Unlock for ${book.price} <BookOpen className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      {!showOverlay && (
        <div className={`fixed bottom-0 left-0 right-0 border-t backdrop-blur-xl z-40 transition-all duration-300
          ${showBottomBar ? 'translate-y-0' : 'translate-y-full'}
          ${theme === 'dark' ? 'bg-[#0a0a0a]/95 border-white/10' : 
            theme === 'light' ? 'bg-white/95 border-zinc-200' : 
            'bg-[#f4ecd8]/95 border-[#e3dccb]'}`}
        >
          <div className="max-w-3xl mx-auto px-3 md:px-4 py-3 md:py-4">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrev}
                disabled={currentPage === 0}
                className={`p-3 rounded-xl transition-all disabled:opacity-20
                  ${theme === 'dark' ? 'hover:bg-white/10 active:bg-white/20' : 'hover:bg-black/5 active:bg-black/10'}`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex-1 flex flex-col items-center gap-2">
                {/* Progress Bar */}
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}>
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
                  />
                </div>
                
                {/* Page Info */}
                <span className="text-xs font-medium opacity-60">
                  {currentPage + 1} / {pages.length}
                </span>
              </div>

              <button
                onClick={handleNext}
                disabled={currentPage === pages.length - 1}
                className={`p-3 rounded-xl transition-all disabled:opacity-20
                  ${theme === 'dark' ? 'hover:bg-white/10 active:bg-white/20' : 'hover:bg-black/5 active:bg-black/10'}`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character Chat */}
      <CharacterChat 
        bookId={book.id} 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
      />

      {/* Reading Room Control */}
      {roomState.isActive && roomId && (
        <ReadingRoomControl
          roomId={roomId}
          isHost={roomState.isHost}
          participantCount={roomState.participants.length}
          hostName={roomState.hostName || 'Host'}
        />
      )}

      {/* Floating Share Button */}
      {selectionPosition && !showShareModal && (
        <button
          style={{
            position: 'fixed',
            top: `${selectionPosition.y}px`,
            left: `${selectionPosition.x}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="z-50 mb-2 bg-zinc-900 text-white px-3 py-1.5 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium animate-in zoom-in-95 hover:scale-105 transition-transform"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowShareModal(true);
          }}
        >
          <Share2 className="w-3 h-3" /> Share
        </button>
      )}

      <ShareQuoteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        quote={selectedQuote}
        bookTitle={book.title}
        authorName={book.author.name || book.author.username}
        isPremiumUser={isSubscriber}
      />

      {/* Ambience Player */}
      {book.ambience && (
        <AmbiencePlayer type={book.ambience} theme={theme} showBottomBar={showBottomBar} />
      )}
    </div>
  );
}

function AmbiencePlayer({ type, theme, showBottomBar }: { type: string; theme: Theme; showBottomBar: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  const sounds: Record<string, string> = {
    rain: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
    fireplace: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
    forest: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_822ca886b2.mp3',
    cafe: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_596f6d8424.mp3',
    space: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
    ocean: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log('Autoplay prevented:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, volume]);

  if (!sounds[type]) return null;

  return (
    <div 
      className={`fixed right-3 z-50 flex items-center gap-2 backdrop-blur-xl border p-2 rounded-full animate-in slide-in-from-bottom-5 transition-all duration-300
        ${showBottomBar ? 'bottom-20 md:bottom-24' : 'bottom-4'}
        ${theme === 'dark' ? 'bg-black/80 border-white/10' : 'bg-white/80 border-black/10'}`}
    >
      <audio ref={audioRef} src={sounds[type]} loop />
      
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-indigo-500 text-white' : `${theme === 'dark' ? 'bg-white/10 text-zinc-400' : 'bg-black/10 text-zinc-600'} hover:opacity-80`}`}
      >
        {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {isPlaying && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-16 h-1 bg-current opacity-20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      )}
    </div>
  );
}
