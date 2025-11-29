'use client';

import { useState } from 'react';
import { createPost } from '@/app/actions/create-post';
import { Send, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function CreatePostForm({ communityId }: { communityId: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('content', content);
    formData.append('communityId', communityId);

    const result = await createPost(formData);
    
    if (result.success) {
      setContent('');
      router.refresh();
    } else {
      alert(t('failedToPost'));
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 rounded-xl mb-8 border border-white/10">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('shareSomething')}
        className="w-full bg-black/20 border border-white/10 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none mb-4"
        rows={3}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium flex items-center transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          {t('postButton')}
        </button>
      </div>
    </form>
  );
}
