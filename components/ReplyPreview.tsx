'use client';

import React from 'react';
import { X, Reply } from 'lucide-react';

interface ReplyPreviewProps {
  replyingTo: {
    id: string;
    content: string;
    username: string;
  } | null;
  onCancel: () => void;
}

export default function ReplyPreview({ replyingTo, onCancel }: ReplyPreviewProps) {
  if (!replyingTo) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-t border-white/5 backdrop-blur-md">
      <div className="flex items-center gap-3 overflow-hidden">
        <Reply className="w-4 h-4 text-indigo-400 shrink-0" />
        <div className="flex flex-col text-sm truncate">
          <span className="text-indigo-400 font-medium text-xs">Replying to {replyingTo.username}</span>
          <span className="text-zinc-400 truncate max-w-[200px] md:max-w-md">
            {replyingTo.content}
          </span>
        </div>
      </div>
      <button 
        onClick={onCancel}
        className="p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-4 h-4 text-zinc-400" />
      </button>
    </div>
  );
}
