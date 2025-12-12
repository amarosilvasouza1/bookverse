'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MoreVertical, Send, Plus, UserPlus, ArrowRight, ArrowLeft, Image as ImageIcon, X, Gift } from 'lucide-react';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import { getConversations, getMessages, sendMessage, getMutualFollowersForChat, getNonMutualFollowings, requestFollowBack, markMessagesAsRead, setTyping, toggleMessageReaction } from '@/app/actions/chat';
import { sendGift, getUserInventory } from '@/app/actions/gift';
import GiftCard from './GiftCard';
import { toast } from 'sonner';
import MiniProfile from './MiniProfile';
import UserAvatar from '@/components/UserAvatar';
import { compressImage } from '@/lib/compression';
import { updateLastSeen } from '@/app/actions/chat';

import ChatBubble from './ChatBubble';
import ContextMenu from './ContextMenu';
import ReplyPreview from './ReplyPreview';
import { editMessage } from '@/app/actions/chat';

interface ItemData {
  cssClass?: string;
  [key: string]: unknown;
}

interface GiftData {
  amount?: number;
  itemId?: string;
  name?: string;
  rarity?: string;
  [key: string]: unknown;
}

interface User {
  id: string;
  name: string | null;
  image: string | null;
  username: string;
  lastSeen?: Date | string | null;
  items?: { item: { type: string; rarity: string | null; data?: ItemData | null } }[];
}

interface InventoryItem {
  id: string; // UserItem ID needed for keys
  equipped: boolean;
  item: {
    id: string;
    name: string;
    type: string;
    rarity: string;
    data?: ItemData | null;
  };
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date | string;
  editedAt?: Date | string | null;
  sender?: { 
    id: string; 
    name?: string | null; 
    image?: string | null; 
    username?: string;
    items?: { item: { type: string; rarity: string | null; data?: ItemData | null } }[] 
  };
  mediaUrl?: string | null;
  mediaType?: 'IMAGE' | 'VIDEO' | string | null;
  gift?: {
    id: string;
    type: string;
    data: GiftData;
    status: string;
    expiresAt: Date | string;
  }; 
  replyTo?: {
    id: string;
    content: string;
    sender?: { username?: string; name?: string | null };
  };
  reactions?: { user: { id: string; username: string; name?: string | null } }[];
}

interface Conversation {
  id: string;
  otherUser: User | undefined;
  lastMessage: Message | null;
  unreadCount: number;
  isTyping?: boolean;
}

