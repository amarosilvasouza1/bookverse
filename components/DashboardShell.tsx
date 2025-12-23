'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, MessageCircle, Settings, LogOut, PlusCircle, Zap, Trophy, Brain, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { ChangelogModal } from './ChangelogModal';
import NotificationBell from './NotificationBell';
import { getTotalUnreadMessageCount } from '@/app/actions/chat';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardShell({ 
  children, 
  userId 
}: { 
  children: React.ReactNode;
  userId: string;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  // Show system update notification
  useEffect(() => {
    const hasSeenUpdate = localStorage.getItem('has_seen_v0.020.1');
    if (!hasSeenUpdate) {
      setTimeout(() => {
        toast(t('systemUpdate'), {
            description: t('clickToSee'),
            action: {
                label: t('whatsNew'),
                onClick: () => setShowChangelog(true)
            },
            duration: 8000,
        });
        localStorage.setItem('has_seen_v0.020.1', 'true');
      }, 1500);
    }
  }, [t]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const count = await getTotalUnreadMessageCount();
        setUnreadMessages(count);
      } catch (error) {
        console.error('Failed to fetch unread messages', error);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const navigation = [
    { name: t('overview'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('browse'), href: '/dashboard/browse', icon: BookOpen },
    { name: t('myBooks'), href: '/dashboard/books', icon: BookOpen },
    { name: t('readingRooms'), href: '/dashboard/reading-rooms', icon: Users, badge: 2 }, // Mock badge for "Live"
    { name: t('social'), href: '/dashboard/social', icon: MessageCircle, badge: unreadMessages },
    { name: t('leaderboard'), href: '/dashboard/leaderboard', icon: Trophy },
    { name: t('skills'), href: '/dashboard/skills', icon: Brain },
    { name: t('settings'), href: '/dashboard/settings', icon: Settings },
    { name: t('subscription'), href: '/dashboard/subscription', icon: Zap },
  ];

  // Mobile Hotbar Items (Overview, Books, Social, Create) + More
  const mobileMainItems = navigation.filter(item => 
    ['/dashboard', '/dashboard/browse', '/dashboard/social'].includes(item.href)
  );

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login'; // Force full reload
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/30" suppressHydrationWarning>
      
      {/* Desktop Sidebar (unchanged) */}
      <aside className="fixed h-screen border-r border-white/5 hidden md:flex flex-col bg-zinc-950/50 backdrop-blur-xl z-50 transition-all duration-300 w-20 lg:w-64">
        {/* ... (Sidebar content kept same as desktop doesn't change) ... */}
        <div className="p-6 border-b border-white/5 flex flex-col gap-4 items-center lg:items-stretch">
          <Link href="/dashboard" className="flex items-center gap-3 group justify-center lg:justify-start">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] group-hover:scale-105 transition-all duration-300 shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent hidden lg:block tracking-tight">
              BookVerse
            </span>
          </Link>
        </div>

        <div className="px-2 lg:px-4 py-4">
           <div className="flex items-center justify-center lg:justify-between px-3 py-2.5 bg-white/5 rounded-xl border border-white/5 transition-colors hover:bg-white/10 group cursor-pointer">
             <span className="text-xs font-semibold text-zinc-400 hidden lg:block group-hover:text-zinc-200 transition-colors">Notifications</span>
             <NotificationBell userId={userId} placement="bottom-left" />
           </div>
        </div>

        <nav className="flex-1 p-2 lg:p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 lg:px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative justify-center lg:justify-start',
                  isActive 
                    ? 'text-white bg-primary/10 shadow-[inner_0_0_10px_rgba(168,85,247,0.1)]' 
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                )}
                title={item.name}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeSidebar"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-full hidden lg:block" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <item.icon className={cn(
                  "w-5 h-5 lg:mr-3 transition-colors shrink-0",
                  isActive ? "text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "group-hover:text-zinc-200"
                )} />
                <span className="flex-1 hidden lg:block truncate">{item.name}</span>
                {item.badge && item.badge > 0 ? (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center absolute top-1 right-1 lg:static shadow-sm shadow-red-500/50">
                        {item.badge > 99 ? '99+' : item.badge}
                    </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-zinc-950/30 space-y-3">
          <Link 
            href="/dashboard/create-book"
            className="flex items-center justify-center w-full px-0 lg:px-4 py-3 text-sm font-bold text-white bg-linear-to-r from-primary to-purple-600 rounded-xl shadow-[0_4px_20px_rgba(168,85,247,0.4)] hover:shadow-[0_6px_25px_rgba(168,85,247,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <PlusCircle className="w-5 h-5 lg:mr-2 relative z-10" />
            <span className="hidden lg:inline relative z-10">{t('createBook')}</span>
          </Link>
          <button 
            onClick={handleSignOut}
            className="flex items-center justify-center lg:justify-start w-full px-0 lg:px-4 py-3 text-sm font-medium text-zinc-500 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10 group"
          >
            <LogOut className="w-5 h-5 lg:mr-3 group-hover:scale-110 transition-transform" />
            <span className="hidden lg:inline">{t('signOut')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Component Container */}
      <div className="md:hidden">
        {/* Expanded Menu Overlay */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-0 left-0 right-0 z-70 bg-[#111] border-t border-white/10 rounded-t-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
                    >
                        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6" />
                        
                        <div className="grid grid-cols-4 gap-4 mb-8">
                             {navigation.map((item) => (
                                <Link 
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex flex-col items-center gap-2 p-2 rounded-xl active:bg-white/5 transition-colors"
                                >
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 shadow-lg",
                                        pathname === item.href ? "bg-primary/20 border-primary/50" : "bg-zinc-900"
                                    )}>
                                        <item.icon className={cn("w-6 h-6", pathname === item.href ? "text-primary" : "text-zinc-400")} />
                                    </div>
                                    <span className="text-[10px] font-medium text-center text-zinc-400 px-1 leading-tight">{item.name}</span>
                                </Link>
                             ))}
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                             <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Actions</h3>
                             <Link href="/dashboard/create-book" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold text-sm">
                                <PlusCircle className="w-5 h-5" />
                                {t('createBook')}
                             </Link>
                             <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-sm">
                                <LogOut className="w-5 h-5" />
                                {t('signOut')}
                             </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>

        {/* Floating Bottom Hotbar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
            <div className="mx-2 mb-2 pointer-events-auto">
            <nav className="flex items-center justify-between px-1 py-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                
                {mobileMainItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            'flex flex-col items-center justify-center min-w-[64px] h-14 rounded-xl transition-all duration-300 relative group flex-1',
                            isActive ? 'bg-primary/10' : 'hover:bg-white/5'
                        )}
                        >
                        {isActive && (
                            <motion.div
                            layoutId="mobileActive"
                            className="absolute inset-0 bg-primary/10 rounded-xl"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        
                        <div className="relative z-10 flex flex-col items-center justify-center gap-0.5 w-full">
                            <item.icon className={cn(
                            "w-5 h-5 transition-all duration-300", 
                            isActive ? "text-primary scale-100" : "text-zinc-500 group-hover:text-zinc-300 mb-0.5"
                            )} />
                            
                            <span className={cn(
                            "text-[10px] font-medium transition-all duration-300 max-w-full truncate px-1",
                            isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-400"
                            )}>
                            {item.name}
                            </span>

                            {item.badge && item.badge > 0 && (
                            <span className="absolute top-0 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-1 ring-black">
                                {item.badge}
                            </span>
                            )}
                        </div>
                        </Link>
                    );
                })}
                
                {/* More Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className={cn(
                        'flex flex-col items-center justify-center min-w-[64px] h-14 rounded-xl transition-all duration-300 relative group flex-1',
                        isMobileMenuOpen ? 'bg-white/10' : 'hover:bg-white/5'
                    )}
                >
                    <div className="relative z-10 flex flex-col items-center justify-center gap-0.5 w-full">
                        <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                            <div className="bg-zinc-500 rounded-[1px] w-full h-full group-hover:bg-zinc-300" />
                            <div className="bg-zinc-500 rounded-[1px] w-full h-full group-hover:bg-zinc-300" />
                            <div className="bg-zinc-500 rounded-[1px] w-full h-full group-hover:bg-zinc-300" />
                            <div className="bg-zinc-500 rounded-[1px] w-full h-full group-hover:bg-zinc-300" />
                        </div>
                        <span className="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-400 mt-0.5">{t('more')}</span>
                    </div>
                </button>

                {/* Floating Create Button */}
                <Link
                href="/dashboard/create-book"
                className="flex items-center justify-center w-12 h-12 bg-linear-to-r from-primary to-purple-600 rounded-xl shadow-lg shadow-primary/25 active:scale-95 transition-all ml-1 shrink-0"
                >
                <PlusCircle className="w-6 h-6 text-white" />
                </Link>

            </nav>
            </div>
        </div>
      </div>

      {/* Mobile Top Bar - Cleaner */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-4" suppressHydrationWarning>
          <div className="flex-1 flex items-center gap-2">
            <span className="font-bold text-lg bg-linear-to-r from-primary to-purple-400 bg-clip-text text-transparent">BookVerse</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/leaderboard" className="w-9 h-9 flex items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20 active:scale-95 transition-all">
              <Trophy className="w-4 h-4 text-yellow-400" />
            </Link>
            <NotificationBell userId={userId} placement="bottom-right" />
          </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-20 lg:ml-64 min-h-screen pb-24 pt-16 md:pt-0 md:pb-0 overflow-x-hidden bg-[#0A0A0A] transition-all duration-300">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto overflow-x-hidden" suppressHydrationWarning={true}>
          {children}
        </div>
      </main>
      <ChangelogModal 
        isOpen={showChangelog} 
        onClose={() => setShowChangelog(false)} 
      />
    </div>
  );
}
