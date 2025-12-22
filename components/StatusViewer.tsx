'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ChevronRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface StatusData {
  bookId?: string;
  bookTitle?: string;
  coverImage?: string | null;
  chapterTitle?: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  caption?: string;
}

interface Status {
  id: string;
  type: string;
  data: StatusData;
  user: {
    name: string | null;
    image: string | null;
  };
  createdAt: string | Date;
}

interface StatusViewerProps {
  status: Status;
  onClose: () => void;
}

export default function StatusViewer({ status, onClose }: StatusViewerProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 1; // 100 steps
      });
    }, 50); // 50ms * 100 = 5000ms (5 seconds)

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      onClose();
    }
  }, [progress, onClose]);

  const data = status.data;

  // Determine if this is a Book status or a regular Media status
  const isBookStatus = status.type === 'BOOK_PUBLISH' || status.type === 'CHAPTER_PUBLISH';
  const hasMedia = data.mediaUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full md:max-w-md h-[100dvh] md:h-[90vh] md:rounded-3xl overflow-hidden bg-zinc-900 flex flex-col shadow-2xl border border-white/10"
      >
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-30">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.05 }}
          />
        </div>

        {/* Close Button & Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 z-30 bg-gradient-to-b from-black/80 to-transparent pt-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden relative shadow-lg">
                   {status.user.image ? (
                      <Image src={status.user.image} alt={status.user.name || 'User'} fill className="object-cover" />
                   ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                        {(status.user.name || '?')[0]}
                      </div>
                   )}
                </div>
                <div>
                  <p className="text-sm font-bold text-white drop-shadow-md">{status.user.name}</p>
                  <p className="text-xs text-white/80 drop-shadow-md">
                    {formatDistanceToNow(new Date(status.createdAt), { addSuffix: true })}
                  </p>
                </div>
             </div>
             <button 
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
          </div>
        </div>

        {/* Story Content */}
        <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
           
           {isBookStatus ? (
             <>
               {/* Background Image (Blurred & Darkened) */}
               {data.coverImage && (
                 <motion.div 
                   initial={{ scale: 1.1, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ duration: 0.5 }}
                   className="absolute inset-0"
                 >
                   <Image src={data.coverImage} alt="" fill className="object-cover opacity-40 blur-2xl" />
                   <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
                 </motion.div>
               )}

               {/* Central Content */}
               <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center w-full">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative w-56 h-80 rounded-xl shadow-2xl shadow-black/80 mb-8 transform hover:scale-105 transition-transform duration-500 perspective-1000"
                  >
                    {data.coverImage ? (
                      <Image src={data.coverImage} alt={data.bookTitle || 'Book Cover'} fill className="object-cover rounded-xl border border-white/10" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 rounded-xl flex items-center justify-center border border-white/10">
                        <BookOpen className="w-16 h-16 text-white/20" />
                      </div>
                    )}
                  </motion.div>
                  
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3 max-w-xs"
                  >
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                      {status.type === 'BOOK_PUBLISH' ? 'New Book' : 'New Chapter'}
                    </span>
                    <h2 className="text-3xl font-bold text-white drop-shadow-lg leading-tight">{data.bookTitle}</h2>
                    {data.chapterTitle && (
                      <p className="text-lg text-white/90 font-medium">{data.chapterTitle}</p>
                    )}
                  </motion.div>
               </div>
             </>
           ) : (
             <>
                {/* Generic Media Status (Image/Video) */}
                {hasMedia && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative w-full h-full flex items-center justify-center bg-black"
                  >
                     {data.mediaType === 'VIDEO' ? (
                        <video 
                          src={data.mediaUrl} 
                          className="w-full h-full object-contain" 
                          autoPlay 
                          // muted 
                          loop 
                          playsInline
                        />
                     ) : (
                        <Image 
                          src={data.mediaUrl || ''} 
                          alt="Story" 
                          fill 
                          className="object-contain" 
                          unoptimized
                        />
                     )}
                  </motion.div>
                )}
                
                {/* Caption Overlay */}
                {data.caption && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute bottom-10 left-0 right-0 p-6 z-20"
                  >
                    <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                      <p className="text-white text-base font-medium text-center">
                        {data.caption}
                      </p>
                    </div>
                  </motion.div>
                )}
             </>
           )}
        </div>

        {/* Footer / Action */}
        {isBookStatus && data.bookId && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-0 left-0 right-0 p-6 z-30 bg-gradient-to-t from-black via-black/80 to-transparent pt-12"
          >
            <Link 
              href={`/dashboard/books/${data.bookId}`} // Fixed path to /books/
              className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/10"
            >
              Read Now
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
