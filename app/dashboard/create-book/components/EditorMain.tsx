import { Eye, EyeOff, Save, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import RichEditor from './RichEditor';

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
  const currentPage = pages[currentPageIndex];

  return (
    <div className={`h-full flex flex-col transition-all duration-500 ${isFocusMode ? 'max-w-4xl mx-auto' : ''}`}>
      {/* Editor Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 mb-6 border-b border-white/5 gap-4 sm:gap-0">
        <div className="flex items-center gap-4 text-xs text-zinc-500 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <span className="flex items-center gap-2 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="hidden sm:inline">Auto-saving</span>
          </span>
          <span className="w-px h-3 bg-white/10 shrink-0" />
          <span className="shrink-0">{currentPage.content.length} chars</span>
          <span className="w-px h-3 bg-white/10 shrink-0" />
          <span className="shrink-0">Page {currentPageIndex + 1} of {pages.length}</span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button 
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Toggle Focus Mode"
          >
            {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          <div className="w-px h-4 bg-white/10 mx-1" />

          <button 
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showPreview 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {showPreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showPreview ? 'Preview' : 'Edit'}</span>
          </button>
          
          <button 
            onClick={() => handleSave(false)}
            disabled={loading}
            className="px-3 sm:px-4 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap"
          >
            <span className="hidden sm:inline">Save Draft</span>
            <span className="sm:hidden">Save</span>
          </button>
          
          <button 
            onClick={() => handleSave(true)}
            disabled={loading}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-white text-black font-bold text-xs rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-50 shadow-lg shadow-white/5 whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Publish</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
          {/* Book Title */}
          <div className="group relative">
            <input
              type="text"
              placeholder="Untitled Book"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-4xl md:text-5xl font-bold placeholder:text-white/10 focus:outline-none border-none p-0 font-serif leading-tight text-white/90"
            />
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-700">
              #
            </div>
          </div>

          {/* Page Title */}
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Current Chapter</label>
             <input
              type="text"
              placeholder={`Chapter ${currentPageIndex + 1}`}
              value={currentPage.title}
              onChange={(e) => updateCurrentPage('title', e.target.value)}
              className="w-full bg-transparent text-2xl md:text-3xl font-medium placeholder:text-white/10 focus:outline-none border-none p-0 font-serif leading-tight text-white/80"
            />
          </div>
          
          <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

          {/* Editor / Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-[50vh]"
          >
            {showPreview ? (
              <div className="prose prose-invert prose-lg max-w-none font-serif leading-loose text-zinc-300">
                {currentPage.content.split('\n\n').map((paragraph, index) => {
                  const parts = paragraph.split(/(\*\*.*?\*\*|\*.*?\*)/g);
                  return (
                    <p key={index} className="mb-6">
                      {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                        }
                        if (part.startsWith('*') && part.endsWith('*')) {
                          return <em key={i} className="text-white/80 italic">{part.slice(1, -1)}</em>;
                        }
                        return part;
                      })}
                    </p>
                  );
                })}
                {currentPage.content.length === 0 && (
                  <p className="text-zinc-600 italic">Nothing written yet...</p>
                )}
              </div>
            ) : (
              <RichEditor
                content={currentPage.content}
                onChange={(content) => updateCurrentPage('content', content)}
                placeholder="Once upon a time..."
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
