import { Loader2, Sparkles, Key, FileText, BookOpen, AlignLeft } from 'lucide-react';

interface AIPanelProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  pageCount: number;
  setPageCount: (count: number) => void;
  aiMode: 'complete' | 'structure' | 'page' | 'analyze';
  setAiMode: (mode: 'complete' | 'structure' | 'page' | 'analyze') => void;
  isGenerating: boolean;
  handleGenerateAI: () => void;
}

export default function AIPanel({
  apiKey,
  setApiKey,
  aiPrompt,
  setAiPrompt,
  pageCount,
  setPageCount,
  aiMode,
  setAiMode,
  isGenerating,
  handleGenerateAI,
}: AIPanelProps) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-linear-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Sparkles className="w-20 h-20 text-purple-500" />
        </div>
        
        <div className="flex items-center gap-2 text-purple-400 font-bold text-sm relative z-10">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
          AI Assistant
        </div>
        
        <div className="space-y-2 relative z-10">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
            <Key className="w-3 h-3" /> API Key
          </label>
          <input
            type="password"
            placeholder="Paste your Gemini API Key..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2 relative z-10">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Generation Mode</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setAiMode('complete')}
              className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border transition-all duration-200 ${
                aiMode === 'complete' 
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-sm' 
                  : 'bg-black/20 border-white/5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
              }`}
            >
              <BookOpen className="w-4 h-4 mb-1" />
              <span className="text-[9px] font-medium">Complete Book</span>
            </button>
            <button
              onClick={() => setAiMode('structure')}
              className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border transition-all duration-200 ${
                aiMode === 'structure' 
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-sm' 
                  : 'bg-black/20 border-white/5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
              }`}
            >
              <AlignLeft className="w-4 h-4 mb-1" />
              <span className="text-[9px] font-medium">Structure Only</span>
            </button>
            <button
              onClick={() => setAiMode('page')}
              className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border transition-all duration-200 ${
                aiMode === 'page' 
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-sm' 
                  : 'bg-black/20 border-white/5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
              }`}
            >
              <FileText className="w-4 h-4 mb-1" />
              <span className="text-[9px] font-medium">Single Page</span>
            </button>
            <button
              onClick={() => setAiMode('analyze')}
              className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border transition-all duration-200 ${
                aiMode === 'analyze' 
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-sm' 
                  : 'bg-black/20 border-white/5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
              }`}
            >
              <Sparkles className="w-4 h-4 mb-1" />
              <span className="text-[9px] font-medium">Beta Reader</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 relative z-10">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            {aiMode === 'analyze' ? 'Analysis Result' : 'Prompt'}
          </label>
          <textarea
            placeholder={
              aiMode === 'page' 
                ? "Describe the scene..." 
                : aiMode === 'analyze'
                ? "Analysis results will appear here..."
                : "Describe your book idea..."
            }
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            readOnly={aiMode === 'analyze'}
            rows={aiMode === 'analyze' ? 8 : 3}
            className={`w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 resize-none placeholder:text-zinc-600 leading-relaxed custom-scrollbar min-h-[80px] sm:min-h-[120px] ${aiMode === 'analyze' ? 'text-purple-300' : ''}`}
          />
        </div>

        {aiMode !== 'page' && aiMode !== 'analyze' && (
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Length</label>
              <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">{pageCount} Pages</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={pageCount}
              onChange={(e) => setPageCount(parseInt(e.target.value))}
              className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[9px] text-zinc-600 font-medium px-1">
              <span>Short</span>
              <span>Medium</span>
              <span>Long</span>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerateAI}
          disabled={isGenerating || !apiKey || (aiMode !== 'analyze' && !aiPrompt)}
          className="w-full py-3 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-purple-500/20 relative z-10 group"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Thinking...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              {aiMode === 'page' ? 'Generate Page' : aiMode === 'analyze' ? 'Analyze Draft' : 'Generate Book'}
            </>
          )}
        </button>
        
        <p className="text-[9px] text-zinc-500 text-center relative z-10">
          {aiMode === 'page' 
            ? '⚠️ Overwrites current page content'
            : aiMode === 'analyze'
            ? 'ℹ️ Analyzes current page content'
            : '⚠️ Overwrites title, description & pages'}
        </p>
      </div>
    </div>
  );
}
