'use client';

import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { createStatus } from '@/app/actions/status';
import { toast } from 'sonner';
import { compressImage } from '@/lib/compression';
import { useRouter } from 'next/navigation';

interface CreateStatusModalProps {
  onClose: () => void;
}

export default function CreateStatusModal({ onClose }: CreateStatusModalProps) {
  const router = useRouter();
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Arquivo muito grande (máx 10MB)');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!media) {
        toast.error('Por favor, selecione uma imagem ou vídeo');
        return;
    }
    
    setLoading(true);

    try {
        let fileToUpload = media;

        // Compress if image (Client-side optimization)
        if (media.type.startsWith('image/')) {
          try {
             toast.info('Optimizing image...', { duration: 2000 });
             fileToUpload = await compressImage(media);
          } catch (err) {
             console.error('Compression failed, using original', err);
          }
        }

        // Convert to Base64
        const buffer = await fileToUpload.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType = fileToUpload.type;
        const mediaUrl = `data:${mimeType};base64,${base64}`;
        const mediaType = mimeType.startsWith('image/') ? 'IMAGE' : 'VIDEO';

        const result = await createStatus('STORY', {
            mediaUrl,
            mediaType,
            caption
        });

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Story postado!');
            router.refresh();
            onClose();
        }
    } catch (error) {
        console.error(error);
        toast.error('Falha ao postar story');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="font-bold text-white text-lg">Create Story</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Preview Area */}
            <div 
                className={`relative w-full aspect-9/16 max-h-[400px] bg-black/40 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden transition-all ${!preview ? 'hover:border-primary/50 cursor-pointer' : ''}`}
                onClick={() => !preview && fileInputRef.current?.click()}
            >
                {preview ? (
                    <>
                        {media?.type.startsWith('image/') ? (
                            <Image src={preview} alt="Preview" fill className="object-contain" />
                        ) : (
                            <video src={preview} controls className="w-full h-full object-contain" />
                        )}
                        <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); removeMedia(); }}
                            className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-red-500/80 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <div className="text-center text-muted-foreground p-4">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="font-bold">Click to upload</p>
                        <p className="text-xs">Image or Video (max 10MB)</p>
                    </div>
                )}
            </div>
            
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/*,video/*" 
                className="hidden" 
            />

            {/* Caption */}
            <div>
                <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                />
            </div>

            <button
                type="submit"
                disabled={loading || !media}
                className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Posting...
                    </>
                ) : (
                    <>
                        <Send className="w-4 h-4" />
                        Share Story
                    </>
                )}
            </button>

        </form>
      </div>
    </div>
  );
}
