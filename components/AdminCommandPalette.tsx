'use client';

import { useState, useEffect, useRef } from 'react';
import { executeAdminCommand } from '@/app/actions/admin';
import { Terminal, X, Loader2, ChevronRight } from 'lucide-react';

export default function AdminCommandPalette({ username }: { username?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<{ type: 'success' | 'error' | 'info', message: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (username !== 'login') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with Ctrl+J or F2
      if ((e.ctrlKey && e.key === 'j') || e.key === 'F2') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [username]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // If not authorized, don't render anything (but hooks must run first)
  if (username !== 'login') return null;

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const cmd = command.trim();
    setCommand('');
    setLoading(true);
    
    // Add command to output
    setOutput(prev => [...prev, { type: 'info', message: `> ${cmd}` }]);

    try {
      const result = await executeAdminCommand(cmd);
      
      if (result.success) {
        setOutput(prev => [...prev, { type: 'success', message: result.message || 'Success' }]);
      } else {
        setOutput(prev => [...prev, { type: 'error', message: result.error || 'Failed' }]);
      }
    } catch (error) {
      console.error(error);
      setOutput(prev => [...prev, { type: 'error', message: 'System error' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[600px] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2 text-emerald-400">
            <Terminal className="w-5 h-5" />
            <span className="font-mono font-bold">Admin Console</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Output Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm min-h-[300px] bg-black/40">
          <div className="text-zinc-500 mb-4">
            Type a command. Examples:<br/>
            @username add money 100<br/>
            @username set name New Name<br/>
            @username follow me<br/>
            @username delete
          </div>
          
          {output.map((log, i) => (
            <div key={i} className={`
              ${log.type === 'info' ? 'text-zinc-300 font-bold opacity-70' : ''}
              ${log.type === 'success' ? 'text-green-400' : ''}
              ${log.type === 'error' ? 'text-red-400' : ''}
            `}>
              {log.message}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-zinc-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Executing...</span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleCommand} className="p-4 border-t border-white/10 bg-white/5 flex items-center gap-3">
          <ChevronRight className="w-5 h-5 text-zinc-500 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command..."
            className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-zinc-600"
            autoComplete="off"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}
