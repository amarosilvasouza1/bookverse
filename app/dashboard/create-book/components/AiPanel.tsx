import { Loader2, Sparkles, Key, FileText, BookOpen, AlignLeft, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import ApiKeyTutorialModal from './ApiKeyTutorialModal';

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
  const [showTutorial, setShowTutorial] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <ApiKeyTutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      <div className="p-4 bg-linear-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Sparkles className="w-20 h-20 text-purple-500" />
        </div>
        
        <div className="flex items-center gap-2 text-purple-400 font-bold text-sm relative z-10">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
          {t('aiAssistant')}
        </div>
        
        <div className="space-y-2 relative z-10">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
            <Key className="w-3 h-3" /> {t('apiKey')}
            <button
              onClick={() => setShowTutorial(true)}
              className="ml-auto flex items-center gap-1 text-[9px] text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20"
            >
              <HelpCircle className="w-3 h-3" />
              {t('howToGetKey')}
            </button>
          </label>
          <input
            type="password"
            placeholder={t('pasteApiKey')}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2 relative z-10">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('generationMode')}</label>
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
              <span className="text-[9px] font-medium">{t('completeBook')}</span>
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
              <span className="text-[9px] font-medium">{t('structureOnly')}</span>
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
              <span className="text-[9px] font-medium">{t('singlePage')}</span>
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
              <span className="text-[9px] font-medium">{t('betaReader')}</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 relative z-10">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            {aiMode === 'analyze' ? t('analysisResult') : t('prompt')}
          </label>
          <textarea
            placeholder={
              aiMode === 'page' 
                ? t('describeScene')
                : aiMode === 'analyze'
                ? t('analysisPlaceholder')
                : t('describeBook')
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
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('length')}</label>
              <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">{pageCount} {t('pagesCount')}</span>
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
              <span>{t('short')}</span>
              <span>{t('medium')}</span>
              <span>{t('long')}</span>
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
              {t('generating')}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              {t('generate')}
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
