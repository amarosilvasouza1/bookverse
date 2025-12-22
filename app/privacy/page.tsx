'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-indigo-600/05 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-24">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t('backToHome') || 'Back to Home'}
        </Link>
        
        <div className="mb-16">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 text-purple-400">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            {t('privacyTitle')}
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
             {t('privacyIntro')}
          </p>
        </div>

        <div className="space-y-12">
          {/* Introduction */}
          <section className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <FileText className="w-6 h-6 text-zinc-500" />
              {t('privacyIntroTitle')}
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              {t('privacyIntroText')}
            </p>
          </section>

          {/* Data Collection */}
          <section className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 backdrop-blur-md">
             <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Eye className="w-6 h-6 text-zinc-500" />
              {t('privacyCollectionTitle')}
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              {t('privacyCollectionText')}
            </p>
            <ul className="space-y-3 text-zinc-400 list-disc pl-5">
              <li>{t('privacyCollectionList1')}</li>
              <li>{t('privacyCollectionList2')}</li>
              <li>{t('privacyCollectionList3')}</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-zinc-500" />
              {t('privacySecurityTitle')}
            </h2>
             <p className="text-zinc-400 leading-relaxed">
              {t('privacySecurityText')}
            </p>
          </section>
          
           {/* Contact */}
          <section className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-4">{t('privacyContactTitle')}</h2>
            <p className="text-zinc-400 leading-relaxed">
              {t('privacyContactText')} <br/>
              <span className="text-white font-medium mt-2 block">login@infinit.com</span>
            </p>
          </section>
        </div>

        <div className="mt-24 pt-8 border-t border-white/5 text-center text-zinc-500 text-sm">
        <div className="mt-24 pt-8 border-t border-white/5 text-center text-zinc-500 text-sm">
          {t('lastUpdated')}
        </div>
        </div>
      </div>
    </div>
  );
}
