'use client';

import { useState, useEffect } from 'react';
import { getReports, resolveReport } from '@/app/actions/moderation';
import { cn } from '@/lib/utils';
import { AlertTriangle, Check, X, Ban, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Report {
  id: string;
  reporterId: string;
  contentType: string;
  contentId: string;
  reason: string;
  details: string | null;
  status: string;
  action: string | null;
  createdAt: Date;
  reporter: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('PENDING');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getReports(filter || undefined);
      if (result.success && result.data) {
        setReports(result.data as Report[]);
      }
      setLoading(false);
    };
    fetchData();
  }, [filter]);

  const loadReports = async () => {
    setLoading(true);
    const result = await getReports(filter || undefined);
    if (result.success && result.data) {
      setReports(result.data as Report[]);
    }
    setLoading(false);
  };

  const handleAction = async (reportId: string, action: 'WARN' | 'REMOVE' | 'BAN' | 'DISMISS') => {
    setProcessing(reportId);
    const result = await resolveReport(reportId, action);
    if (result.success) {
      toast.success(`Action "${action}" taken successfully`);
      loadReports();
    } else {
      toast.error(result.error || 'Failed to process report');
    }
    setProcessing(null);
  };

  const reasonLabels: Record<string, string> = {
    SPAM: '🚫 Spam',
    HARASSMENT: '⚠️ Harassment',
    INAPPROPRIATE: '🔞 Inappropriate',
    COPYRIGHT: '©️ Copyright',
    OTHER: '❓ Other',
  };

  const contentTypeLabels: Record<string, string> = {
    POST: '📝 Post',
    COMMENT: '💬 Comment',
    BOOK: '📚 Book',
    MESSAGE: '✉️ Message',
    USER: '👤 User',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Content Reports</h1>
              <p className="text-sm text-zinc-500">Review and moderate reported content</p>
            </div>
          </div>
          <span className="text-sm text-zinc-400">{reports.length} reports</span>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['PENDING', 'RESOLVED', 'DISMISSED', ''].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                filter === status 
                  ? "bg-primary text-white" 
                  : "bg-white/5 text-zinc-400 hover:bg-white/10"
              )}
            >
              {status || 'All'}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No reports found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className={cn(
                  "p-6 rounded-2xl border transition-all",
                  report.status === 'PENDING' 
                    ? "bg-white/5 border-yellow-500/30" 
                    : "bg-white/5 border-white/10"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {reasonLabels[report.reason] || report.reason}
                      </span>
                      <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-zinc-400">
                        {contentTypeLabels[report.contentType] || report.contentType}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        report.status === 'PENDING' ? "bg-yellow-500/20 text-yellow-400" :
                        report.status === 'RESOLVED' ? "bg-green-500/20 text-green-400" :
                        "bg-zinc-500/20 text-zinc-400"
                      )}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Reported by @{report.reporter.username} • {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-600 font-mono">{report.contentId.slice(0, 8)}...</span>
                </div>

                {report.details && (
                  <p className="text-sm text-zinc-300 bg-black/20 p-3 rounded-lg mb-4">{report.details}</p>
                )}

                {report.status === 'PENDING' && (
                  <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleAction(report.id, 'DISMISS')}
                      disabled={processing === report.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-zinc-400 transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleAction(report.id, 'WARN')}
                      disabled={processing === report.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg text-sm text-yellow-400 transition-colors disabled:opacity-50"
                    >
                      <Eye className="w-4 h-4" />
                      Warn
                    </button>
                    <button
                      onClick={() => handleAction(report.id, 'REMOVE')}
                      disabled={processing === report.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-sm text-red-400 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                    <button
                      onClick={() => handleAction(report.id, 'BAN')}
                      disabled={processing === report.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm text-red-500 font-medium transition-colors disabled:opacity-50"
                    >
                      <Ban className="w-4 h-4" />
                      Ban User
                    </button>
                  </div>
                )}

                {report.action && (
                  <div className="flex items-center gap-2 pt-4 border-t border-white/10 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-zinc-400">Action taken: <span className="text-white font-medium">{report.action}</span></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
