'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MoreVertical, Send, Plus, UserPlus, ArrowRight, Image as ImageIcon, X } from 'lucide-react';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import { getConversations, getMessages, sendMessage, getMutualFollowersForChat, getNonMutualFollowings, requestFollowBack, markMessagesAsRead, setTyping } from '@/app/actions/chat';
import { toast } from 'sonner';
import MiniProfile from './MiniProfile';
import UserAvatar from '@/components/UserAvatar';
import { compressImage } from '@/lib/compression';
import { updateLastSeen } from '@/app/actions/chat';

interface User {
  id: string;
  name: string | null;
  image: string | null;
  username: string;
  lastSeen?: Date | string | null;
  items?: { item: { rarity: string } }[];
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date | string;
  sender?: { id: string; name?: string | null; image?: string | null };
  mediaUrl?: string | null;
  mediaType?: 'IMAGE' | 'VIDEO' | string | null;
}

interface Conversation {
  id: string;
  otherUser: User | undefined;
  lastMessage: Message | null;
  unreadCount: number;
  isTyping?: boolean;
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

  const [media, setMedia] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lightbox state for viewing images
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Pagination State
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Online Status Polling
  useEffect(() => {
    // Initial update
    updateLastSeen();
    const interval = setInterval(() => updateLastSeen(), 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Check online status check (Active if seen in last 5 mins)
  const isOnline = (lastSeenString?: string | Date | null) => {
      if (!lastSeenString) return false;
      const lastSeen = new Date(lastSeenString);
      const diff = new Date().getTime() - lastSeen.getTime();
      return diff < 5 * 60 * 1000;
  };

  // Load Conversations
  useEffect(() => {
    loadConversations();
  }, []);

  const loadMessages = useCallback(async (convId: string, isInitial = false) => {
    try {
      if (!isInitial && !nextCursor) return; // Nothing more to load

      // If initial, reset everything first (but keep displaying old temporarily to avoid flash)
      // Actually we handle reset locally in useEffect when conversation changes

      const cursorToSend = isInitial ? undefined : (nextCursor || undefined);
      const data = await getMessages(convId, cursorToSend);
      
      if (isInitial) {
        setMessages(data.messages);
        setMessages(data.messages);
        // Scroll to bottom on initial load
        // Scroll to bottom on initial load
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
      } else {
        // Prepend messages
        setMessages(prev => [...data.messages, ...prev]);
      }

      setNextCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);

      // Mark as read if this is the active conversation (only on initial load or live updates)
      if (isInitial && activeConversation === convId) {
        const conv = conversations.find(c => c.id === convId);
        if (conv && conv.unreadCount > 0) {
          await markMessagesAsRead(convId);
          setConversations(prev => prev.map(c => 
            c.id === convId ? { ...c, unreadCount: 0 } : c
          ));
        }
      }
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
        setIsFetchingMore(false);
    }
  }, [activeConversation, conversations, nextCursor]);

  // Handle active conversation change
  useEffect(() => {
    if (activeConversation) {
        setMessages([]); // Clear messages immediately
        setNextCursor(null);
        setHasMore(false);
        loadMessages(activeConversation, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation]); // Intentionally omitting loadMessages to avoid infinite loop

  // Poll for NEW messages (Optimized to not refetch all)
  // For now, we'll keep it simple: just fetch latest if at bottom, or maybe disable full polling 
  // and rely on a lightweight "check for new" in future.
  // Current implementation of 'loadMessages' with pagination breaks simple polling.
  // We will rely on "Typing" events and potential websockets or lightweight polling later for real-time.
  // For this step, we'll disable the heavy polling to fix the "loading everything" issue.
  
  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight } = e.currentTarget;
    if (scrollTop === 0 && hasMore && !isFetchingMore) {
        setIsFetchingMore(true);
        const oldScrollHeight = scrollHeight;
        
        await loadMessages(activeConversation!, false);

        // Restore scroll position
        requestAnimationFrame(() => {
            if (e.currentTarget) {
                const newScrollHeight = e.currentTarget.scrollHeight;
                e.currentTarget.scrollTop = newScrollHeight - oldScrollHeight;
            }
        });
    }
  };





  const activeConvData = conversations.find(c => c.id === activeConversation);

  // Track previous message count to detect new messages
  const prevMessageCountRef = useRef(0);

  // Scroll to bottom ONLY when user sends a new message
  useEffect(() => {
    // Only scroll if a new message was added (not when loading older messages)
    const newMessageAdded = messages.length > prevMessageCountRef.current && prevMessageCountRef.current !== 0;
    
    if (newMessageAdded && messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        const isMe = lastMsg.senderId === 'me' || (lastMsg.sender && lastMsg.sender.id !== activeConvData?.otherUser?.id);
        
        // Only auto-scroll if it's my message
        if (isMe) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    prevMessageCountRef.current = messages.length;
  }, [messages, activeConvData]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large (max 5MB)');
        return;
      }
      setMedia(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const removeMedia = () => {
    setMedia(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if ((!newMessage.trim() && !media) || !activeConversation) return;

    // Clear typing status
    setTyping(activeConversation, false);

    const conversation = conversations.find(c => c.id === activeConversation);
    if (!conversation || !conversation.otherUser) return;

    let mediaUrl: string | undefined;
    let mediaType: 'IMAGE' | 'VIDEO' | undefined;

    if (media) {
         try {
             let fileToProcess = media;
             if (media.type.startsWith('image/')) {
                try {
                   fileToProcess = await compressImage(media);
                } catch (e) {
                   console.error('Chat compression failed', e);
                }
             }

             // Convert File/Blob to Base64 using FileReader (Client-side safe)
             const base64String = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                   const result = reader.result as string;
                   // Result is already a data URL: "data:image/webp;base64,..."
                   resolve(result);
                };
                reader.onerror = reject;
                reader.readAsDataURL(fileToProcess);
             });
             
             mediaUrl = base64String;
             mediaType = fileToProcess.type.startsWith('image/') ? 'IMAGE' : 'VIDEO';
         } catch (err) {
             console.error("Failed to process media", err);
             toast.error("Failed to process media");
             return;
         }
    }

    // Optimistic Update
    const tempMsg: Message = {
      id: 'temp-' + Date.now(),
      content: newMessage,
      senderId: 'me', // handled by UI check
      createdAt: new Date(),
      sender: { id: 'me' }, // Placeholder
      mediaUrl,
      mediaType
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');
    removeMedia();

    const result = await sendMessage(conversation.otherUser.id, tempMsg.content, mediaUrl, mediaType);
    if (result.error) {
       toast.error(result.error);
       // Remove optimistic message on failure
       setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } else {
       loadMessages(activeConversation);
       loadConversations(); // Update last message in list
    }
  }

  // Debounced typing indicator
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  function handleTyping() {
    if (!activeConversation) return;
    
    // Send typing event
    setTyping(activeConversation, true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to clear typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (activeConversation) {
        setTyping(activeConversation, false);
      }
    }, 3000);
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



  return (
    <div className="flex h-[calc(100vh-180px)] md:h-[600px] bg-white/5 backdrop-blur-xl border-0 md:border border-white/10 rounded-none md:rounded-2xl overflow-hidden shadow-2xl">
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
                  <div className="relative w-12 h-12 rounded-full overflow-visible border border-white/10">
                    <UserAvatar 
                      src={conv.otherUser?.image || null} 
                      alt={conv.otherUser?.name || '?'} 
                      rarity={conv.otherUser?.items?.[0]?.item.rarity}
                      className="w-full h-full"
                    />
                  </div>
                  {/* Online/Offline indicator */}
                  <div className={cn(
                    "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900",
                    (conv.isTyping || isOnline(conv.otherUser?.lastSeen)) 
                      ? "bg-green-500" 
                      : "bg-gray-500"
                  )}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="font-bold text-white truncate">{conv.otherUser?.name}</span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </span>
                  </div>
                    <div className="flex justify-between items-center">
                    <p className={cn("text-base md:text-sm truncate max-w-[140px]", conv.unreadCount > 0 ? "text-white font-medium" : "text-muted-foreground")}>
                      {conv.lastMessage 
                        ? (conv.lastMessage.content 
                            ? conv.lastMessage.content 
                            : (conv.lastMessage.mediaType === 'VIDEO' ? '🎥 Vídeo' : '📷 Foto')) 
                        : 'Start a conversation'}
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
                  className="relative w-10 h-10 rounded-full overflow-visible border border-white/10 hover:border-primary/50 transition-colors"
                >
                   <UserAvatar 
                      src={activeConvData?.otherUser?.image || null} 
                      alt={activeConvData?.otherUser?.name || '?'} 
                      rarity={activeConvData?.otherUser?.items?.[0]?.item.rarity}
                      className="w-full h-full"
                    />
                </button>
                <button onClick={() => setMiniProfileId(activeConvData?.otherUser?.id || null)} className="text-left">
                  <h3 className="font-bold text-white hover:underline">{activeConvData?.otherUser?.name}</h3>
                  {activeConvData?.isTyping ? (
                    <span className="text-xs text-blue-400 flex items-center gap-1 animate-pulse">
                      <span className="flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{animationDelay: '0ms'}}></span>
                        <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{animationDelay: '150ms'}}></span>
                        <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{animationDelay: '300ms'}}></span>
                      </span>
                      Digitando...
                    </span>
                  ) : isOnline(activeConvData?.otherUser?.lastSeen) && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                      Online
                    </span>
                  )}
                </button>
              </div>
              {/* No Call Buttons - Just Options */}
              <button className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-6"
              onScroll={handleScroll}
            >
              {isFetchingMore && (
                  <div className="flex justify-center p-2">
                       <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.senderId === 'me' || (msg.sender && msg.sender.id !== activeConvData?.otherUser?.id);
                return (
                  <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] p-4 text-base md:text-sm shadow-lg relative group transition-all duration-300 hover:scale-[1.01]",
                      isMe 
                        ? "bg-linear-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-tr-sm" 
                        : "bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-2xl rounded-tl-sm"
                    )}>
                      {msg.mediaUrl && (
                        <div className="mb-2 rounded-lg overflow-hidden bg-black/20">
                            {msg.mediaType === 'VIDEO' ? (
                                <video src={msg.mediaUrl} controls className="w-full max-h-[150px] md:max-h-[220px] object-contain" />
                            ) : (
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setLightboxImage(msg.mediaUrl || null);
                                  }}
                                  className="cursor-zoom-in hover:opacity-90 transition-opacity"
                                >
                                  <NextImage 
                                    src={msg.mediaUrl} 
                                    alt="Attachment" 
                                    width={250} 
                                    height={180} 
                                    className="w-full max-h-[150px] md:max-h-[200px] object-contain rounded-lg" 
                                    unoptimized 
                                  />
                                </button>
                            )}
                        </div>
                      )}
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
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
              {preview && (
                  <div className="mb-2 relative inline-block">
                    <div className="relative rounded-lg overflow-hidden bg-black/40 max-h-[100px] border border-white/10">
                         {media?.type.startsWith('video/') ? (
                             <video src={preview} className="h-[100px] w-auto" />
                         ) : (
                             <NextImage src={preview} alt="Preview" width={200} height={100} className="h-[100px] w-auto object-contain" unoptimized />
                         )}
                         <button type="button" onClick={removeMedia} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 hover:bg-black/80 text-white"><X className="w-3 h-3"/></button>
                    </div>
                  </div>
              )}
              <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-full px-4 py-2 focus-within:border-primary/50 transition-colors shadow-inner">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,video/*"
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-muted-foreground hover:text-white transition-colors"
                    title="Attach Media"
                >
                    <ImageIcon className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Digite uma mensagem..." 
                  className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-base md:text-sm"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim() && !media}
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

            <div className="p-2 overflow-y-auto flex-1 max-h-[60vh] custom-scrollbar">
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
                      <div className="relative w-12 h-12 rounded-full overflow-visible border border-white/10">
                        <UserAvatar 
                          src={user.image} 
                          alt={user.name || '?'} 
                          rarity={user.items?.[0]?.item.rarity}
                          className="w-full h-full"
                        />
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
                      <div className="relative w-12 h-12 rounded-full overflow-visible border border-white/10">
                        <UserAvatar 
                          src={user.image} 
                          alt={user.name || '?'} 
                          rarity={user.items?.[0]?.item.rarity}
                          className="w-full h-full"
                        />
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

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <NextImage 
              src={lightboxImage} 
              alt="Fullscreen image" 
              fill
              className="object-contain"
              unoptimized
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            Toque para fechar
          </p>
        </div>
      )}
    </div>
  );
}
