'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCommunity } from '@/app/actions/create-community';
import { Users, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CreateCommunityPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');

    const result = await createCommunity(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/dashboard/communities');
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('createCommunityTitle')}</h1>
        <p className="text-muted-foreground">{t('createCommunitySubtitle')}</p>
      </div>

      <div className="glass-card p-8 rounded-xl border border-white/10">
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">{t('communityName')}</label>
            <div className="relative">
              <Users className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                id="name"
                name="name"
                required
                minLength={3}
                placeholder={t('communityNamePlaceholder')}
                className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-200">
              {t('communityDescription')}
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors"
              placeholder={t('communityDescriptionPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="privacy" className="text-sm font-medium text-gray-200">
              {t('privacy')}
            </label>
            <select
              id="privacy"
              name="privacy"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors [&>option]:bg-zinc-900"
            >
              <option value="OPEN">{t('privacyOpen')}</option>
              <option value="CLOSED">{t('privacyClosed')}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              t('createCommunity')
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
