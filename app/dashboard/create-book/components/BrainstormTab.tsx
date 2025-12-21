import { useState } from 'react';
import { Sparkles, Copy, RefreshCw, Send, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface BrainstormTabProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  isGenerating: boolean;
  onGenerate: (prompt: string) => Promise<{ ideas: string[]; summary?: string } | null>;
}

export default function BrainstormTab({ apiKey, setApiKey, isGenerating, onGenerate }: BrainstormTabProps) {
  const [prompt, setPrompt] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    const result = await onGenerate(prompt);
    
    if (result && result.ideas) {
      setIdeas(result.ideas);
      setSummary(result.summary || '');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-indigo-400">
          <Lightbulb className="w-5 h-5" />
          <h3 className="font-bold text-white">Brainstorm Partner</h3>
        </div>
        <button 
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          {showKeyInput ? 'Hide Key' : 'API Key'}
        </button>
      </div>

      {showKeyInput && (
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste API Key (optional)"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 mb-2"
        />
      )}

      <p className="text-xs text-zinc-400">
        Ask for character names, plot twists, world details, or magic systems.
      </p>

      {/* Input Area */}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g. Identify 3 flaws for my protagonist..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-hidden focus:border-indigo-500 min-h-[80px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={!prompt.trim() || isGenerating}
          className="absolute bottom-3 right-3 p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
        >
          {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {ideas.length > 0 ? (
           <div className="space-y-4">
             {summary && (
                 <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                   <p className="text-sm text-zinc-300 italic">&quot;{summary}&quot;</p>
                 </div>
             )}
             
             <div className="space-y-2">
               {ideas.map((idea, index) => (
                 <motion.div
                   key={index}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.1 }}
                   className="group relative p-3 bg-zinc-800 border border-zinc-700 rounded-xl hover:border-indigo-500/50 transition-colors"
                 >
                   <p className="text-sm text-zinc-200 pr-6">{idea}</p>
                   <button
                     onClick={() => copyToClipboard(idea)}
                     className="absolute top-2 right-2 p-1.5 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                     title="Copy"
                   >
                     <Copy className="w-3.5 h-3.5" />
                   </button>
                 </motion.div>
               ))}
             </div>
           </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 mt-10">
            <Sparkles className="w-12 h-12 mb-3" />
            <p className="text-sm">Ready to spark some ideas?</p>
          </div>
        )}
      </div>
    </div>
  );
}
