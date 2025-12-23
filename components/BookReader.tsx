'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Lock, BookOpen, Heart, Settings, Maximize, Minimize, X, MessageCircle, Volume2, VolumeX, Calendar, Menu, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import CharacterChat from './CharacterChat';
import { addBookmark, removeBookmark, saveReadingProgress } from '@/app/actions/reading';
import { buyBook } from '@/app/actions/buy-book';

import AddToListButton from './AddToListButton';

export interface BookReaderProps {
  book: {
    id: string;
    title: string;
    content: string;
    isPremium: boolean;
    allowDownload: boolean;
    ambience: string | null;
    price: number;
    authorId: string;
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
  listsContainingBook?: string[];
  userId?: string;
  initialPage?: number;
}

type Theme = 'light' | 'dark' | 'sepia' | 'midnight';
type FontFamily = 'sans' | 'serif' | 'mono';

const themeStyles = {
  light: 'bg-[#fafafa] text-zinc-900 selection:bg-indigo-200 selection:text-indigo-900',
  sepia: 'bg-[#f4ecd8] text-[#433422] selection:bg-[#d6cbb1] selection:text-[#433422]',
  dark: 'bg-[#121212] text-[#d4d4d4] selection:bg-indigo-500/30 selection:text-indigo-200',
  midnight: 'bg-[#050505] text-[#a1a1aa] selection:bg-indigo-500/30 selection:text-indigo-200'
};

const fontStyles = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono'
};

interface Bookmark {
  id: string;
  pageNumber: number;
  note?: string | null;
  createdAt: Date;
}

