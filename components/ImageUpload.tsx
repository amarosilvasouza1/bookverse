'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { compressImage } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
  disabled?: boolean;
}

export default function ImageUpload({ value, onChange, label, aspectRatio = 'square', disabled }: ImageUploadProps) {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) { // 25MB limit
      alert(t('fileTooLarge'));
      return;
    }

    // Warn for large files
    if (file.size > 5 * 1024 * 1024) { // 5MB
      const proceed = confirm(
        t('largeImageWarning', {
          size: (file.size / 1024 / 1024).toFixed(1)
        })
      );
      if (!proceed) return;
    }

    setIsUploading(true);
    try {
      // Skip compression for GIFs to preserve animation
      if (file.type === 'image/gif') {
        const reader = new FileReader();
        reader.onload = (e) => {
          onChange(e.target?.result as string);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
        return;
      }

      const compressed = await compressImage(file);
      onChange(compressed);
    } catch (error) {
      console.error(t('compressionError'), error);
      alert(t('failedToProcessImage'));
    } finally {
      if (file.type !== 'image/gif') {
        setIsUploading(false);
      }
    }
  }, [onChange, t]);

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[2/3]',
  }[aspectRatio];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          {label || t('uploadImage')}
        </label>
        {value && (
          <button
            onClick={clearImage}
            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
            disabled={disabled}
          >
            <X className="w-3 h-3" />
            {t('removeImage')}
          </button>
        )}
      </div>
      
      <div 
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative w-full ${aspectClass} rounded-lg border-2 border-dashed border-white/10 
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-primary/50 hover:bg-white/5 cursor-pointer group'}
          transition-all flex flex-col items-center justify-center overflow-hidden
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={disabled}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs">{t('processingImage')}</span>
          </div>
        ) : value ? (
          <>
            <Image src={value} alt="Upload" fill className="object-cover" />
            <button 
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-full text-white transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors p-4 text-center">
            <Upload className="w-8 h-8" />
            <span className="text-sm font-medium">{t('clickToUploadImage')}</span>
            <span className="text-xs text-white/40">{t('maxFileSize')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
