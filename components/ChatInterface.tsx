'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MoreVertical, Send, Plus, UserPlus, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getConversations, getMessages, sendMessage, getMutualFollowersForChat, getNonMutualFollowings, requestFollowBack, markMessagesAsRead } from '@/app/actions/chat';
import { toast } from 'sonner';
import MiniProfile from './MiniProfile';

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
  unreadCount: number;
}

export default function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [mutualFollowers, setMutualFollowers] = useState<User[]>([]);
  const [nonMutualFollowings, setNonMutualFollowings] = useState<User[]>([]);
  const [modalTab, setModalTab] = useState<'mutual' | 'request'>('mutual');
  const [miniProfileId, setMiniProfileId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Conversations
  useEffect(() => {
    loadConversations();
  }, []);

  const loadMessages = useCallback(async (convId: string) => {
    try {
      const data = await getMessages(convId);
      setMessages(data);
      
      // Mark as read if this is the active conversation
      if (activeConversation === convId) {
        const conv = conversations.find(c => c.id === convId);
        if (conv && conv.unreadCount > 0) {
          await markMessagesAsRead(convId);
          // Update local state to clear badge
          setConversations(prev => prev.map(c => 
            c.id === convId ? { ...c, unreadCount: 0 } : c
          ));
        }
      }
    } catch (error) {
      console.error("Failed to load messages", error);
    }
  }, [activeConversation, conversations]);

  // Poll for messages if active conversation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeConversation) {
      loadMessages(activeConversation);
      interval = setInterval(() => loadMessages(activeConversation), 3000);
    }
    return () => clearInterval(interval);
  }, [activeConversation, loadMessages]);

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

  async function handleConversationClick(convId: string) {
    setActiveConversation(convId);
    
    // Optimistically clear unread count
    setConversations(prev => prev.map(c => 
      c.id === convId ? { ...c, unreadCount: 0 } : c
    ));
    
    await markMessagesAsRead(convId);
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
    const mutuals = await getMutualFollowersForChat();
    const nonMutuals = await getNonMutualFollowings();
    setMutualFollowers(mutuals);
    setNonMutualFollowings(nonMutuals);
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
      lastMessage: null,
      unreadCount: 0
    };
    
    setConversations(prev => [tempConv, ...prev]);
    setActiveConversation(tempConv.id);
    setShowNewChatModal(false);
  }

  async function handleRequestFollowBack(userId: string) {
    const result = await requestFollowBack(userId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Request sent!");
      // Optionally remove from list or show sent state
    }
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
                onClick={() => handleConversationClick(conv.id)}
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
                  <div className="flex justify-between items-center">
                    <p className={cn("text-sm truncate max-w-[140px]", conv.unreadCount > 0 ? "text-white font-medium" : "text-muted-foreground")}>
                      {conv.lastMessage?.content || 'Start a conversation'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
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
                <button 
                  onClick={() => setMiniProfileId(activeConvData?.otherUser?.id || null)}
                  className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 hover:border-primary/50 transition-colors"
                >
                   {activeConvData?.otherUser?.image ? (
                      <Image src={activeConvData.otherUser.image} alt="" fill className="object-cover" />
                   ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white font-bold">
                        {(activeConvData?.otherUser?.name || '?')[0]}
                      </div>
                   )}
                </button>
                <button onClick={() => setMiniProfileId(activeConvData?.otherUser?.id || null)} className="text-left">
                  <h3 className="font-bold text-white hover:underline">{activeConvData?.otherUser?.name}</h3>
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    Online
                  </span>
                </button>
              </div>
              {/* No Call Buttons - Just Options */}
              <button className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map((msg) => {
                const isMe = msg.senderId === 'me' || (msg.sender && msg.sender.id !== activeConvData?.otherUser?.id);
                return (
                  <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] p-4 text-sm shadow-lg relative group transition-all duration-300 hover:scale-[1.01]",
                      isMe 
                        ? "bg-linear-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-tr-sm" 
                        : "bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-2xl rounded-tl-sm"
                    )}>
                      <p className="leading-relaxed">{msg.content}</p>
                      <span className={cn(
                        "text-[10px] absolute -bottom-5 min-w-[60px]",
                        isMe ? "right-0 text-right text-white/50" : "left-0 text-white/50"
                      )}>
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
              <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-full px-4 py-2 focus-within:border-primary/50 transition-colors shadow-inner">
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
                  className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
              <UserPlus className="w-12 h-12 opacity-50" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Start a Conversation</h3>
            <p className="max-w-xs text-lg">Connect with your mutual friends or request to chat with others.</p>
            <button 
              onClick={openNewChatModal}
              className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl"
            >
              Find Friends
            </button>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-white text-lg">New Message</h3>
              <button onClick={() => setShowNewChatModal(false)} className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-white transition-colors">✕</button>
            </div>
            
            {/* Modal Tabs */}
            <div className="flex p-2 gap-2 bg-black/20">
              <button 
                onClick={() => setModalTab('mutual')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                  modalTab === 'mutual' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"
                )}
              >
                Mutual Friends
              </button>
              <button 
                onClick={() => setModalTab('request')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                  modalTab === 'request' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"
                )}
              >
                Request Chat
              </button>
            </div>

            <div className="p-2 overflow-y-auto flex-1">
              {modalTab === 'mutual' ? (
                mutualFollowers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>No mutual followers found.</p>
                    <p className="text-xs mt-2">You need to follow each other to chat!</p>
                  </div>
                ) : (
                  mutualFollowers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => startChat(user.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-colors text-left group"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10">
                        {user.image ? (
                          <Image src={user.image} alt="" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white font-bold">
                            {user.name ? user.name[0] : '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white group-hover:text-primary transition-colors">{user.name}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                    </button>
                  ))
                )
              ) : (
                nonMutualFollowings.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>No one to request.</p>
                    <p className="text-xs mt-2">Follow more people to see them here!</p>
                  </div>
                ) : (
                  nonMutualFollowings.map(user => (
                    <div
                      key={user.id}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-colors text-left group"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10">
                        {user.image ? (
                          <Image src={user.image} alt="" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white font-bold">
                            {user.name ? user.name[0] : '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                      <button 
                        onClick={() => handleRequestFollowBack(user.id)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Request
                      </button>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mini Profile Modal */}
      <MiniProfile 
        userId={miniProfileId} 
        isOpen={!!miniProfileId} 
        onClose={() => setMiniProfileId(null)} 
      />
    </div>
  );
}
