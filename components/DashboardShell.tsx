'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, MessageCircle, Settings, LogOut, PlusCircle, Zap, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
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
    { name: t('social'), href: '/dashboard/social', icon: MessageCircle, badge: unreadMessages },
    { name: t('leaderboard'), href: '/dashboard/leaderboard', icon: Trophy },
    { name: t('settings'), href: '/dashboard/settings', icon: Settings },
    { name: 'Subscription', href: '/dashboard/subscription', icon: Zap },
  ];

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
      
      {/* Desktop Sidebar */}
      <aside className="fixed h-screen border-r border-white/5 hidden md:flex flex-col bg-zinc-950/50 backdrop-blur-xl z-50 transition-all duration-300 w-20 lg:w-64">
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

      {/* Mobile Bottom Navigation - "Hotbar" Style */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 pointer-events-none">
        
        {/* Floating Glass Bar */}
        <div className="mx-2 mb-2 pointer-events-auto">
          <nav className="flex items-center justify-between px-1 py-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            
            {/* Main Items */}
            {navigation.filter(item => 
              ['/dashboard', '/dashboard/browse', '/dashboard/books', '/dashboard/social'].includes(item.href)
            ).map((item) => {
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
            
            {/* Settings Item */}
            <Link
              href="/dashboard/settings"
               className={cn(
                'flex flex-col items-center justify-center min-w-[64px] h-14 rounded-xl transition-all duration-300 relative group flex-1',
                pathname === '/dashboard/settings' ? 'bg-primary/10' : 'hover:bg-white/5'
              )}
            >
              <div className="relative z-10 flex flex-col items-center justify-center gap-0.5 w-full">
                <Settings className={cn(
                  "w-5 h-5 transition-all duration-300", 
                  pathname === '/dashboard/settings' ? "text-primary scale-100" : "text-zinc-500 group-hover:text-zinc-300 mb-0.5"
                )} />
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-300",
                  pathname === '/dashboard/settings' ? "text-white" : "text-zinc-500 group-hover:text-zinc-400"
                )}>
                  {t('settings')}
                </span>
                {pathname === '/dashboard/settings' && (
                    <motion.div 
                      layoutId="mobileActive"
                      className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                )}
              </div>
            </Link>

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
    </div>
  );
}
