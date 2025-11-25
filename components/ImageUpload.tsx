'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

export default function ImageUpload({ value, onChange, label, aspectRatio = 'square' }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) { // 25MB limit
      alert('File is too large. Maximum size is 25MB.');
      return;
    }

    // Warn for large files
    if (file.size > 5 * 1024 * 1024) { // 5MB
      const proceed = confirm(
        `This image is ${(file.size / 1024 / 1024).toFixed(1)}MB.\n\n` +
        'Large images may take a long time to upload (30-60 seconds).\n\n' +
        'Consider compressing it first for better performance.\n\n' +
        'Continue anyway?'
      );
      if (!proceed) return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
      setLoading(false);
    };
    reader.onerror = () => {
      alert('Failed to read file');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

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
      <label className="block text-sm font-medium text-muted-foreground">{label}</label>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative w-full ${aspectClass} rounded-lg border-2 border-dashed border-white/10 
          hover:border-primary/50 hover:bg-white/5 transition-all cursor-pointer group overflow-hidden
          flex flex-col items-center justify-center
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {loading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs">Processing...</span>
          </div>
        ) : value ? (
          <>
            <img src={value} alt="Upload" className="w-full h-full object-cover" />
            <button 
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-full text-white transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors p-4 text-center">
            <Upload className="w-8 h-8" />
            <span className="text-sm font-medium">Click to upload image</span>
            <span className="text-xs text-white/40">Max 25MB</span>
          </div>
        )}
      </div>
    </div>
  );
}