export function BookReader({ book, canRead, isAuthor, isSubscriber: _isSubscriber, listsContainingBook = [], userId: _userId, initialPage = 0 }: BookReaderProps) {
  const [theme, setTheme] = useState<Theme>('midnight');
  const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
  const [fontSize, setFontSize] = useState(20);

  // Initialize page index from prop
  const getInitialIndex = () => {
    if (!initialPage) return 0;
    const index = book.pages.findIndex(p => p.pageNumber === initialPage);
    return index >= 0 ? index : 0;
  };
  
  const [currentPage, setCurrentPage] = useState(getInitialIndex);

  const [showUI, setShowUI] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkNote, setBookmarkNote] = useState('');
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [likes, setLikes] = useState(0); 
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed
  const pages = book.pages.sort((a, b) => a.pageNumber - b.pageNumber);
  const activePage = pages[currentPage] || pages[0];
  const isLockedSchedule = activePage.scheduledAt ? new Date(activePage.scheduledAt) > new Date() : false;
  // Overlay logic
  const showOverlay = !canRead && (activePage.pageNumber > 2 && !isAuthor) || isLockedSchedule; 

  // Load Settings from LocalStorage
  useEffect(() => {
    try {
        const savedTheme = localStorage.getItem('reader_theme') as Theme;
        const savedFont = localStorage.getItem('reader_font') as FontFamily;
        const savedSize = localStorage.getItem('reader_size');

        if (savedTheme) setTheme(savedTheme);
        if (savedFont) setFontFamily(savedFont);
        if (savedSize) setFontSize(parseInt(savedSize));
    } catch (e) {
        console.error('Failed to load settings', e);
    }
  }, []);

  // Save Settings to LocalStorage
  useEffect(() => {
    try {
        localStorage.setItem('reader_theme', theme);
        localStorage.setItem('reader_font', fontFamily);
        localStorage.setItem('reader_size', fontSize.toString());
    } catch (e) {
        console.error('Failed to save settings', e);
    }
  }, [theme, fontFamily, fontSize]);

  // Save Reading Progress to DB
  useEffect(() => {
    const timer = setTimeout(() => {
        if (pages[currentPage]) {
            saveReadingProgress(book.id, pages[currentPage].pageNumber);
        }
    }, 2000); // 2s debounce

    return () => clearTimeout(timer);
  }, [currentPage, book.id, pages]);

  // Effects
  useEffect(() => {
    if (!activePage) setCurrentPage(0);
  }, [activePage]);

  // Scroll handler to toggle UI
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          // Hide UI on scroll down, show on scroll up
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setShowUI(false);
            setShowSettings(false);
            setShowTOC(false);
          } else if (currentScrollY < lastScrollY) {
            setShowUI(true);
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handlers
  const handlePrev = () => {
    if (currentPage > 0) {
        setCurrentPage(p => p - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
        setCurrentPage(p => p + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPage = (index: number) => {
    if (index >= 0 && index < pages.length) {
      setCurrentPage(index);
      setShowTOC(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.error(e));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(e => console.error(e));
      setIsFullscreen(false);
    }
  };

  const handleLike = async () => {
    setLikeLoading(true);
    setTimeout(() => {
        setIsLiked(!isLiked);
        setLikes(prev => isLiked ? prev - 1 : prev + 1);
        setLikeLoading(false);
    }, 500);
  };

  const handleBuy = async () => {
    setBuying(true);
    try {
        await buyBook(book.id);
        window.location.reload(); 
    } catch {
        setError('Failed to purchase');
    } finally {
        setBuying(false);
    }
  };

  const handleContentTap = () => {
    // Toggle UI visibility
    setShowUI(prev => !prev);
    // Close panels if open
    if (showSettings) setShowSettings(false);
    if (showTOC) setShowTOC(false);
  };

  const isDark = theme === 'dark' || theme === 'midnight';

  // Styles for Floating Glass UI
  const glassPanelClass = `
    backdrop-blur-xl border shadow-2xl transition-all duration-300
    ${isDark ? 'bg-black/60 border-white/10 text-zinc-200' : 'bg-white/80 border-black/5 text-zinc-800'}
  `;

  return (
    <div className={`min-h-screen transition-colors duration-500 ease-in-out font-sans ${themeStyles[theme]} ${isFullscreen ? 'p-0' : 'p-0'}`}>
      
      {/* ------------------- Floating Top Bar ------------------- */}
      <div 
        className={`fixed top-6 left-0 right-0 z-50 md:pl-20 lg:pl-64 flex justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] pointer-events-none
          ${showUI ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}
      >
        <div className={`w-[95%] max-w-3xl rounded-full px-4 py-2.5 flex items-center justify-between pointer-events-auto ${glassPanelClass}`}>
            <div className="flex items-center gap-2 md:gap-4 overflow-hidden flex-1 mr-2">
                <Link href="/dashboard/browse" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors shrink-0">
                    <ArrowLeft className="w-5 h-5 opacity-70" />
                </Link>
                
                <div className="h-5 w-px bg-current opacity-10 mx-1 shrink-0" />
                
                <div className="flex flex-col min-w-0">
                    <h1 className="text-sm font-semibold truncate leading-tight w-full max-w-[150px] sm:max-w-xs">{book.title}</h1>
                    <span className="text-[10px] opacity-60 truncate font-mono tracking-wide">CHAP {currentPage + 1}</span>
                </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                 {/* Table of Contents Trigger */}
                 <button onClick={() => setShowTOC(!showTOC)} className={`p-2 rounded-full transition-colors relative group ${showTOC ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/10'}`}>
                    <Menu className="w-4 h-4 sm:w-5 sm:h-5 opacity-70 group-hover:opacity-100" />
                </button>

                 {/* Settings Trigger */}
                 <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-full transition-colors relative group ${showSettings ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/10'}`}>
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 opacity-70 group-hover:opacity-100" />
                </button>
                
                <div className="h-5 w-px bg-current opacity-10 mx-1 hidden sm:block" />

                <button onClick={toggleFullscreen} className="p-2 rounded-full hover:bg-white/10 transition-colors hidden sm:block">
                    {isFullscreen ? <Minimize className="w-4 h-4 opacity-70" /> : <Maximize className="w-4 h-4 opacity-70" />}
                </button>
            </div>
        </div>
      </div>

      {/* ------------------- Settings Panel (Floating) ------------------- */}
      {showSettings && (
        <div className={`fixed top-24 right-4 sm:right-[calc(50%-18rem)] md:right-auto md:left-1/2 md:translate-x-32 z-50 w-72 rounded-2xl p-5 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 ${glassPanelClass}`}>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-widest opacity-50">Typography</span>
                <button onClick={() => setShowSettings(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors"><X className="w-4 h-4 opacity-50" /></button>
            </div>

            {/* Theme Grid */}
            <div className="mb-6">
                <div className="grid grid-cols-4 gap-3">
                    {(['light', 'sepia', 'dark', 'midnight'] as Theme[]).map(t => (
                        <button 
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`h-10 rounded-xl border transition-all duration-300 relative overflow-hidden group
                            ${theme === t ? 'ring-2 ring-indigo-500 border-transparent scale-105 shadow-lg' : 'border-black/5 dark:border-white/10 opacity-70 hover:opacity-100 hover:scale-105'} 
                            ${t === 'light' ? 'bg-[#fafafa]' : t === 'sepia' ? 'bg-[#f4ecd8]' : t === 'dark' ? 'bg-[#121212]' : 'bg-[#050505]'}`} 
                            title={t}
                        >
                            {theme === t && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className={`w-1.5 h-1.5 rounded-full ${t === 'light' || t === 'sepia' ? 'bg-black' : 'bg-white'}`} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Font Control */}
             <div className="mb-6">
                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl mb-4">
                     {(['sans', 'serif', 'mono'] as FontFamily[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setFontFamily(f)}
                            className={`flex-1 py-2 text-xs rounded-lg transition-all duration-300
                            ${fontFamily === f ? 'bg-white dark:bg-zinc-800 shadow-sm font-bold text-indigo-500' : 'opacity-50 hover:opacity-100'}`}
                        >
                            {f === 'sans' ? 'Sans' : f === 'serif' ? 'Serif' : 'Mono'}
                        </button>
                    ))}
                </div>
                
                {/* Size Slider */}
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold opacity-30">Aa</span>
                    <div className="flex-1 relative h-8 flex items-center">
                        <div className="absolute w-full h-1 bg-current opacity-10 rounded-full"></div>
                        <input 
                            type="range" min="16" max="32" step="2" 
                            value={fontSize} 
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="w-full absolute opacity-0 cursor-pointer h-full z-10"
                        />
                         <div 
                            className="absolute h-1 bg-indigo-500 rounded-full pointer-events-none transition-all duration-100" 
                            style={{ width: `${((fontSize - 16) / 16) * 100}%` }} 
                        />
                        <div 
                            className="absolute w-4 h-4 bg-white shadow-md rounded-full pointer-events-none transition-all duration-100 flex items-center justify-center border border-black/10"
                            style={{ left: `${((fontSize - 16) / 16) * 100}%`, transform: 'translateX(-50%)' }}
                        >
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        </div>
                    </div>
                    <span className="text-xs font-bold opacity-30">Aa</span>
                </div>
            </div>
        </div>
      )}

      {/* ------------------- Table of Contents (Floating Sidebar) ------------------- */}
      {showTOC && (
        <>
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-500" onClick={() => setShowTOC(false)} />
            <div className={`fixed top-24 left-4 sm:left-[calc(50%-24rem)] z-50 w-72 max-h-[60vh] overflow-y-auto rounded-2xl p-2 animate-in slide-in-from-left-4 fade-in duration-300 custom-scrollbar ${glassPanelClass}`}>
                <div className="p-4 pb-2 border-b border-white/5 mb-2 flex items-center justify-between sticky top-0 bg-inherit z-10 backdrop-blur-md">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-50">Chapters</span>
                    <span className="text-[10px] font-mono opacity-30">{pages.length} Total</span>
                </div>
                <div className="space-y-1 p-1">
                    {pages.map((p, i) => (
                        <button
                            key={i}
                            onClick={() => goToPage(i)}
                            className={`w-full text-left p-3 rounded-xl text-sm transition-all duration-200 group relative
                            ${currentPage === i ? 'bg-indigo-500/10 text-indigo-400 font-medium pl-4' : 'hover:bg-white/5 opacity-70 hover:opacity-100 hover:pl-4 pl-3'}`}
                        >
                            {currentPage === i && (
                                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-full" />
                            )}
                             <div className="flex items-baseline gap-3">
                                <span className={`text-[10px] font-mono transition-colors ${currentPage === i ? 'text-indigo-400/50' : 'opacity-30'}`}>{i + 1 < 10 ? `0${i+1}` : i+1}</span>
                                <span className="truncate line-clamp-1">{p.title || `Chapter ${i + 1}`}</span>
                             </div>
                        </button>
                    ))}
                </div>
            </div>
        </>
      )}

      {/* ------------------- Main Reading Surface ------------------- */}
      <div 
        ref={contentRef}
        onClick={handleContentTap}
        className="min-h-screen w-full max-w-3xl mx-auto pt-32 pb-40 px-6 sm:px-10 md:px-16 outline-none relative z-10"
      >
        <div 
            className={`transition-all duration-500 ease-in-out ${fontStyles[fontFamily]} ${showOverlay ? 'blur-sm select-none opacity-50' : 'opacity-100'}`}
            style={{ 
                fontSize: `${fontSize}px`, 
                lineHeight: '1.8',
            }}
        >
             {activePage.title && (
                <div className="mb-16 mt-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <span className="text-xs font-bold uppercase tracking-[0.4em] opacity-40 mb-4 block text-indigo-500">Chapter {currentPage + 1}</span>
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-8">{activePage.title}</h2>
                    <div className="w-24 h-1 bg-linear-to-r from-transparent via-indigo-500/20 to-transparent mx-auto rounded-full" />
                </div>
            )}

            <div 
             className="prose dark:prose-invert max-w-none animate-in fade-in duration-700 delay-150 rendering-optimizeLegibility"
             dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activePage.content) }}
             style={{
                 textRendering: 'optimizeLegibility',
                 WebkitFontSmoothing: 'antialiased',
             }}
             />
             
             {/* End of Chapter Marker */}
             <div className="flex justify-center mt-32 mb-10 opacity-20 gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
             </div>
        </div>
      </div>

       {/* ------------------- Locked Content Overlay ------------------- */}
        {showOverlay && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md transition-all duration-700">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-10 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 ring-1 ring-white/10 relative overflow-hidden">
             
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

              {isLockedSchedule ? (
                <>
                   <Calendar className="w-16 h-16 text-indigo-400 mx-auto mb-8 opacity-80" />
                  <h3 className="text-3xl font-serif font-bold text-white mb-3">Coming Soon</h3>
                  <p className="text-zinc-400 mb-10 leading-relaxed">
                    This chapter is scheduled to be released on<br/>
                    <span className="text-white font-medium bg-white/10 px-3 py-1 rounded-full mt-2 inline-block text-sm">{new Date(activePage.scheduledAt!).toLocaleDateString()}</span>
                  </p>
                </>
              ) : (
                <>
                  <Lock className="w-16 h-16 text-amber-400 mx-auto mb-8 opacity-80" />
                  <h3 className="text-3xl font-serif font-bold text-white mb-3">Premium Chapter</h3>
                  <p className="text-zinc-400 mb-10 px-4 leading-relaxed">
                    Support <span className="text-white font-medium">{book.author.name || 'the author'}</span> to unlock this chapter and the rest of the book.
                  </p>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
                      {error}
                    </div>
                  )}

                  <button 
                    onClick={handleBuy}
                    disabled={buying}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                  >
                    {buying ? 'Processing...' : (
                      <>
                        Unlock for ${book.price} <BookOpen className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      {/* ------------------- Floating Bottom Dock ------------------- */}
      {!showOverlay && (
        <div 
            className={`fixed bottom-8 left-0 right-0 z-50 md:pl-20 lg:pl-64 flex justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] pointer-events-none
            ${showUI ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}
        >
            <div className={`w-auto pointer-events-auto rounded-full p-2.5 px-6 flex items-center gap-4 sm:gap-6 shadow-2xl ring-1 ring-white/5 ${glassPanelClass}`}>
                
                {/* Prev Button */}
                <button
                    onClick={handlePrev}
                    disabled={currentPage === 0}
                    className="p-3 -ml-2 rounded-full hover:bg-white/10 disabled:opacity-20 transition-all hover:scale-110 active:scale-95 shrink-0"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                 {/* Progress Display */}
                 <div className="flex flex-col items-center flex-1 px-2 group cursor-pointer min-w-[120px]" onClick={() => setShowTOC(true)}>
                    <div className="w-full h-1 bg-current opacity-10 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest group-hover:opacity-100 transition-opacity">
                        {Math.round(((currentPage + 1) / pages.length) * 100)}% Complete
                    </span>
                 </div>

                {/* Next Button */}
                 <button
                    onClick={handleNext}
                    disabled={currentPage === pages.length - 1}
                    className="p-3 -mr-2 rounded-full hover:bg-white/10 disabled:opacity-20 transition-all hover:scale-110 active:scale-95 shrink-0"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                 <div className="w-px h-8 bg-current opacity-10 hidden sm:block mx-2" />

                 {/* Actions */}
                <div className="flex items-center gap-2 hidden sm:flex">
                     <button onClick={handleLike} disabled={likeLoading} className={`p-2.5 rounded-full transition-all flex items-center gap-2 ${isLiked ? 'text-red-500 bg-red-500/10' : 'hover:bg-white/10 opacity-70 hover:opacity-100 hover:scale-110'}`}>
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        {likes > 0 && <span className="text-xs font-bold">{likes}</span>}
                    </button>

                    <button onClick={() => setShowChat(!showChat)} className={`p-2.5 rounded-full transition-all ${showChat ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/10 opacity-70 hover:opacity-100 hover:scale-110'}`}>
                        <MessageCircle className="w-4 h-4" />
                    </button>

                     <button onClick={() => setShowBookmarkModal(true)} className={`p-2.5 rounded-full transition-all ${bookmarks.some(b => b.pageNumber === currentPage + 1) ? 'text-amber-400 bg-amber-400/10' : 'hover:bg-white/10 opacity-70 hover:opacity-100 hover:scale-110'}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill={bookmarks.some(b => b.pageNumber === currentPage + 1) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                         </svg>
                    </button>

                    <AddToListButton bookId={book.id} listsContainingBook={listsContainingBook} compact={true} />
                </div>
            </div>
        </div>
      )}

      {/* ------------------- Modals & Chat ------------------- */}
      <CharacterChat 
        bookId={book.id} 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
      />

       {/* Bookmark Modal */}
       {showBookmarkModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 content-center" onClick={() => setShowBookmarkModal(false)}>
          <div 
            className={`w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#111] border border-white/10 text-white' : 'bg-white text-zinc-900 border border-zinc-200'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <span className="text-amber-400">🔖</span> Bookmarks
                </h2>
                <button onClick={() => setShowBookmarkModal(false)}><X className="w-5 h-5 opacity-50 hover:opacity-100" /></button>
            </div>
            
            <div className="mb-6">
              <label className="text-xs font-bold uppercase opacity-50 mb-2 block tracking-wider">Current Page ({currentPage + 1})</label>
              <textarea 
                placeholder="Add a note to remember this moment..."
                value={bookmarkNote}
                onChange={(e) => setBookmarkNote(e.target.value)}
                className={`w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all
                    ${isDark ? 'bg-white/5 border border-white/10 focus:bg-white/10' : 'bg-zinc-50 border border-zinc-200 focus:bg-white'}`}
                rows={3}
              />
              <button
                onClick={async () => {
                  const result = await addBookmark(book.id, currentPage + 1, bookmarkNote || undefined);
                  if (result.success && result.bookmark) {
                    setBookmarks(prev => [...prev, result.bookmark!]);
                    setBookmarkNote('');
                  }
                }}
                className="w-full mt-3 bg-indigo-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
              >
                Save Bookmark
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {bookmarks.length === 0 ? (
                <div className="text-center py-8 opacity-50 border-t border-dashed border-white/10">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm italic">No bookmarks yet.</p>
                </div>
              ) : (
                bookmarks.map(bm => (
                  <div key={bm.id} className={`flex items-center justify-between p-3 rounded-xl transition-all group ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/5' : 'bg-zinc-50 hover:bg-zinc-100 border border-zinc-100'}`}>
                    <button onClick={() => { goToPage(bm.pageNumber - 1); setShowBookmarkModal(false); }} className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-xs uppercase tracking-wider text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded">Page {bm.pageNumber}</span>
                        <span className="text-[10px] opacity-40">{new Date(bm.createdAt).toLocaleDateString()}</span>
                      </div>
                      {bm.note && <p className="text-sm opacity-80 line-clamp-1">{bm.note}</p>}
                    </button>
                    <button 
                      onClick={async () => {
                        await removeBookmark(bm.id);
                        setBookmarks(prev => prev.filter(b => b.id !== bm.id));
                      }}
                      className="p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 rounded-lg hover:scale-110"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Toast placeholder/Ambience (if needed) */}
      {book.ambience && (
        <AmbiencePlayer type={book.ambience} theme={theme} showUI={showUI} />
      )}

    </div>
  );
}

function AmbiencePlayer({ type, theme, showUI }: { type: string; theme: Theme; showUI: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  const sounds: Record<string, string> = {
    rain: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3', // Placeholder
    fireplace: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
    forest: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_822ca886b2.mp3',
    cafe: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_596f6d8424.mp3',
    space: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
    ocean: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  }, [isPlaying, volume]);

  if (!sounds[type]) return null;

  return (
    <div 
      className={`fixed right-4 z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] backdrop-blur-xl border rounded-full p-1.5 flex flex-col items-center gap-2 shadow-xl
       ${showUI ? 'bottom-28 opacity-100' : 'bottom-6 opacity-40 hover:opacity-100'}
       ${theme === 'dark' || theme === 'midnight' ? 'bg-black/60 border-white/10' : 'bg-white/80 border-black/10'}`}
    >
      <audio ref={audioRef} src={sounds[type]} loop />
      <button onClick={() => setIsPlaying(!isPlaying)} className={`p-2 rounded-full transition-all ${isPlaying ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'opacity-50 hover:opacity-100 hover:bg-white/10'}`}>
        {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>
      {isPlaying && (
         <div className="h-20 w-1 rounded-full bg-current opacity-20 relative my-1 group">
             <div className="absolute bottom-0 left-0 w-full bg-indigo-500 rounded-full transition-all" style={{ height: `${volume * 100}%` }} />
             <input 
                type="range" min="0" max="1" step="0.1" 
                value={volume} onChange={(e) => setVolume(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer w-4 -ml-1.5"
             />
         </div>
      )}
    </div>
  );
}
