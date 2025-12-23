import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, CheckCircle2, Zap, Bug, History, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Version {
  version: string;
  date: string;
  title: string;
  type: 'major' | 'feature' | 'patch';
  changes: {
    type: 'new' | 'improvement' | 'fix';
    text: string;
  }[];
}

const VERSIONS: Version[] = [
  {
    version: 'v0.020.1',
    date: '2025-12-22',
    title: 'Localization & Mobile Experience',
    type: 'feature',
    changes: [
      { type: 'new', text: 'Settings Page fully localized (EN, PT, JP)' },
      { type: 'new', text: 'Added "Rainbow Name" and "Animated Avatar" rewards' },
      { type: 'improvement', text: 'Enhanced mobile navigation with "More" menu' },
      { type: 'improvement', text: 'Mobile-optimized Reading Rooms layout' },
      { type: 'fix', text: 'Fixed various UI glitches and type errors' }
    ]
  },
  {
    version: 'v0.019.0',
    date: '2025-12-20',
    title: 'Reading Rooms Beta',
    type: 'major',
    changes: [
      { type: 'new', text: 'Launched Live Reading Rooms' },
      { type: 'new', text: 'Real-time chat in rooms' },
      { type: 'new', text: 'Skill Tree System implementation' }
    ]
  }
];

export function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  const { t } = useLanguage();
  const [activeVersion, setActiveVersion] = useState<string>(VERSIONS[0].version);

  const getIcon = (type: string) => {
    switch (type) {
      case 'new': return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'improvement': return <Zap className="w-4 h-4 text-indigo-400" />;
      case 'fix': return <Bug className="w-4 h-4 text-emerald-400" />;
      default: return <CheckCircle2 className="w-4 h-4 text-zinc-400" />;
    }
  };

  const activeVer = VERSIONS.find(v => v.version === activeVersion);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[800px] h-[600px] bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row"
          >
            {/* Close Button Mobile */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-zinc-900/50 rounded-full text-zinc-400 sm:hidden"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Sidebar */}
            <div className="w-full sm:w-64 bg-zinc-900/30 border-b sm:border-b-0 sm:border-r border-zinc-800 flex flex-col">
              <div className="p-4 border-b border-zinc-800/50">
                <h3 className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  <History className="w-4 h-4" />
                  {t('versionHistory') || 'Version History'}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {VERSIONS.map((v) => (
                  <button
                    key={v.version}
                    onClick={() => setActiveVersion(v.version)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all group ${
                        activeVersion === v.version 
                        ? 'bg-indigo-500/10 text-indigo-400 font-medium ring-1 ring-indigo-500/20' 
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-mono">{v.version}</span>
                        {v.type === 'major' && <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
                    </div>
                    <div className="text-[10px] opacity-60 flex justify-between">
                        <span>{v.date}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col bg-zinc-950/50">
                {activeVer && (
                    <>
                    <div className="p-6 sm:p-8 border-b border-zinc-800/50 bg-zinc-900/20 relative">
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wider ${
                                activeVer.type === 'major' 
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            }`}>
                                {activeVer.type}
                            </span>
                            <span className="text-zinc-500 text-xs font-mono">{activeVer.date}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{activeVer.title}</h2>
                        
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors hidden sm:block"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                        <div className="space-y-4">
                            {activeVer.changes.map((change, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors">
                                    <div className="mt-0.5 shrink-0 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                                        {getIcon(change.type)}
                                    </div>
                                    <div>
                                        <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">{change.text}</p>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 block ${
                                            change.type === 'new' ? 'text-amber-500/60' :
                                            change.type === 'improvement' ? 'text-indigo-500/60' :
                                            'text-emerald-500/60'
                                        }`}>
                                            {change.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    </>
                )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
