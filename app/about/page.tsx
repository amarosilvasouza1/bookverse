'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Users, Globe, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 font-sans overflow-hidden">
      {/* Background Blobs (Premium Vibe) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-blue-600/05 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-24">
         <Link 
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t('backToHome') || 'Back to Home'}
        </Link>
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-24"
        >
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-linear-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                {t('aboutBookVerse')}
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                {t('aboutSubtitle')}
            </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
            >
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-4xl font-bold">{t('ourMission') || 'Our Mission'}</h2>
                <p className="text-lg text-zinc-400 leading-relaxed">
                   We believe everyone has a story to tell. BookVerse is built to empower authors with AI tools and connect them with a global community of passionate readers.
                </p>
            </motion.div>
             <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative aspect-video rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl"
            >
                {/* Placeholder visual/graphic */}
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/20 to-blue-500/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-white/10" />
                </div>
            </motion.div>
        </div>
        
        {/* Simple Team Section */}
        <div className="text-center">
             <h2 className="text-3xl font-bold mb-12">Global Community</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
                   <Globe className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                   <h3 className="text-xl font-bold text-white mb-2">Worldwide</h3>
                   <p className="text-zinc-400">Connecting readers from Japan, Brazil, and everywhere in between.</p>
                </div>
                <div className="p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
                    <Users className="w-10 h-10 text-pink-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Creators</h3>
                    <p className="text-zinc-400">Thousands of authors publishing their first novels.</p>
                </div>
                 <div className="p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
                    <BookOpen className="w-10 h-10 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Library</h3>
                    <p className="text-zinc-400">A vast collection of stories across all genres.</p>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
}
