'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Send, Plus, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getConversations, getMessages, sendMessage, getMutualFollowersForChat } from '@/app/actions/chat';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string | null;
  image: string | null;
  username: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date | string;
  sender?: { id: string; name?: string | null; image?: string | null };
}

interface Conversation {
  id: string;
  otherUser: User | undefined;
  lastMessage: Message | null;
}

export default function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [mutualFollowers, setMutualFollowers] = useState<User[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Poll for messages if active conversation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeConversation) {
      loadMessages(activeConversation);
      interval = setInterval(() => loadMessages(activeConversation), 3000);
    }
    return () => clearInterval(interval);
  }, [activeConversation]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations() {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(convId: string) {
    try {
      const data = await getMessages(convId);
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages", error);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const conversation = conversations.find(c => c.id === activeConversation);
    if (!conversation || !conversation.otherUser) return;

    // Optimistic Update
    const tempMsg: Message = {
      id: 'temp-' + Date.now(),
      content: newMessage,
      senderId: 'me', // handled by UI check
      createdAt: new Date(),
      sender: { id: 'me' } // Placeholder
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');

    const result = await sendMessage(conversation.otherUser.id, tempMsg.content);
    if (result.error) {
      toast.error(result.error);
      // Revert optimistic update? Or just reload
      loadMessages(activeConversation);
    } else {
      loadMessages(activeConversation);
      loadConversations(); // Update last message in list
    }
  }

  async function openNewChatModal() {
    const followers = await getMutualFollowersForChat();
    setMutualFollowers(followers);
    setShowNewChatModal(true);
  }

  async function startChat(userId: string) {
    // Check if conversation already exists
    const existing = conversations.find(c => c.otherUser?.id === userId);
    if (existing) {
      setActiveConversation(existing.id);
      setShowNewChatModal(false);
      return;
    }

    // Create a temporary conversation object in state to start chatting immediately
    const user = mutualFollowers.find(u => u.id === userId);
    if (!user) return;

    const tempConv: Conversation = {
      id: 'temp-' + userId,
      otherUser: user,
      lastMessage: null
    };
    
    setConversations(prev => [tempConv, ...prev]);
    setActiveConversation(tempConv.id);
    setShowNewChatModal(false);
  }

  const activeConvData = conversations.find(c => c.id === activeConversation);

  return (
    <div className="flex h-[600px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Sidebar */}
      <div className={cn("w-full md:w-80 border-r border-white/10 flex flex-col", activeConversation ? "hidden md:flex" : "flex")}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <div className="relative flex-1 mr-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button 
            onClick={openNewChatModal}
            className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {loading ? (
            <div className="text-center text-muted-foreground p-4">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">
              <p className="mb-2">No conversations yet.</p>
              <button onClick={openNewChatModal} className="text-primary text-sm hover:underline">Start a chat</button>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                  activeConversation === conv.id ? "bg-white/10 shadow-lg" : "hover:bg-white/5"
                )}
              >
                <div className="relative">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10">
                    {conv.otherUser?.image ? (
                      <Image src={conv.otherUser.image} alt={conv.otherUser.name || ''} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white font-bold">
                        {(conv.otherUser?.name || '?')[0]}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="font-bold text-white truncate">{conv.otherUser?.name}</span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage?.content || 'Start a conversation'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn("flex-1 flex flex-col bg-black/20", !activeConversation ? "hidden md:flex" : "flex")}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveConversation(null)} className="md:hidden text-white">
                  ←
                </button>
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                   {activeConvData?.otherUser?.image ? (
                      <Image src={activeConvData.otherUser.image} alt="" fill className="object-cover" />
                   ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white font-bold">
                        {(activeConvData?.otherUser?.name || '?')[0]}
                      </div>
                   )}
                </div>
                <div>
                  <h3 className="font-bold text-white">{activeConvData?.otherUser?.name}</h3>
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    Online
                  </span>
                </div>
              </div>
              {/* No Call Buttons - Just Options */}
              <button className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === 'me' || (msg.sender && msg.sender.id !== activeConvData?.otherUser?.id);
                return (
                  <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] p-3 rounded-2xl text-sm shadow-md",
                      isMe 
                        ? "bg-linear-to-br from-primary to-purple-600 text-white rounded-tr-none" 
                        : "bg-white/10 text-white border border-white/10 rounded-tl-none backdrop-blur-md"
                    )}>
                      <p>{msg.content}</p>
                      <span className={cn("text-[10px] block mt-1", isMe ? "text-white/70" : "text-gray-400")}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-full px-4 py-2 focus-within:border-primary/50 transition-colors">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <UserPlus className="w-10 h-10 opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Start a Conversation</h3>
            <p className="max-w-xs">Select a mutual follower to start chatting. You can only chat with people who follow you back.</p>
            <button 
              onClick={openNewChatModal}
              className="mt-6 px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors"
            >
              Find Friends
            </button>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-white">New Message</h3>
              <button onClick={() => setShowNewChatModal(false)} className="text-muted-foreground hover:text-white">✕</button>
            </div>
            <div className="p-2 max-h-[400px] overflow-y-auto">
              {mutualFollowers.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No mutual followers found.</p>
                  <p className="text-xs mt-2">Ask people to follow you back!</p>
                </div>
              ) : (
                mutualFollowers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => startChat(user.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-left"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                      {user.image ? (
                        <Image src={user.image} alt="" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white font-bold">
                          {user.name ? user.name[0] : '?'}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white">{user.name}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
