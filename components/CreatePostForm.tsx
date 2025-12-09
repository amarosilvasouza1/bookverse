'use client';

import { useState, useRef } from 'react';
import { createPost } from '@/app/actions/create-post';
import { Send, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';
import { compressImage } from '@/lib/compression';

export default function CreatePostForm({ communityId }: { communityId: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(t('fileTooLarge') || 'File too large (max 5MB)');
        return;
      }
      setMedia(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const removeMedia = () => {
    setMedia(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() && !media) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('content', content);
    formData.append('communityId', communityId);
    
    if (media) {
      if (media.type.startsWith('image/')) {
        try {
           const compressed = await compressImage(media);
           formData.append('media', compressed);
        } catch (e) {
           console.error('Compression error', e);
           formData.append('media', media);
        }
      } else {
        formData.append('media', media);
      }
    }

    const result = await createPost(formData);
    
    if (result.success) {
      setContent('');
      removeMedia();
      router.refresh();
    } else {
      alert(result.error || t('failedToPost'));
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

      {preview && (
        <div className="relative mb-4 rounded-lg overflow-hidden bg-black/40 max-h-[300px] inline-block">
          <button
            type="button"
            onClick={removeMedia}
            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
          {media?.type.startsWith('video/') ? (
            <video src={preview} controls className="max-h-[300px] w-auto rounded-lg" />
          ) : (
            <Image src={preview} alt="Preview" width={400} height={300} className="max-h-[300px] w-auto object-contain rounded-lg" unoptimized />
          )}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                className="hidden"
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-white/5"
                title={t('attachMedia') || 'Attach Image/Video'}
            >
                <ImageIcon className="w-5 h-5" />
            </button>
        </div>

        <button
          type="submit"
          disabled={loading || (!content.trim() && !media)}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium flex items-center transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          {t('postButton')}
        </button>
      </div>
    </form>
  );
}
