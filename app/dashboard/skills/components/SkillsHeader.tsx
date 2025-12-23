'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function SkillsHeader() {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">{t('skillTreeTitle')}</h1>
      <p className="text-slate-400">{t('skillTreeDesc')}</p>
    </div>
  );
}
