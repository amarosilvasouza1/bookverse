'use client';

import { useState, useEffect } from 'react';
import { BarChart, Users, BookOpen, TrendingUp, Loader2 } from 'lucide-react';
import { getBookAnalytics } from '@/app/actions/analytics';
import { useLanguage } from '@/context/LanguageContext';

interface AnalyticsDashboardProps {
  bookId: string;
}

interface AnalyticsData {
  totalReaders: number;
  avgPercentage: number;
  completionRate: number;
  totalPages: number;
  funnelData: { page: number; count: number }[];
}

export default function AnalyticsDashboard({ bookId }: AnalyticsDashboardProps) {
  const { t } = useLanguage();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const result = await getBookAnalytics(bookId);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || t('failedToLoadAnalytics'));
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, [bookId, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const maxReaders = Math.max(...data.funnelData.map(d => d.count), 1);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('totalReaders')}</p>
            <h3 className="text-2xl font-bold text-white">{data.totalReaders}</h3>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('completionRate')}</p>
            <h3 className="text-2xl font-bold text-white">{data.completionRate}%</h3>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('avgProgress')}</p>
            <h3 className="text-2xl font-bold text-white">{data.avgPercentage}%</h3>
          </div>
        </div>
      </div>

      {/* Reader Funnel / Drop-off */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart className="w-5 h-5 text-primary" />
            {t('readerRetention')}
          </h3>
          <span className="text-xs text-muted-foreground">{t('readersReachingEachPage')}</span>
        </div>

        <div className="space-y-3">
          {data.funnelData.map((item) => {
            const percentage = Math.round((item.count / (data.totalReaders || 1)) * 100);
            const height = (item.count / maxReaders) * 100;
            
            return (
              <div key={item.page} className="group">
                <div className="flex items-center gap-4 text-sm mb-1">
                  <span className="w-16 text-muted-foreground font-mono">{t('pageLabel', { page: item.page })}</span>
                  <span className="text-white font-medium">{t('readersCount', { count: item.count })}</span>
                  <span className="text-xs text-muted-foreground">({percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-primary to-purple-500 rounded-full transition-all duration-500 group-hover:brightness-110"
                    style={{ width: `${height}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