export default function ChatInterface({ onBack }: { onBack?: () => void }) {
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

  // Gift State
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftAmount, setGiftAmount] = useState('');
  const [sendingGift, setSendingGift] = useState(false);
  const [giftTab, setGiftTab] = useState<'MONEY' | 'ITEMS'>('MONEY');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Edit & Reply State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; content: string; username: string } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null);
  
  // Long Press Logic
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });

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

  // Load user inventory on mount (for bubble styling)
  useEffect(() => {
    getUserInventory().then(items => {
      setInventory(items);
    });
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
        setMessages(data.messages as unknown as Message[]);
        // Scroll to bottom on initial load
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
      } else {
        // Prepend messages
        setMessages(prev => [...(data.messages as unknown as Message[]), ...prev]);
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
        toast.error('Arquivo muito grande (máx 5MB)');
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

    // Handle Edit
    if (editingMessage) {
        const result = await editMessage(editingMessage.id, newMessage);
        if (result.success) {
            // Optimistic update
            setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, content: newMessage, editedAt: new Date() } : m));
            setEditingMessage(null);
            setNewMessage('');
            toast.success('Mensagem editada');
        } else {
            toast.error(result.error || 'Falha ao editar');
        }
        return;
    }

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
             toast.error("Falha ao processar mídia");
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
      mediaType,
      // Include reply info for optimistic display
      replyTo: replyingTo ? { id: replyingTo.id, content: replyingTo.content, sender: { username: replyingTo.username } } : undefined
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');
    removeMedia();
    
    // Store replyToId and clear state BEFORE await
    const replyToId = replyingTo?.id;
    setReplyingTo(null); // Clear reply preview immediately

    const result = await sendMessage(conversation.otherUser.id, tempMsg.content, mediaUrl, mediaType, replyToId);
    if (result.error) {
       toast.error(result.error);
       // Remove optimistic message on failure
       setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } else {
       loadMessages(activeConversation);
       loadConversations(); // Update last message in list
    }
  }

  async function handleSendGift(e: React.FormEvent) {
    e.preventDefault();
    if (!giftAmount || isNaN(Number(giftAmount)) || Number(giftAmount) <= 0 || !activeConversation) return;

    setSendingGift(true);
    if (!activeConvData?.otherUser?.id) return;
    const result = await sendGift(activeConvData.otherUser.id, 'MONEY', { amount: Number(giftAmount) });
    
    if (result.success) {
      toast.success('Presente enviado!');
      setShowGiftModal(false);
      setGiftAmount('');
      loadMessages(activeConversation);
    } else {
      toast.error(result.error);
    }
    setSendingGift(false);
  }

  async function handleSendItemGift() {
     if (!selectedItem || !activeConversation) return;
     
     setSendingGift(true);
     if (!activeConvData?.otherUser?.id) return;
     // Send item gift
     const result = await sendGift(activeConvData.otherUser.id, selectedItem.item.type as 'FRAME' | 'BUBBLE' | 'BACKGROUND', { 
         itemId: selectedItem.item.id,
         name: selectedItem.item.name,
         rarity: selectedItem.item.rarity
     });

     if (result.success) {
      toast.success('Presente enviado!');
      setShowGiftModal(false);
      setSelectedItem(null);
      loadMessages(activeConversation);
    } else {
      toast.error(result.error);
    }
    setSendingGift(false);
  }

  async function openGiftModal() {
      setShowGiftModal(true);
      setGiftTab('MONEY');
      // Prefetch inventory? Or lazy load
  }

  useEffect(() => {
      if (showGiftModal && giftTab === 'ITEMS' && inventory.length === 0) {
          setLoadingInventory(true);
          getUserInventory().then(items => {
              setInventory(items);
              setLoadingInventory(false);
          });
      }
  }, [showGiftModal, giftTab, inventory.length]);

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
    setMutualFollowers(mutuals as unknown as User[]);
    setNonMutualFollowings(nonMutuals as unknown as User[]);
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
      toast.success("Solicitação enviada!");
      // Optionally remove from list or show sent state
    }
  }

  // --- Video Embed Helper ---
  const renderMessageContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
         const isYoutube = part.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
         const isVimeo = part.match(/vimeo\.com\/(\d+)/);
         const isDirectVideo = part.match(/\.(mp4|webm|ogg)$/i);

         if (isYoutube) {
             return (
                 <div key={index} className="flex flex-col">
                     <div className="w-full max-w-[300px] mt-2 mb-2 rounded-xl overflow-hidden shadow-lg border border-white/10">
                         <iframe width="100%" height="200" src={`https://www.youtube.com/embed/${isYoutube[1]}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="aspect-video" />
                     </div>
                     <a href={part} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline break-all mb-2 opacity-80 pl-1 block">
                         {part}
                     </a>
                 </div>
             );
         } else if (isVimeo) {
             return (
                 <div key={index} className="flex flex-col">
                     <div className="w-full max-w-[300px] mt-2 mb-2 rounded-xl overflow-hidden shadow-lg border border-white/10">
                         <iframe src={`https://player.vimeo.com/video/${isVimeo[1]}`} width="100%" height="200" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="aspect-video" />
                     </div>
                     <a href={part} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline break-all mb-2 opacity-80 pl-1 block">
                         {part}
                     </a>
                 </div>
             );
         } else if (isDirectVideo) {
             return (
                 <div key={index} className="flex flex-col">
                     <div className="w-full max-w-[300px] mt-2 mb-2 rounded-xl overflow-hidden shadow-lg border border-white/10">
                         <video src={part} controls className="w-full aspect-video bg-black" />
                     </div>
                     <a href={part} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline break-all mb-2 opacity-80 pl-1 block">
                         {part}
                     </a>
                 </div>
             );
         }
         return (
           <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
             {part}
           </a>
         );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex h-[85vh] md:h-[600px] bg-linear-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 md:backdrop-blur-xl border-0 md:border border-white/10 rounded-none md:rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
      {/* Sidebar */}
      <div className={cn("w-full md:w-80 border-r border-white/10 flex flex-col bg-linear-to-b from-white/5 to-transparent", activeConversation ? "hidden md:flex" : "flex")}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 gap-2">
            {/* Mobile Back to Feed Button */}
            <button 
                onClick={onBack}
                className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-white transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
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
                    "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 shadow-md",
                    (conv.isTyping || isOnline(conv.otherUser?.lastSeen)) 
                      ? "bg-green-500 animate-pulse shadow-green-500/50" 
                      : "bg-zinc-500"
                  )} />
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
      <div className={cn("flex-1 flex flex-col bg-linear-to-br from-zinc-900/50 to-black/30", 
        !activeConversation ? "hidden md:flex" : "fixed inset-0 z-100 md:static md:flex w-full h-dvh md:h-auto bg-zinc-950 md:bg-transparent")}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-linear-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-lg shadow-lg">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveConversation(null)} className="md:hidden text-white p-2 hover:bg-white/10 rounded-full transition-all hover:scale-105 -ml-2">
                  <ArrowLeft className="w-5 h-5" />
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
                  const isMe = msg.senderId === 'me' || !!(msg.sender && msg.sender.id !== activeConvData?.otherUser?.id);
                
                // Determine Bubble Style
                let variant: 'snow' | 'halloween' | 'starry' | 'sky' | 'sakura' | 'spring' | 'default' = 'default';
                
                // For MY messages, check local inventory first (works for optimistic updates)
                if (isMe) {
                    // InventoryItem has structure: { id, equipped, item: { type, data, ... } }
                    const myEquippedBubble = inventory.find(i => i.item.type === 'BUBBLE' && i.equipped);
                    if (myEquippedBubble?.item.data?.cssClass) {
                        const cssClass = myEquippedBubble.item.data.cssClass as string;
                        if (cssClass.includes('snow')) variant = 'snow';
                        else if (cssClass.includes('halloween')) variant = 'halloween';
                        else if (cssClass.includes('starry')) variant = 'starry';
                        else if (cssClass.includes('sky')) variant = 'sky';
                        else if (cssClass.includes('sakura')) variant = 'sakura';
                        else if (cssClass.includes('spring')) variant = 'spring';
                    }
                } else {
                    // For other user's messages, check sender info
                    const senderBubble = msg.sender?.items?.find(i => i.item.type === 'BUBBLE');
                    if (senderBubble && senderBubble.item.data?.cssClass) {
                       const cssClass = senderBubble.item.data.cssClass as string;
                       if (cssClass.includes('snow')) variant = 'snow';
                       else if (cssClass.includes('halloween')) variant = 'halloween';
                       else if (cssClass.includes('starry')) variant = 'starry';
                       else if (cssClass.includes('sky')) variant = 'sky';
                       else if (cssClass.includes('sakura')) variant = 'sakura';
                       else if (cssClass.includes('spring')) variant = 'spring';
                    }
                }

                // Interaction Handlers
                const openMenu = (x: number, y: number) => {
                    setContextMenu({ x, y, messageId: msg.id });
                };

                // Detect if touch device
                const isTouchDevice = () => 'ontouchstart' in window;

                // Single click opens menu on desktop
                const handleClick = (e: React.MouseEvent) => {
                    if (!isTouchDevice()) {
                        e.preventDefault();
                        e.stopPropagation();
                        openMenu(e.clientX, e.clientY);
                    }
                };

                // Right-click also opens menu (desktop)
                const handleContextMenu = (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openMenu(e.clientX, e.clientY);
                };

                // === TOUCH EVENTS (Mobile) - Long press only ===
                const handleTouchStart = (e: React.TouchEvent) => {
                    const touch = e.touches[0];
                    mousePositionRef.current = { x: touch.clientX, y: touch.clientY };
                    longPressTimerRef.current = setTimeout(() => {
                        openMenu(mousePositionRef.current.x, mousePositionRef.current.y);
                    }, 600);
                };

                const handleTouchEnd = () => {
                    if (longPressTimerRef.current) {
                        clearTimeout(longPressTimerRef.current);
                        longPressTimerRef.current = null;
                    }
                };

                 // Check if message is a reply
                const replyContext = msg.replyTo;

                return (
                  <div 
                    key={msg.id} 
                    className={cn("flex w-full flex-col mb-4 cursor-pointer", isMe ? "items-end" : "items-start")}
                    onClick={handleClick}
                    onContextMenu={handleContextMenu}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                  >
                     {/* Reply Indicator */}
                     {replyContext && (
                         <div className={cn(
                             "text-xs mb-1 opacity-70 flex items-center gap-1",
                             isMe ? "bg-white/5 rounded-lg px-2 py-1 mr-1" : "bg-white/5 rounded-lg px-2 py-1 ml-1"
                         )}>
                             <div className="w-0.5 h-3 bg-indigo-500 rounded-full" />
                             <span className="font-semibold">{replyContext.sender?.username || 'User'}:</span>
                             <span className="truncate max-w-[150px]">{replyContext.content}</span>
                         </div>
                     )}

                    <ChatBubble 
                      variant={variant}
                      isMe={isMe}
                      className="relative group hover:scale-[1.01]"
                      onClick={handleClick}
                      onContextMenu={handleContextMenu}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                    >
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
                      
                      {/* Render Gift Card */}
                      {msg.gift && (
                        <div className="mb-2">
                            <GiftCard 
                                giftId={msg.gift.id}
                                type={msg.gift.type}
                                data={msg.gift.data}
                                status={msg.gift.status}
                                expiresAt={typeof msg.gift.expiresAt === 'string' ? msg.gift.expiresAt : msg.gift.expiresAt.toISOString()}
                                isMe={isMe}
                            />
                        </div>
                      )}

                      <div className="leading-relaxed whitespace-pre-wrap">{renderMessageContent(msg.content)}</div>
                      <div className="flex flex-col gap-1 items-end">
                          <span className={cn("text-[10px] opacity-70 px-1", isMe ? "text-right" : "text-left")}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {msg.editedAt && <span className="ml-1 italic">(editado)</span>}
                          </span>
                      </div>
                      
                      {/* Reactions Display */}
                      {msg.reactions && msg.reactions.length > 0 && (
                          <div className={cn("flex flex-wrap gap-1 mt-1 max-w-[200px]", isMe ? "justify-end" : "justify-start")}>
                              {/* Group reactions by type could be complex since we don't have type in the include... wait, 
                                  Check Chat Action getMessages: I included `reactions: { include: { user: ... } }`.
                                  Prisma `reactions` is `MessageReaction[]`. `MessageReaction` HAS `type`.
                                  I need to make sure my Message interface reflects that.
                                  Wait, the `reactions` relation in getMessages does not explicitly select `type`.
                                  Default include includes scalars? Yes. So `type` should be there.
                              */}
                               {(() => {
                                  // Group by type
                                  const groups: Record<string, number> = {};
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  msg.reactions?.forEach((r: any) => {
                                      groups[r.type] = (groups[r.type] || 0) + 1;
                                  });
                                  
                                  const reactionEmojis: Record<string, string> = {
                                    HEART: '❤️',
                                    LAUGH: '😂',
                                    CRY: '😢',
                                    FIRE: '🔥',
                                    LIT: '💯'
                                  };

                                  return Object.entries(groups).map(([type, count]) => (
                                      <div key={type} className="bg-black/30 rounded-full px-1.5 py-0.5 text-[10px] text-white flex items-center gap-1 border border-white/5 shadow-xs">
                                          <span>{reactionEmojis[type] || '❤️'}</span>
                                          {count > 1 && <span>{count}</span>}
                                      </div>
                                  ));
                               })()}
                          </div>
                      )}

                    </ChatBubble>
                  </div>
                );
              })}
            <div ref={messagesEndRef} />
            </div>

             {/* Reply Preview */}
             <ReplyPreview 
               replyingTo={replyingTo} 
               onCancel={() => setReplyingTo(null)} 
             />

             {/* Edit Mode Indicator */}
             {editingMessage && (
               <div className="flex items-center justify-between px-4 py-2 bg-green-900/30 border-t border-green-500/30 backdrop-blur-md">
                 <div className="flex items-center gap-3 overflow-hidden">
                   <div className="w-4 h-4 shrink-0">✏️</div>
                   <div className="flex flex-col text-sm truncate">
                     <span className="text-green-400 font-medium text-xs">Editando mensagem</span>
                     <span className="text-zinc-400 truncate max-w-[200px] md:max-w-md">
                       {editingMessage.content}
                     </span>
                   </div>
                 </div>
                 <button 
                   onClick={() => { setEditingMessage(null); setNewMessage(''); }}
                   className="p-1 hover:bg-white/10 rounded-full transition-colors"
                 >
                   <X className="w-4 h-4 text-zinc-400" />
                 </button>
               </div>
             )}

            {/* Input Area */}
            <form 
              onSubmit={handleSendMessage}
              className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md"
            >
              {preview && (
                  <div className="mb-3 relative inline-block">
                    <div className="relative rounded-xl overflow-hidden bg-black/60 max-h-[100px] border border-white/20 shadow-lg">
                         {media?.type.startsWith('video/') ? (
                             <video src={preview} className="h-[100px] w-auto" />
                         ) : (
                             <NextImage src={preview} alt="Preview" width={200} height={100} className="h-[100px] w-auto object-contain" unoptimized />
                         )}
                         <button type="button" onClick={removeMedia} className="absolute top-2 right-2 bg-red-500/80 rounded-full p-1 hover:bg-red-500 text-white transition-all hover:scale-110"><X className="w-3 h-3"/></button>
                    </div>
                  </div>
              )}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-primary/50 focus-within:shadow-lg focus-within:shadow-primary/10 transition-all duration-300">
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
                    className="p-2 text-zinc-400 hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-200"
                    title="Attach Media"
                >
                    <ImageIcon className="w-5 h-5" />
                </button>

                <button
                    type="button"
                    onClick={openGiftModal}
                    className="p-2 text-zinc-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-full transition-all duration-200"
                    title="Send Gift"
                >
                    <Gift className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Digite uma mensagem..." 
                  className="flex-1 bg-transparent text-white placeholder-zinc-500 focus:outline-none text-base"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim() && !media}
                  className="p-3 bg-linear-to-r from-primary to-purple-600 text-white rounded-xl hover:from-primary/90 hover:to-purple-500 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 disabled:shadow-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <div className="w-28 h-28 rounded-full bg-linear-to-br from-primary/20 to-purple-600/20 flex items-center justify-center mb-6 border border-primary/20 shadow-lg shadow-primary/10">
              <UserPlus className="w-14 h-14 text-primary/70" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Iniciar Conversa</h3>
            <p className="max-w-xs text-zinc-400">Conecte-se com seus amigos mútuos ou solicite chat com outros.</p>
            <button 
              onClick={openNewChatModal}
              className="mt-8 px-8 py-3 bg-linear-to-r from-primary to-purple-600 text-white rounded-full font-bold hover:from-primary/90 hover:to-purple-500 transition-all transform hover:scale-105 shadow-xl shadow-primary/25"
            >
              Encontrar Amigos
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
      {/* Gift Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-lg">Send a Gift</h3>
                <button onClick={() => setShowGiftModal(false)} className="text-muted-foreground hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            

            
            <div className="flex p-1 bg-black/40 rounded-xl mb-4">
                <button 
                    onClick={() => setGiftTab('MONEY')}
                    className={cn(
                        "flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors",
                        giftTab === 'MONEY' ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                    )}
                >
                    Money
                </button>
                <button 
                    onClick={() => setGiftTab('ITEMS')}
                    className={cn(
                        "flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors",
                        giftTab === 'ITEMS' ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                    )}
                >
                    Items
                </button>
            </div>

            {giftTab === 'MONEY' ? (
                <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <label className="text-xs text-muted-foreground uppercase font-bold mb-2 block">Amount ($)</label>
                        <input 
                            type="number" 
                            value={giftAmount}
                            onChange={(e) => setGiftAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none"
                        />
                    </div>
                    
                    <button 
                        onClick={handleSendGift}
                        disabled={sendingGift || !giftAmount}
                        className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {sendingGift ? 'Sending...' : 'Send Cash'}
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-h-[300px]">
                     {loadingInventory ? (
                         <div className="flex-1 flex items-center justify-center">
                             <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                         </div>
                     ) : inventory.length === 0 ? (
                         <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                             <p>No giftable items found.</p>
                             <p className="text-xs">Buy items from the store first!</p>
                         </div>
                     ) : (
                         <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[300px] pr-1">
                             {inventory.map((ui) => (
                                 <button
                                     key={ui.id}
                                     onClick={() => setSelectedItem(ui)}
                                     className={cn(
                                         "p-2 rounded-xl border flex flex-col items-center gap-2 transition-all",
                                         selectedItem?.id === ui.id 
                                            ? "bg-primary/20 border-primary" 
                                            : "bg-white/5 border-white/10 hover:bg-white/10"
                                     )}
                                 >
                                     <div className={cn(
                                         "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg",
                                         ui.item.rarity === 'LEGENDARY' ? "bg-yellow-500 shadow-yellow-500/50" :
                                         ui.item.rarity === 'EPIC' ? "bg-purple-500 shadow-purple-500/50" :
                                         ui.item.rarity === 'RARE' ? "bg-blue-500 shadow-blue-500/50" :
                                         "bg-gray-500"
                                     )}>
                                         {ui.item.name[0]}
                                     </div>
                                     <div className="text-center">
                                         <p className="text-xs font-bold text-white truncate w-[100px]">{ui.item.name}</p>
                                         <p className="text-[10px] text-muted-foreground">{ui.item.type}</p>
                                     </div>
                                 </button>
                             ))}
                         </div>
                     )}
                     <button 
                        onClick={handleSendItemGift}
                        disabled={sendingGift || !selectedItem}
                        className="mt-4 w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {sendingGift ? 'Sending...' : 'Send Item'}
                    </button>
                </div>
            )}
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu 
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onEdit={() => {
                const msg = messages.find(m => m.id === contextMenu.messageId);
                if (msg) {
                    setEditingMessage({ id: msg.id, content: msg.content });
                    setNewMessage(msg.content);
                }
            }}
            onReply={() => {
                const msg = messages.find(m => m.id === contextMenu.messageId);
                if (msg) {
                    setReplyingTo({ 
                        id: msg.id, 
                        content: msg.content, 
                        username: msg.sender?.username || msg.sender?.name || 'User' 
                    });
                }
            }}
            onReact={async (type) => {
              // Optimistic update? Maybe complex for reaction count.
              // Let's just call server and reload for now, or simple optimistic add
              const msgId = contextMenu.messageId;
              const result = await toggleMessageReaction(msgId, type);
              if (result.success) {
                  // Reload messages to get updated reactions
                  loadMessages(activeConversation!); 
              } else {
                  toast.error('Failed to react');
              }
              setContextMenu(null); // Close context menu after reacting
          }}
            canEdit={(() => {
                const msg = messages.find(m => m.id === contextMenu.messageId);
                if (!msg) return false;
                // Can edit if it's your own message (senderId is 'me' or sender is not the other user)
                const isMyMessage = msg.senderId === 'me' || !!(msg.sender && msg.sender.id !== activeConvData?.otherUser?.id);
                return isMyMessage;
            })()}
        />
      )}
    </div>
  );
}
