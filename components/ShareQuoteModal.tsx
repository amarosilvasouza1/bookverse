'use client';

import { useState, useRef } from 'react';
import { X, Download, Share2, Palette, Quote, Lock, Smile, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';

interface ShareQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: string;
  bookTitle: string;
  authorName: string;
  isPremiumUser: boolean;
}

type CardTheme = 'gradient-purple' | 'gradient-blue' | 'dark' | 'light' | 'paper' | 'galaxy' | 'gold' | 'midnight' | 'nature';

interface Sticker {
  id: string;
  content: string;
  x: number;
  y: number;
}

interface ThemeStyles {
  background: string;
  color: string;
  borderColor?: string;
  isPremium: boolean;
}

export default function ShareQuoteModal({ isOpen, onClose, quote, bookTitle, authorName, isPremiumUser }: ShareQuoteModalProps) {
  const [theme, setTheme] = useState<CardTheme>('gradient-purple');
  const [activeTab, setActiveTab] = useState<'themes' | 'stickers'>('themes');
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const themes: Record<CardTheme, ThemeStyles> = {
    // Free Themes
    'gradient-purple': { background: 'linear-gradient(135deg, #4f46e5, #9333ea, #db2777)', color: '#ffffff', isPremium: false },
    'gradient-blue': { background: 'linear-gradient(135deg, #2563eb, #0891b2, #0d9488)', color: '#ffffff', isPremium: false },
    'dark': { background: '#18181b', color: '#f4f4f5', borderColor: '#27272a', isPremium: false },
    'light': { background: '#ffffff', color: '#18181b', borderColor: '#e4e4e7', isPremium: false },
    'paper': { background: '#f4ecd8', color: '#5b4636', borderColor: '#e3dccb', isPremium: false },
    
    // Premium Themes
    'galaxy': { background: 'linear-gradient(135deg, #0f172a, #312e81, #4c1d95)', color: '#e0e7ff', isPremium: true },
    'gold': { background: 'linear-gradient(135deg, #78350f, #b45309, #f59e0b)', color: '#fffbeb', isPremium: true },
    'midnight': { background: 'linear-gradient(to bottom, #020617, #1e1b4b)', color: '#c7d2fe', isPremium: true },
    'nature': { background: 'linear-gradient(135deg, #14532d, #15803d, #4ade80)', color: '#f0fdf4', isPremium: true },
  };

  const availableStickers = ['❤️', '🔥', '✨', '📚', '💡', '🌟', '💭', '☕', '🍂', '👑', '💎', '🚀', '💯', '🎨', '🎵', '🌈'];

  const addSticker = (content: string) => {
    const newSticker: Sticker = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      x: 0,
      y: 0,
    };
    setStickers([...stickers, newSticker]);
  };

  const removeSticker = (id: string) => {
    setStickers(stickers.filter(s => s.id !== id));
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      // Wait for any images/fonts to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Higher quality
        backgroundColor: null,
        useCORS: true,
        logging: false,
        allowTaint: true,
        // Force specific dimensions if needed, but auto usually works
      });
      
      const image = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = image;
      link.download = `quote-${bookTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('Error generating image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#18181b] border border-white/10 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] ring-1 ring-white/10">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-500" />
              Share Quote
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Customize and share your favorite moments</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-8 bg-[#09090b] flex items-center justify-center overflow-y-auto min-h-[300px]">
          <div 
            ref={cardRef}
            className="relative w-full aspect-square sm:aspect-[4/5] p-8 sm:p-12 rounded-xl shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300"
            style={{
              background: themes[theme].background,
              color: themes[theme].color,
              border: `1px solid ${themes[theme].borderColor || 'transparent'}`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Stickers Layer */}
            {stickers.map((sticker) => (
              <motion.div
                key={sticker.id}
                drag
                dragMomentum={false}
                dragConstraints={cardRef}
                className="absolute z-10 cursor-move text-5xl select-none"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                }}
              >
                {sticker.content}
                <button 
                  onClick={(e) => { e.stopPropagation(); removeSticker(sticker.id); }}
                  className="absolute -top-3 -right-3 w-6 h-6 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity shadow-lg"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}

            <div className="absolute top-6 right-6 opacity-30 pointer-events-none">
              <Quote className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" />
            </div>
            
            <div className="flex-1 flex items-center justify-center my-4 pointer-events-none z-0 w-full">
              <p 
                className="font-serif leading-relaxed text-center italic font-medium w-full break-words whitespace-pre-wrap px-2"
                style={{ 
                  textShadow: theme === 'light' || theme === 'paper' ? 'none' : '0 2px 4px rgba(0,0,0,0.3)',
                  fontSize: quote.length > 300 ? '1rem' : 
                           quote.length > 200 ? '1.25rem' : 
                           quote.length > 100 ? '1.5rem' : 
                           quote.length > 50 ? '1.875rem' : '2.25rem',
                  lineHeight: quote.length > 200 ? '1.5' : '1.4'
                }}
              >
                &ldquo;{quote}&rdquo;
              </p>
            </div>

            <div className="text-center mt-4 pointer-events-none z-0">
              <div 
                className="h-px w-16 mx-auto mb-3 opacity-50" 
                style={{ backgroundColor: 'currentColor' }} 
              />
              <h4 className="font-bold text-xs sm:text-sm uppercase tracking-[0.2em] opacity-90 mb-1 truncate max-w-[200px] mx-auto">{bookTitle}</h4>
              <p className="text-[10px] sm:text-xs opacity-70 font-medium truncate max-w-[200px] mx-auto">by {authorName}</p>
            </div>

            {/* Watermark */}
            <div className="absolute bottom-3 right-4 text-[9px] sm:text-[10px] opacity-40 font-mono pointer-events-none tracking-wider">
              bookverse.app
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-5 bg-[#18181b] border-t border-white/5 space-y-5">
          {/* Tabs */}
          <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('themes')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2
                ${activeTab === 'themes' ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/5' : 'text-zinc-500 hover:text-zinc-300'}
              `}
            >
              <Palette className="w-4 h-4" /> Themes
            </button>
            <button
              onClick={() => setActiveTab('stickers')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2
                ${activeTab === 'stickers' ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/5' : 'text-zinc-500 hover:text-zinc-300'}
              `}
            >
              <Smile className="w-4 h-4" /> Stickers
            </button>
          </div>

          {activeTab === 'themes' ? (
            <div className="space-y-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Select Theme</label>
                {!isPremiumUser && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Premium Unlocked
                  </span>
                )}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent px-1">
                {(Object.keys(themes) as CardTheme[]).map((t) => {
                  const isLocked = themes[t].isPremium && !isPremiumUser;
                  const isSelected = theme === t;
                  return (
                    <button
                      key={t}
                      onClick={() => !isLocked && setTheme(t)}
                      className={`relative w-12 h-12 rounded-full transition-all shrink-0 group
                        ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#18181b] scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'}
                        ${isLocked ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
                      `}
                      style={{ background: themes[t].background }}
                      title={t}
                    >
                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full backdrop-blur-[1px]">
                          <Lock className="w-4 h-4 text-white/90" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-full ring-1 ring-black/20" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Add Stickers</label>
                {stickers.length > 0 && (
                  <button 
                    onClick={() => setStickers([])}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-8 gap-2">
                {availableStickers.map((sticker) => (
                  <button
                    key={sticker}
                    onClick={() => addSticker(sticker)}
                    className="aspect-square bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500 text-center pt-2">
                Drag stickers to move • Tap to remove
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> 
                  <span>Download Image</span>
                </>
              )}
            </button>
            
            <button
              onClick={async () => {
                if (!cardRef.current) return;
                try {
                  await new Promise(resolve => setTimeout(resolve, 100));
                  const canvas = await html2canvas(cardRef.current, {
                    scale: 2,
                    backgroundColor: null,
                    useCORS: true,
                    logging: false,
                  });
                  const image = canvas.toDataURL('image/png');
                  const win = window.open();
                  if (win) {
                    win.document.write('<html><head><title>Your Quote</title></head><body style="margin:0; display:flex; justify-content:center; align-items:center; background:#111;"><img src="' + image + '" style="max-width:100%; height:auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"/></body></html>');
                    win.document.close();
                  } else {
                    alert('Pop-up blocked!');
                  }
                } catch (e) {
                  console.error(e);
                  alert('Error');
                }
              }}
              className="px-5 py-3.5 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-2"
              title="Open in New Tab"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
