'use client';

import { X, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ApiKeyTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyTutorialModal({ isOpen, onClose }: ApiKeyTutorialModalProps) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 m-4">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-bold text-white">{t('tutorialTitle')}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/20">
                1
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-white">{t('step1Title')}</h3>
                <p className="text-sm text-zinc-400">
                  {t('step1Desc')}
                </p>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  {t('openStudio')}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold border border-white/10">
                2
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-white">{t('step2Title')}</h3>
                <p className="text-sm text-zinc-400">
                  {t('step2Desc')}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold border border-white/10">
                3
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-white">{t('step3Title')}</h3>
                <p className="text-sm text-zinc-400">
                  {t('step3Desc')}
                </p>
              </div>
            </div>

          </div>

          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <p className="text-xs text-purple-300 text-center">
              {t('freeApiNote')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-zinc-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            {t('gotIt')}
          </button>
        </div>

      </div>
    </div>
  );
}
