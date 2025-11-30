'use client';

import { useState, useEffect, useRef } from 'react';
import { executeAdminCommand } from '@/app/actions/admin';
import { Terminal, X, Loader2, ChevronRight } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

interface AdminCommandPaletteProps {
  username?: string;
  isOpen: boolean;
  onClose: () => void;
}

type UserData = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  bio: string | null;
  balance: number;
  items: {
    item: {
      rarity: string;
    };
  }[];
  _count: {
    followers: number;
    following: number;
    books: number;
  }
};

export default function AdminCommandPalette({ username, isOpen, onClose }: AdminCommandPaletteProps) {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<{ 
    type: 'success' | 'error' | 'info' | 'user_list', 
    message?: string,
    users?: UserData[]
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // If not authorized, don't render anything
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
        if (result.type === 'USER_LIST') {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             setOutput(prev => [...prev, { type: 'user_list', users: result.users as any }]);
        } else {
             setOutput(prev => [...prev, { type: 'success', message: result.message || 'Success' }]);
        }
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
      <div className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2 text-emerald-400">
            <Terminal className="w-5 h-5" />
            <span className="font-mono font-bold">Admin Console</span>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Output Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm min-h-[300px] bg-black/40">
          <div className="text-zinc-500 mb-4">
            Type a command. Examples:<br/>
            -user all (List all users)<br/>
            @username add money 100<br/>
            @username set name New Name<br/>
            @username follow me<br/>
            @username delete<br/>
            -award-frames-24h (Award frames to recent authors)<br/>
            -award-frames-all (Award frames to ALL authors)
          </div>
          
          {output.map((log, i) => (
            <div key={i} className={`
              ${log.type === 'info' ? 'text-zinc-300 font-bold opacity-70' : ''}
              ${log.type === 'success' ? 'text-green-400' : ''}
              ${log.type === 'error' ? 'text-red-400' : ''}
            `}>
              {log.message}
              
              {log.type === 'user_list' && log.users && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {log.users.map(user => (
                    <button 
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left group"
                    >
                      <UserAvatar 
                        src={user.image} 
                        alt={user.username} 
                        size={40} 
                        rarity={user.items?.[0]?.item.rarity}
                      />
                      <div className="min-w-0">
                        <div className="text-white font-bold truncate group-hover:text-emerald-400 transition-colors">
                          {user.name || user.username}
                        </div>
                        <div className="text-zinc-500 text-xs truncate">@{user.username}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
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

      {/* Mini Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-32 bg-linear-to-r from-emerald-900 to-black relative">
               {/* Banner placeholder or actual banner if we fetched it */}
            </div>

            <div className="px-6 pb-6 -mt-12 relative">
               <div className="flex justify-center mb-4">
                 <UserAvatar 
                    src={selectedUser.image} 
                    alt={selectedUser.username} 
                    size={96} 
                    rarity={selectedUser.items?.[0]?.item.rarity}
                    className="border-4 border-[#0a0a0a]"
                 />
               </div>

               <h2 className="text-2xl font-bold text-white mb-1 text-center">{selectedUser.name || selectedUser.username}</h2>
               <p className="text-emerald-400 mb-4 text-center">@{selectedUser.username}</p>

               <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-xl font-bold text-white">{selectedUser._count.books}</div>
                    <div className="text-xs text-zinc-500">Books</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-xl font-bold text-white">{selectedUser._count.followers}</div>
                    <div className="text-xs text-zinc-500">Followers</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-xl font-bold text-white">{selectedUser._count.following}</div>
                    <div className="text-xs text-zinc-500">Following</div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Balance</div>
                    <div className="text-2xl font-mono text-emerald-400">${selectedUser.balance.toFixed(2)}</div>
                  </div>

                  {selectedUser.bio && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Bio</div>
                      <p className="text-sm text-zinc-300 leading-relaxed">{selectedUser.bio}</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
