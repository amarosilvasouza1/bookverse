'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Lock, BookOpen, Heart, Settings, Maximize, Minimize, Type, Palette, Monitor, X, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CharacterChat from './CharacterChat';
import ReadingRoomControl from './ReadingRoomControl';
import { getRoomState, updateRoomPage } from '@/app/actions/reading-room';
import { updateReadingProgress } from '@/app/actions/analytics';
import { buyBook } from '@/app/actions/buy-book';

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

type Theme = 'dark' | 'light' | 'sepia';
type FontFamily = 'serif' | 'sans' | 'mono';

export function BookReader({ book, canRead }: BookReaderProps) {
  // --- State: Content & Navigation ---
  const [currentPage, setCurrentPage] = useState(0);
  
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

  // --- State: Actions ---
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState('');
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // --- Effects: Reading Room Sync ---
  useEffect(() => {
    if (!roomId) return;

    const syncRoom = async () => {
      try {
        const result = await getRoomState(roomId);
        
        if (result.success && result.data) {
          const { currentPage: roomPage, status, host, participants, isHost } = result.data;
          
          setRoomState({
            isActive: status === 'ACTIVE',
            isHost: !!isHost,
            participants,
            hostName: host.name || 'Host'
          });

          // If participant (not host), sync page
          if (!isHost && status === 'ACTIVE') {
            // Adjust for 0-index
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

    // Initial sync
    syncRoom();

    // Poll every 2 seconds
    const interval = setInterval(syncRoom, 2000);
    return () => clearInterval(interval);
  }, [roomId]);

  // --- Handlers ---
  const handleNext = useCallback(() => {
    if (currentPage < pages.length - 1) {
      if (roomState.isActive && !roomState.isHost) return;

      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
      
      // Update progress
      updateReadingProgress(book.id, newPage + 1);

      // Update room if host
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
      window.scrollTo(0, 0);

      // Update progress
      updateReadingProgress(book.id, newPage + 1);

      // Update room if host
      if (roomState.isActive && roomState.isHost && roomId) {
        updateRoomPage(roomId, newPage + 1);
      }
    }
  }, [currentPage, book.id, roomState.isActive, roomState.isHost, roomId]);

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
  const showOverlay = !canRead;

  const themeStyles = {
    dark: 'bg-[#0a0a0a] text-zinc-300',
    light: 'bg-[#f8f9fa] text-zinc-800',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
  };

  const fontStyles = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono',
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeStyles[theme]}`}>
      {/* Top Bar */}
      <div className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 px-4 py-3 flex items-center justify-between
        ${theme === 'dark' ? 'bg-[#0a0a0a]/90 border-white/10' : 
          theme === 'light' ? 'bg-white/90 border-zinc-200' : 
          'bg-[#f4ecd8]/90 border-[#e3dccb]'}`}
      >
        <div className="flex items-center gap-4">
          <Link href="/dashboard/browse" className={`text-sm flex items-center hover:opacity-70 transition-opacity
             ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className="font-bold truncate max-w-[150px] sm:max-w-md text-sm sm:text-base">
            {book.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${isLiked ? 'bg-red-500/10 text-red-500' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </button>

          <div className="h-4 w-px bg-current opacity-20 mx-1" />

          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-lg transition-colors ${showChat ? 'bg-black/10 dark:bg-white/10 text-primary' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors hidden sm:block"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`fixed top-[60px] right-4 z-50 w-72 rounded-xl shadow-2xl border p-4 animate-in fade-in slide-in-from-top-2
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

          <div className="space-y-6">
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
                    className={`h-8 rounded-lg border flex items-center justify-center transition-all
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
              <div className="flex p-1 rounded-lg bg-black/5 dark:bg-white/5">
                {(['serif', 'sans', 'mono'] as FontFamily[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFontFamily(f)}
                    className={`flex-1 py-1.5 text-xs rounded-md transition-all
                      ${fontFamily === f ? 'bg-white dark:bg-zinc-800 shadow-sm font-medium' : 'opacity-60 hover:opacity-100'}`}
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
                max="32"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] opacity-50 font-mono">
                <span>14px</span>
                <span>32px</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 min-h-[80vh]">
        <div 
          className={`prose max-w-none leading-relaxed transition-all duration-300 ${fontStyles[fontFamily]} ${showOverlay ? 'select-none blur-[1px]' : ''}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {activePage.title && (
            <h2 className={`text-2xl font-bold mb-8 opacity-90 ${fontFamily === 'serif' ? 'font-serif' : 'font-bold'}`}>
              {activePage.title}
            </h2>
          )}
          
          <div className="whitespace-pre-wrap opacity-90">
            {activePage.content}
          </div>
        </div>

        {/* Locked Overlay */}
        {showOverlay && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Premium Content</h3>
              <p className="text-zinc-400 mb-8">
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
                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {buying ? 'Processing...' : (
                  <>
                    Unlock for ${book.price} <BookOpen className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Progress */}
      {!showOverlay && (
        <div className={`fixed bottom-0 left-0 right-0 border-t backdrop-blur-lg z-40 transition-colors duration-300
          ${theme === 'dark' ? 'bg-[#0a0a0a]/90 border-white/10' : 
            theme === 'light' ? 'bg-white/90 border-zinc-200' : 
            'bg-[#f4ecd8]/90 border-[#e3dccb]'}`}
        >
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex-1 max-w-md flex flex-col items-center gap-1">
              <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium opacity-50 font-mono">
                Page {currentPage + 1} of {pages.length}
              </span>
            </div>

            <button
              onClick={handleNext}
              disabled={currentPage === pages.length - 1}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
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
    </div>
  );
}
