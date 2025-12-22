import { Eye, EyeOff, Save, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import DOMPurify from 'isomorphic-dompurify';
import RichEditor from './RichEditor';
import { useLanguage } from '@/context/LanguageContext';

interface Page {
  id: string;
  title: string;
  content: string;
  pageNumber: number;
}

interface EditorMainProps {
  title: string;
  setTitle: (title: string) => void;
  pages: Page[];
  currentPageIndex: number;
  updateCurrentPage: (field: 'title' | 'content', value: string) => void;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  handleSave: (published: boolean) => void;
  loading: boolean;
  bookId?: string;
  isFocusMode: boolean;
  setIsFocusMode: (focus: boolean) => void;
}

export default function EditorMain({
  title,
  setTitle,
  pages,
  currentPageIndex,
  updateCurrentPage,
  showPreview,
  setShowPreview,
  handleSave,
  loading,
  isFocusMode,
  setIsFocusMode
}: EditorMainProps) {
  const { t } = useLanguage();
  const currentPage = pages[currentPageIndex];

  return (
    <div className="h-full relative flex flex-col font-sans">
      
      {/* Floating Toolbar - Glassmorphic Pill */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-3xl"
      >
        <div className="flex items-center justify-between p-2 pl-4 rounded-full bg-[#111]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 ring-1 ring-white/5">
          {/* Status & Stats */}
          <div className="flex items-center gap-4 text-[10px] sm:text-xs text-zinc-400 font-medium">
            <span className="flex items-center gap-2 text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_currentColor]" />
              <span className="hidden sm:inline tracking-wide">{t('autoSaving')}</span>
            </span>
            <span className="w-px h-3 bg-white/10" />
            <span className="hidden sm:inline font-mono opacity-80">{currentPage.content.length} chars</span>
            <span className="w-px h-3 bg-white/10 hidden sm:block" />
            <span className="tracking-wide text-zinc-300">{t('pageOf')} <span className="text-white">{currentPageIndex + 1}</span> / {pages.length}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`p-2 rounded-full transition-all ${isFocusMode ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              title={t('toggleFocusMode')}
            >
              {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className={`p-2 rounded-full transition-all flex items-center gap-2 ${
                showPreview 
                  ? 'bg-purple-500/20 text-purple-300' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              title={showPreview ? t('edit') : t('preview')}
            >
              {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            
            <div className="w-px h-4 bg-white/10 mx-1" />
            
            <button 
              onClick={() => handleSave(false)}
              disabled={loading}
              className="p-2 sm:px-4 sm:py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <span className="hidden sm:inline">{t('saveDraft')}</span>
              <span className="sm:hidden"><Save className="w-4 h-4" /></span>
            </button>
            
            <button 
              onClick={() => handleSave(true)}
              disabled={loading}
              className="flex items-center gap-2 px-3 sm:px-5 py-2 bg-white text-black font-bold text-xs rounded-full hover:bg-zinc-200 transition-all disabled:opacity-50 shadow-lg shadow-white/5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{t('publish')}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-24 pb-32 px-4 sm:px-8">
        <motion.div 
          layout
          className={`mx-auto transition-all duration-500 ease-out ${
            isFocusMode ? 'max-w-3xl' : 'max-w-4xl'
          }`}
        >
          {/* Header Area */}
          <div className="mb-12 space-y-6 text-center">
            {/* Book Title Input */}
            <div className="group relative inline-block max-w-full">
              <input
                type="text"
                placeholder={t('untitledBook')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-center text-4xl sm:text-5xl md:text-6xl font-bold font-serif placeholder:text-white/10 focus:outline-none border-none p-0 leading-tight text-white/90 selection:bg-indigo-500/30"
              />
              <div className="absolute top-1/2 -left-8 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hidden lg:block">
                #
              </div>
            </div>

            <div className="w-12 h-1 bg-linear-to-r from-transparent via-white/20 to-transparent mx-auto rounded-full" />

            {/* Chapter Title Input */}
            <div className="relative max-w-2xl mx-auto">
               <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-2">{t('currentChapter')}</label>
               <input
                type="text"
                placeholder={`${t('chapter')} ${currentPageIndex + 1}`}
                value={currentPage.title}
                onChange={(e) => updateCurrentPage('title', e.target.value)}
                className="w-full bg-transparent text-center text-2xl md:text-3xl font-medium placeholder:text-white/10 focus:outline-none border-none p-0 font-serif leading-tight text-zinc-200"
              />
            </div>
          </div>

          {/* Editor Surface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={`
              min-h-[60vh] rounded-xl sm:rounded-2xl transition-all duration-500
              ${showPreview 
                ? 'bg-transparent p-0' 
                : 'bg-[#111]/40 backdrop-blur-sm border border-white/5 p-4 sm:p-8 md:p-12 shadow-2xl ring-1 ring-white/5 hover:ring-white/10'
              }
            `}
          >
            {showPreview ? (
              <div className="prose prose-invert prose-lg max-w-none font-serif leading-loose text-zinc-300 selection:bg-indigo-500/30">
                {currentPage.content ? (
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentPage.content) }} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-zinc-600 opacity-50">
                    <p className="italic text-lg">{t('nothingWritten')}</p>
                  </div>
                )}
              </div>
            ) : (
              <RichEditor
                content={currentPage.content}
                onChange={(content) => updateCurrentPage('content', content)}
                placeholder={t('editorPlaceholder')}
              />
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
