'use client';

import { useState, useEffect } from 'react';
import { getReadingStats } from '@/app/actions/reading';
import { BookOpen, Clock, FileText, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ReadingStatsData {
  totalSessions: number;
  totalPagesRead: number;
  totalTimeMinutes: number;
  booksRead: number;
  recentActivity: {
    bookId: string;
    bookTitle: string;
    pagesRead: number;
    duration: number;
    date: Date;
  }[];
}

export default function ReadingStats() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<ReadingStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const result = await getReadingStats();
      if (result.success && result.data) {
        setStats(result.data as ReadingStatsData);
      }
      setLoading(false);
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-white/10 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const statCards = [
    { 
      icon: FileText, 
      value: stats.totalPagesRead, 
      label: t('pagesRead') || 'Pages Read',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    { 
      icon: Clock, 
      value: formatTime(stats.totalTimeMinutes), 
      label: t('timeReading') || 'Time Reading',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    { 
      icon: BookOpen, 
      value: stats.booksRead, 
      label: t('booksRead') || 'Books Read',
      color: 'text-green-400',
      bg: 'bg-green-500/10'
    },
    { 
      icon: TrendingUp, 
      value: stats.totalSessions, 
      label: t('sessions') || 'Sessions',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10'
    },
  ];

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        {t('readingStats') || 'Reading Stats'}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div 
            key={i}
            className={`p-4 rounded-xl ${stat.bg} border border-white/5 flex flex-col items-center text-center`}
          >
            <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
            <span className="text-2xl font-bold text-white">{stat.value}</span>
            <span className="text-xs text-zinc-400 mt-1">{stat.label}</span>
          </div>
        ))}
      </div>

      {stats.recentActivity.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">{t('recentActivity') || 'Recent Activity'}</h3>
          <div className="space-y-2">
            {stats.recentActivity.slice(0, 5).map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm text-white truncate max-w-[200px]">{activity.bookTitle}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>{activity.pagesRead} pages</span>
                  <span>{formatTime(activity.duration)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
