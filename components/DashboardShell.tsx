'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Users, Settings, LogOut, PlusCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import NotificationBell from './NotificationBell';

export default function DashboardShell({ 
  children, 
  userId 
}: { 
  children: React.ReactNode;
  userId: string;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navigation = [
    { name: t('overview'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('browse'), href: '/dashboard/browse', icon: BookOpen },
    { name: t('myBooks'), href: '/dashboard/books', icon: BookOpen },
    { name: t('communities'), href: '/dashboard/communities', icon: Users },
    { name: t('settings'), href: '/dashboard/settings', icon: Settings },
    { name: 'Subscription', href: '/dashboard/subscription', icon: Zap },
  ];

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login'; // Force full reload to clear client state
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/30" suppressHydrationWarning>
      {/* Desktop Sidebar */}
      <aside className="fixed h-screen w-64 border-r border-white/10 hidden md:flex flex-col bg-background z-50">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/dashboard/browse" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
              BookVerse
            </span>
          </Link>
        </div>

        <div className="px-4 py-2">
           <div className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-lg mb-2">
             <span className="text-xs font-medium text-zinc-400">Notifications</span>
             <NotificationBell userId={userId} placement="bottom-left" />
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden',
                  isActive 
                    ? 'text-white bg-primary/10 shadow-inner' 
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full" />
                )}
                <item.icon className={cn(
                  "w-5 h-5 mr-3 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-background space-y-2">
          <Link 
            href="/dashboard/create-book"
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white bg-linear-to-r from-primary to-purple-600 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            {t('createBook')}
          </Link>
          <button 
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-muted-foreground hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {t('signOut')}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-white/10 md:hidden z-50 pb-safe">
        <div className="flex items-center justify-around p-2">
          {navigation.filter(item => !['Settings', 'Subscription'].includes(item.name)).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px]',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-white'
                )}
              >
                <item.icon className={cn("w-6 h-6 mb-1", isActive && "fill-current")} />
                <span className="text-[10px] font-medium truncate max-w-[64px]">{item.name}</span>
              </Link>
            );
          })}
          
          {/* Mobile Notification Bell */}
          <div className="flex flex-col items-center justify-center p-2 min-w-[60px]">
             <NotificationBell userId={userId} placement="top-center" />
             <span className="text-[10px] font-medium text-muted-foreground mt-1">Alerts</span>
          </div>

          <Link
            href="/dashboard/create-book"
            className="flex flex-col items-center justify-center p-2 text-primary min-w-[60px]"
          >
            <PlusCircle className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">{t('create')}</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen pb-20 md:pb-0">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
