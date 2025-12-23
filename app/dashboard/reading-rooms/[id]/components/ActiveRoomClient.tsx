'use client';

import { BookReader, BookReaderProps } from '@/components/BookReader';
import RoomChat, { Message, Participant } from './RoomChat';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ActiveRoomClientProps {
  room: {
    book: BookReaderProps['book'];
    id: string;
    messages: Message[];
    participants: Participant[];
    currentPage: number | null;
  };
  currentUserId: string;
}

export default function ActiveRoomClient({ room, currentUserId }: ActiveRoomClientProps) {
  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
        
        {/* Left Side: Reader */}
        <div className="flex-1 relative bg-black flex flex-col">
            <div className="absolute top-4 left-4 z-50">
                <Link href="/dashboard/reading-rooms" className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur rounded-full hover:bg-white/10 text-white font-medium text-xs transition-colors border border-white/10">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Lobby
                </Link>
            </div>
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
               {/* We force minimal UI for BookReader or hope it plays nice */}
               <BookReader 
                    book={room.book}
                    canRead={true}
                    isAuthor={room.book.authorId === currentUserId}
                    isSubscriber={false} // Assume free for rooms or handled upstream
                    userId={currentUserId}
                    initialPage={room.currentPage || 1}
               />
            </div>
        </div>

        {/* Right Side: Chat & Sidebar */}
        <div className="hidden lg:block h-full border-l border-white/10 bg-[#0a0a0a]">
            <RoomChat 
                roomId={room.id}
                initialMessages={room.messages}
                currentUserId={currentUserId}
                participants={room.participants}
            />
        </div>
        
        {/* Mobile: Chat Drawer or Toggle? For MVP, just hide Chat on Mobile or create a toggle */}
        {/* Future enhancement: Add Mobile Chat overlay */}

    </div>
  );
}
