'use client';

import { useState } from 'react';
import { Plus, Users, BookOpen, Lock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { createReadingRoom, joinRoom } from '@/app/actions/reading-room';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Room {
  id: string;
  book: { title: string; coverImage: string | null; author: { name: string | null } };
  host: { name: string | null; image: string | null };
  _count: { participants: number };
}

interface UserBook {
    id: string;
    title: string;
    coverImage: string | null;
    genre: string | null;
}

interface ReadingRoomsLobbyProps {
  initialRooms: Room[];
  userBooks: UserBook[]; 
  unlockedSkills?: string[];
}

import { useLanguage } from '@/context/LanguageContext';

export default function ReadingRoomsLobby({ initialRooms, userBooks, unlockedSkills = [] }: ReadingRoomsLobbyProps) {
  const { t } = useLanguage();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const router = useRouter();

  const hasPrivateRoomSkill = unlockedSkills.includes('book_club_host');

  const handleCreate = async () => {
    if (!selectedBook) return;
    const result = await createReadingRoom(selectedBook, isPrivate);
    if (result.success) {
      toast.success('Room created!');
      router.push(`/dashboard/reading-rooms/${result.roomId}`);
    } else {
      toast.error('Failed to create room');
    }
  };

  const handleJoin = async (roomId: string) => {
      const result = await joinRoom(roomId);
      if (result.success) {
          router.push(`/dashboard/reading-rooms/${roomId}`);
      } else {
          toast.error('Failed to join room');
      }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('readingRoomsTitle')}</h1>
          <p className="text-slate-400">{t('readingRoomsDesc')}</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="hidden md:flex bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          {t('startRoom')}
        </button>
      </div>

      {/* Active Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 md:pb-0">
        {initialRooms.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500 bg-white/5 rounded-3xl border border-white/5">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('noActiveRooms')}</p>
            </div>
        ) : (
            initialRooms.map(room => (
            <motion.div 
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10"
            >
                {/* Book Cover Backdrop */}
                <div className="absolute inset-0 z-0">
                    {room.book.coverImage && (
                        <Image src={room.book.coverImage} alt="" fill className="object-cover opacity-20 blur-md group-hover:scale-105 transition-transform duration-700" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
                </div>

                <div className="relative z-10 p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex -space-x-2">
                             {/* Participants Avatars (Mock for now, could fetch) */}
                             <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] text-white font-bold">
                                +{room._count.participants}
                             </div>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 animate-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            LIVE
                        </span>
                    </div>

                    <div className="mt-auto">
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{room.book.title}</h3>
                        <p className="text-xs text-slate-400 mb-4">Hosted by {room.host.name || 'Unknown'}</p>
                        
                        <button 
                            onClick={() => handleJoin(room.id)}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-black"
                        >
                            Join Room <Users className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
            ))
        )}
      </div>

       {/* Mobile FAB */}
       <button
        onClick={() => setIsCreating(true)}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center z-40 active:scale-90 transition-transform"
       >
        <Plus className="w-6 h-6" />
       </button>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setIsCreating(false)}>
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl m-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">{t('selectBookToRead')}</h2>
                
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2 mb-6">
                    {userBooks.map((book) => (
                        <button
                            key={book.id}
                            onClick={() => setSelectedBook(book.id)}
                            className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all ${
                                selectedBook === book.id 
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                                : 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-300'
                            }`}
                        >
                            <div className="w-10 h-14 bg-slate-800 rounded mx-auto shrink-0 relative overflow-hidden">
                                {book.coverImage && <Image src={book.coverImage} alt="" fill className="object-cover" />}
                            </div>
                            <div className="text-left flex-1">
                                <h4 className="font-bold text-sm">{book.title}</h4>
                                <span className="text-[10px] opacity-60 uppercase tracking-wider">{book.genre || 'Novel'}</span>
                            </div>

                <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                    <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isPrivate ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                {isPrivate ? <Lock className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className="font-bold text-sm text-white flex items-center gap-2">
                                    Private Room
                                    {!hasPrivateRoomSkill && <Lock className="w-3 h-3 text-zinc-500" />}
                                </div>
                                <div className="text-xs text-zinc-400">
                                    {isPrivate 
                                        ? 'Only people with the link can join.' 
                                        : 'Anyone can see and join this room.'}
                                </div>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={isPrivate}
                                onChange={(e) => {
                                    if (hasPrivateRoomSkill) {
                                        setIsPrivate(e.target.checked);
                                    } else {
                                        toast.error("Unlock 'Book Club Host' skill to create private rooms!");
                                    }
                                }}
                            />
                            <div className={`w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isPrivate ? 'peer-checked:bg-amber-500' : ''} ${!hasPrivateRoomSkill ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                        </div>
                    </label>
                </div>
                            {selectedBook === book.id && <div className="w-3 h-3 rounded-full bg-emerald-500" />}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsCreating(false)}
                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    <button 
                        onClick={handleCreate}
                        disabled={!selectedBook}
                        className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
                    >
                        {t('createRoom')}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
