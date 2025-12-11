'use client';

import { useState } from 'react';
import { submitReport } from '@/app/actions/moderation';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'POST' | 'COMMENT' | 'BOOK' | 'MESSAGE' | 'USER';
  contentId: string;
}

const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam', icon: '🚫' },
  { value: 'HARASSMENT', label: 'Harassment', icon: '⚠️' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate Content', icon: '🔞' },
  { value: 'COPYRIGHT', label: 'Copyright Violation', icon: '©️' },
  { value: 'OTHER', label: 'Other', icon: '❓' },
];

export default function ReportModal({ isOpen, onClose, contentType, contentId }: ReportModalProps) {
  const { t } = useLanguage();
  const [reason, setReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    setSubmitting(true);
    const result = await submitReport(contentType, contentId, reason as 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE' | 'COPYRIGHT' | 'OTHER', details || undefined);
    
    if (result.success) {
      toast.success(t('reportSubmitted'));
      onClose();
    } else {
      toast.error(result.error || 'Failed to submit report');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">{t('reportContent')}</h2>
              <p className="text-xs text-zinc-500">Help us keep the community safe</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reason Selection */}
        <div className="space-y-2 mb-4">
          <p className="text-sm text-zinc-400 mb-2">Why are you reporting this?</p>
          {REPORT_REASONS.map(r => (
            <button
              key={r.value}
              onClick={() => setReason(r.value)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                ${reason === r.value 
                  ? 'bg-red-500/10 border-red-500/50 text-white' 
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'}`}
            >
              <span className="text-xl">{r.icon}</span>
              <span className="font-medium">{r.label}</span>
            </button>
          ))}
        </div>

        {/* Details */}
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Additional details (optional)..."
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-500 resize-none h-20 mb-4"
        />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!reason || submitting}
          className="w-full py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </div>
  );
}
