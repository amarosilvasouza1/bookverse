'use client';

import Link from 'next/link';
import { ArrowLeft, Scale, FileCheck, AlertTriangle, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 font-sans">
       <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-pink-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-purple-600/05 rounded-full blur-[150px] mix-blend-screen" />
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
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 text-pink-400">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            {t('termsTitle')}
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
            {t('termsIntro')}
          </p>
        </div>

        <div className="space-y-12">
          {/* Acceptance */}
          <section className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <FileCheck className="w-6 h-6 text-zinc-500" />
              {t('termsAcceptanceTitle')}
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              {t('termsAcceptanceText')}
            </p>
          </section>

          {/* User Responsibilities */}
          <section className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 backdrop-blur-md">
             <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-zinc-500" />
              {t('termsResponsibilitiesTitle')}
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              {t('termsResponsibilitiesText')}
            </p>
            <ul className="space-y-3 text-zinc-400 list-disc pl-5">
              <li>{t('termsResponsibilitiesList1')}</li>
              <li>{t('termsResponsibilitiesList2')}</li>
              <li>{t('termsResponsibilitiesList3')}</li>
              <li>{t('termsResponsibilitiesList4')}</li>
            </ul>
          </section>

          {/* Intellectual Property */}
           <section className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-4">{t('termsIpTitle')}</h2>
             <p className="text-zinc-400 leading-relaxed">
              {t('termsIpText')}
            </p>
          </section>

           {/* Termination */}
           <section className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-4">{t('termsTerminationTitle')}</h2>
             <p className="text-zinc-400 leading-relaxed">
              {t('termsTerminationText')}
            </p>
          </section>
          
           {/* Contact */}
          <section className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-zinc-500" />
                {t('termsContactTitle')}
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              {t('termsContactText')} <br/>
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
