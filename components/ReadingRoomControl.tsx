'use client';

import { useEffect, useState } from 'react';
import { Users, LogOut, BookOpen } from 'lucide-react';
import { leaveRoom } from '@/app/actions/reading-room';
import { useRouter } from 'next/navigation';

interface ReadingRoomControlProps {
  roomId: string;
  isHost: boolean;
  participantCount: number;
  hostName: string;
}

export default function ReadingRoomControl({ roomId, isHost, participantCount, hostName }: ReadingRoomControlProps) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave the reading room?')) return;
    
    setIsLeaving(true);
    try {
      await leaveRoom(roomId);
      router.push('/dashboard/books');
      router.refresh();
    } catch (error) {
      console.error('Failed to leave room:', error);
      setIsLeaving(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-4 w-64">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Live Reading</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono text-zinc-400">
            <Users className="w-3 h-3" />
            <span>{participantCount}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-400">Hosted by</p>
              <p className="text-sm font-medium text-white truncate">{hostName}</p>
            </div>
          </div>

          <button
            onClick={handleLeave}
            disabled={isLeaving}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <LogOut className="w-3 h-3" />
            {isLeaving ? 'Leaving...' : 'Leave Room'}
          </button>
        </div>
      </div>
    </div>
  );
}
