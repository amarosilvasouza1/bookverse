'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, Heart, MessageCircle, UserPlus, Info, AtSign, Smile, Book, FileText, X, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { getNotifications, markAsRead, markAllAsRead } from '@/app/actions/notification';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

export default function NotificationBell({ userId, placement = 'bottom-right' }: { userId: string; placement?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-center' }) {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'social' | 'books' | 'system'>('all');
  const [isMobile, setIsMobile] = useState(false);
  const prevCountRef = useRef(0);
  const [mounted, setMounted] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Handle client-side mounting for Portal
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updateDropdownPosition = useCallback(() => {
    if (!buttonRef.current || isMobile) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY;
    
    // Default to bottom-right alignment relative to button
    let top = rect.bottom + 8 + scrollTop;
    let left = rect.right - 400; // 400px width

    if (placement === 'bottom-left') {
        left = rect.left;
    } else if (placement === 'top-right') {
        top = rect.top - 400 - 8 + scrollTop; // Height needs estimation or ref
    }

    // Safety check for screen edges
    if (left < 10) left = 10;
    if (left + 400 > window.innerWidth - 10) left = window.innerWidth - 410;

    setDropdownPosition({ top, left });
  }, [placement, isMobile]);

  useEffect(() => {
    if (isOpen) {
        updateDropdownPosition();
        window.addEventListener('scroll', updateDropdownPosition, true);
        window.addEventListener('resize', updateDropdownPosition);
    }
    return () => {
        window.removeEventListener('scroll', updateDropdownPosition, true);
        window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen, updateDropdownPosition]);

  const fetchNotifications = useCallback(async () => {
    try {
      const result = await getNotifications(userId);
      if (result.success && result.data) {
        setNotifications(result.data);
        const newUnreadCount = result.unreadCount || 0;
        
        // Play sound using Audio constructor which works in client
        if (newUnreadCount > prevCountRef.current) {
          try {
            const audio = new Audio('/notification.mp3'); 
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } catch (_e) {
            // ignore audio errors
          }
        }
        prevCountRef.current = newUnreadCount;
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        // Since we are portaling, we check if click is outside BOTH the dropdown AND the trigger button
        if (
            dropdownRef.current && 
            !dropdownRef.current.contains(event.target as Node) &&
            buttonRef.current &&
            !buttonRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isMobile && isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, isOpen]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    prevCountRef.current = Math.max(0, prevCountRef.current - 1);
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    prevCountRef.current = 0;
    await markAllAsRead(userId);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'social') return ['LIKE', 'COMMENT', 'FOLLOW', 'MENTION', 'REACTION'].includes(n.type);
    if (activeTab === 'books') return ['BOOK_UPDATE', 'NEW_CHAPTER'].includes(n.type);
    if (activeTab === 'system') return ['SYSTEM'].includes(n.type);
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'LIKE': return <Heart className="w-4 h-4 text-red-400" fill="currentColor" />;
      case 'COMMENT': return <MessageCircle className="w-4 h-4 text-blue-400" />;
      case 'FOLLOW': return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'MENTION': return <AtSign className="w-4 h-4 text-orange-400" />;
      case 'REACTION': return <Smile className="w-4 h-4 text-yellow-400" />;
      case 'BOOK_UPDATE': return <Book className="w-4 h-4 text-purple-400" />;
      case 'NEW_CHAPTER': return <FileText className="w-4 h-4 text-indigo-400" />;
      default: return <Info className="w-4 h-4 text-zinc-400" />;
    }
  };

  const DropdownContent = (
    <>
        {/* Mobile Sheet Overlay */}
        {isMobile && isOpen && (
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] animate-in fade-in duration-200" 
                onClick={() => setIsOpen(false)}
            />
        )}
        
        {/* Dropdown / Sheet */}
        {isOpen && (
            <div 
                ref={dropdownRef}
                style={!isMobile ? { 
                    position: 'absolute',
                    top: dropdownPosition.top,
                    left: dropdownPosition.left
                } : undefined}
                className={`
                    ${isMobile 
                        ? 'fixed inset-x-0 bottom-0 top-[15vh] z-[9999] rounded-t-3xl border-t border-white/10' 
                        : `z-[9999] w-[400px] rounded-2xl border border-white/10`
                    }
                    bg-[#0a0a0a]/90 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/5
                    animate-in fade-in duration-200 ${isMobile ? 'slide-in-from-bottom-20' : 'zoom-in-95'}
                `}
            >
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/5 relative">
                     {isMobile && (
                         <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/20 rounded-full" />
                     )}
                    <h3 className="font-bold text-white text-lg tracking-tight mt-1">{t('notifications')}</h3>
                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-indigo-500/10 transition-colors"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                {t('markAllAsRead')}
                            </button>
                        )}
                        {isMobile && (
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 overflow-x-auto scrollbar-hide shrink-0 bg-[#0a0a0a]/50">
                    {(['all', 'social', 'books', 'system'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 px-4 py-3 text-xs font-semibold tracking-wide transition-all relative whitespace-nowrap
                        ${activeTab === tab ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                    >
                        {tab.toUpperCase()}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500" />
                        )}
                    </button>
                    ))}
                </div>

                {/* List */}
                <div className={`overflow-y-auto custom-scrollbar ${isMobile ? 'flex-1 pb-10' : 'max-h-[60vh]'} p-2 space-y-2`}>
                    {loading ? (
                        <div className="p-10 flex flex-col items-center justify-center text-zinc-500 gap-3">
                             <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                             <span className="text-sm font-medium">{t('loadingNotifications')}</span>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center gap-4 text-zinc-500 opacity-60">
                            <Bell className="w-10 h-10 stroke-[1.5]" />
                            <p className="text-sm font-medium">{t('noNotificationsYet')}</p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`
                                    group relative p-3 rounded-xl border transition-all duration-200
                                    ${!notification.read 
                                        ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-indigo-500/30' 
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }
                                `}
                            >
                                <div className="flex gap-3.5">
                                    {/* Icon Container */}
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center shrink-0 border mt-0.5
                                        ${!notification.read ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-black/40 border-white/5'}
                                    `}>
                                        {getIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm leading-snug mb-1 ${!notification.read ? 'text-white font-medium' : 'text-zinc-300'}`}>
                                            {notification.message}
                                        </p>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </span>
                                            
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 {!notification.read && (
                                                    <button
                                                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                        className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                                        title={t('markAsRead')}
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {notification.link && (
                                            <Link
                                                href={notification.link}
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="absolute inset-0 z-0"
                                            >
                                                <span className="sr-only">{t('viewDetails')}</span>
                                            </Link>
                                        )}
                                    </div>
                                    
                                    {/* Read Status Indicator */}
                                    {!notification.read && (
                                        <div className="absolute top-4 right-3 w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
    </>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-full transition-all duration-300 group
            ${isOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-zinc-400 hover:text-white'}`}
      >
        <Bell className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'scale-110' : 'group-hover:scale-110'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#121212] animate-pulse" />
        )}
      </button>

      {mounted && createPortal(DropdownContent, document.body)}
    </>
  );
}
