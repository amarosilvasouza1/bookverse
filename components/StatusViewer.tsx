'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface StatusViewerProps {
  status: any;
  onClose: () => void;
}

export default function StatusViewer({ status, onClose }: StatusViewerProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          onClose();
          return 100;
        }
        return prev + 1; // 100 steps
      });
    }, 50); // 50ms * 100 = 5000ms (5 seconds)

    return () => clearInterval(timer);
  }, [onClose]);

  const data = status.data as any; // { bookId, bookTitle, coverImage, ... }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Content Container */}
      <div className="relative w-full max-w-md h-full md:h-[80vh] md:rounded-3xl overflow-hidden bg-zinc-900 flex flex-col shadow-2xl border border-white/10">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div 
            className="h-full bg-primary transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex items-center gap-3 z-20">
          <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden relative">
             {status.user.image ? (
                <Image src={status.user.image} alt={status.user.name} fill className="object-cover" />
             ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                  {status.user.name[0]}
                </div>
             )}
          </div>
          <div>
            <p className="text-sm font-bold text-white shadow-black drop-shadow-md">{status.user.name}</p>
            <p className="text-xs text-white/80 shadow-black drop-shadow-md">Just now</p>
          </div>
        </div>

        {/* Story Content */}
        <div className="flex-1 relative">
           {/* Background Image (Blurred) */}
           {data.coverImage && (
             <div className="absolute inset-0">
               <Image src={data.coverImage} alt="" fill className="object-cover opacity-30 blur-xl" />
               <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/90" />
             </div>
           )}

           {/* Central Content */}
           <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
              <div className="relative w-48 h-72 rounded-lg shadow-2xl shadow-black/50 mb-8 transform hover:scale-105 transition-transform duration-500">
                {data.coverImage ? (
                  <Image src={data.coverImage} alt={data.bookTitle} fill className="object-cover rounded-lg" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-white/20" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider mb-2">
                  {status.type === 'BOOK_PUBLISH' ? 'New Book' : 'New Chapter'}
                </span>
                <h2 className="text-2xl font-bold text-white">{data.bookTitle}</h2>
                {data.chapterTitle && (
                  <p className="text-lg text-white/80">{data.chapterTitle}</p>
                )}
              </div>
           </div>
        </div>

        {/* Footer / Action */}
        <div className="p-6 bg-black/40 backdrop-blur-md border-t border-white/10 z-20">
          <Link 
            href={`/dashboard/book/${data.bookId}`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            Read Now
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
