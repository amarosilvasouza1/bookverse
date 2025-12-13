'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Lock, BookOpen, Heart, Settings, Maximize, Minimize, Type, Palette, Monitor, X, MessageCircle, Share2, Volume2, VolumeX, Calendar, Menu, Home } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import CharacterChat from './CharacterChat';
import ReadingRoomControl from './ReadingRoomControl';
import ShareQuoteModal from './ShareQuoteModal';
import { getRoomState, updateRoomPage } from '@/app/actions/reading-room';
import { updateReadingProgress } from '@/app/actions/analytics';
import { buyBook } from '@/app/actions/buy-book';
import { startReadingSession, endReadingSession, addBookmark, removeBookmark, getBookmarks } from '@/app/actions/reading';

import AddToListButton from './AddToListButton';

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
  listsContainingBook?: string[];
}

type Theme = 'light' | 'dark' | 'sepia';
type FontFamily = 'sans' | 'serif' | 'mono';

const themeStyles = {
  light: 'bg-white text-zinc-900',
  dark: 'bg-[#0a0a0a] text-zinc-300',
  sepia: 'bg-[#f4ecd8] text-[#5b4636]'
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

export function BookReader({ book, canRead, isSubscriber, isAuthor, listsContainingBook = [] }: BookReaderProps) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [fontFamily, setFontFamily] = useState<FontFamily>('sans');
  const [fontSize, setFontSize] = useState(18);
  const [showTopBar, setShowTopBar] = useState(true);
  const [showBottomBar, setShowBottomBar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkNote, setBookmarkNote] = useState('');
  
  const [currentPage, setCurrentPage] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [likes, setLikes] = useState(0); // Mock for now
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Room State (Stubbed)
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState({ isActive: false, participants: [], isHost: false, hostName: '' });

  // Share
  const [selectionPosition, setSelectionPosition] = useState<{x: number, y: number} | null>(null);
  const [selectedQuote, setSelectedQuote] = useState('');

  // Computed
  const pages = book.pages.sort((a, b) => a.pageNumber - b.pageNumber);
  const activePage = pages[currentPage] || pages[0];
  const isLockedSchedule = activePage.scheduledAt ? new Date(activePage.scheduledAt) > new Date() : false;
  // Overlay logic: simplified. Checks if logic implies overlay needed.
  // Assuming overlay logic from JSX: "Locked" if not read/purchased
  const showOverlay = !canRead && (activePage.pageNumber > 2 && !isAuthor) || isLockedSchedule; 

  // Effects
  useEffect(() => {
    // Determine initial page or restore?
    // Minimal effect just to ensure we have valid page
    if (!activePage) setCurrentPage(0);
  }, [activePage]);

  // Handlers
  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(p => p - 1);
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) setCurrentPage(p => p + 1);
  };

  const goToPage = (index: number) => {
    if (index >= 0 && index < pages.length) {
      setCurrentPage(index);
      setShowTOC(false);
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
    // Mock like action
    setTimeout(() => {
        setIsLiked(!isLiked);
        setLikes(prev => isLiked ? prev - 1 : prev + 1);
        setLikeLoading(false);
    }, 500);
  };

  const handleBuy = async () => {
    setBuying(true);
    // Call buyBook action
    try {
        await buyBook(book.id);
        // Refresh or something
        window.location.reload(); 
    } catch (err) {
        setError('Failed to purchase');
    } finally {
        setBuying(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print(); // Simple fallback
  };

  const handleContentTap = () => {
    setShowTopBar(prev => !prev);
    setShowBottomBar(prev => !prev);
  };

  // Touch handlers (simplified placeholders to avoid error)
  const onTouchStart = () => {};
  const onTouchMove = () => {};
  const onTouchEnd = () => {};


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
            {/* Add To List Button */}
            <AddToListButton bookId={book.id} listsContainingBook={listsContainingBook} compact={true} />

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
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowBookmarkModal(false)}>
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
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm" onClick={() => setShowTOC(false)}>
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
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activePage.content) }}
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
