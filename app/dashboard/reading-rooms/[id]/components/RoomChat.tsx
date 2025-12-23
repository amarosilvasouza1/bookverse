'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, MessageSquare, Users } from 'lucide-react';
import { sendRoomMessage } from '@/app/actions/reading-room';
import { toast } from 'sonner';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface UserType {
    id: string;
    name: string | null;
    image: string | null;
    username?: string | null;
}

export interface Message {
    id: string;
    content: string;
    userId: string;
    createdAt: Date | string;
    user: UserType | null;
}

export interface Participant {
    userId: string;
    user: UserType | null;
    joinedAt?: string | Date; // Ensure type compatibility
}

interface RoomChatProps {
  roomId: string;
  initialMessages: Message[];
  currentUserId: string;
  participants: Participant[];
}

export default function RoomChat({ roomId, initialMessages, currentUserId, participants: initialParticipants }: RoomChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [participants, _setParticipants] = useState<Participant[]>(initialParticipants);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'users'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const handleSend = async () => {
      if (!input.trim() || isLoading) return;

      setIsLoading(true);
      try {
          const result = await sendRoomMessage(roomId, input);
          if (result.success && result.message) {
             setMessages(prev => [...prev, result.message as Message]);
             setInput('');
          } else {
             toast.error('Failed to send message');
          }
      } catch {
          toast.error('Failed to send message');
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-white">
       {/* Header Tabs */}
       <div className="flex items-center border-b border-white/10 p-2 gap-2">
            <button 
                onClick={() => setActiveTab('chat')}
                className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors",
                    activeTab === 'chat' ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                )}
            >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors",
                    activeTab === 'users' ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                )}
            >
                <Users className="w-3.5 h-3.5" />
                Waitlist ({participants.length})
            </button>
       </div>

       <div className="flex-1 relative overflow-hidden">
          {/* Chat Tab */}
          {activeTab === 'chat' && (
             <div className="absolute inset-0 flex flex-col">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2 opacity-50">
                            <MessageSquare className="w-8 h-8" />
                            <p className="text-xs">No messages yet</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.userId === currentUserId;
                            return (
                                <div key={msg.id} className={cn("flex gap-2 max-w-[85%]", isMe && "ml-auto flex-row-reverse")}>
                                     <div className="w-6 h-6 rounded-full bg-slate-800 shrink-0 overflow-hidden relative border border-white/10">
                                         {msg.user?.image ? (
                                             <Image src={msg.user.image} alt="" fill className="object-cover" />
                                         ) : (
                                             <span className="flex items-center justify-center h-full w-full text-[8px] font-bold text-zinc-400">?</span>
                                         )}
                                     </div>
                                     <div>
                                         <div className={cn("p-2 rounded-xl text-sm", isMe ? "bg-emerald-500/20 text-emerald-100 rounded-tr-none" : "bg-white/5 text-zinc-300 rounded-tl-none")}>
                                             <p className="leading-snug">{msg.content}</p>
                                         </div>
                                         <span className="text-[9px] text-zinc-600 px-1 mt-0.5 block">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                     </div>
                                </div>
                            );
                        })
                    )}
                </div>
                
                <div className="p-3 border-t border-white/5 bg-[#0A0A0A]">
                    <div className="flex gap-2">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="flex-1 bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 text-zinc-200 placeholder:text-zinc-600"
                        />
                         <button 
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white disabled:opacity-50 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
             </div>
          )}

          {/* Participants Tab */}
            {activeTab === 'users' && (
                <div className="absolute inset-0 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {participants.map((p) => (
                        <div key={p.userId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden relative border border-white/10">
                                {p.user?.image ? (
                                    <Image src={p.user.image} alt="" fill className="object-cover" />
                                ) : (
                                    <User className="w-4 h-4 m-auto text-zinc-500" />
                                )}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-zinc-200">{p.user?.name || 'User'}</h4>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">@{p.user?.username || 'user'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

       </div>
    </div>
  );
}
