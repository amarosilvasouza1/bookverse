import { getRooms } from '@/app/actions/reading-room';
import Link from 'next/link';
import { Users, BookOpen, Clock } from 'lucide-react';

export default async function RoomsPage() {
  const { success, data: rooms } = await getRooms();

  if (!success || !rooms) {
    return (
      <div className="p-8 text-center text-red-400">
        Failed to load rooms
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Reading Rooms</h1>
          <p className="text-zinc-400">Join a live reading session with others</p>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
          <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Active Rooms</h3>
          <p className="text-zinc-400">Start a reading party from your book library!</p>
          <Link 
            href="/dashboard/books"
            className="inline-block mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Go to Library
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="group relative bg-zinc-900 border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />
              
              <div className="h-32 bg-zinc-800 relative">
                {room.book.coverImage ? (
                  <img src={room.book.coverImage} alt={room.book.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-900/20">
                    <BookOpen className="w-8 h-8 text-indigo-500/50" />
                  </div>
                )}
                <div className="absolute top-3 right-3 z-20 px-2 py-1 bg-green-500/20 backdrop-blur-md border border-green-500/20 rounded text-xs font-bold text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  LIVE
                </div>
              </div>

              <div className="relative z-20 p-5">
                <h3 className="font-bold text-lg text-white mb-1 truncate">{room.book.title}</h3>
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                  <div className="w-5 h-5 rounded-full bg-zinc-700 overflow-hidden">
                    {room.host.image ? (
                      <img src={room.host.image} alt={room.host.name || 'Host'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white text-[10px]">
                        {(room.host.name || 'H')[0]}
                      </div>
                    )}
                  </div>
                  <span>Hosted by {room.host.name || 'Unknown'}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{room.participants.length} joined</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(room.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/books/${room.bookId}/read?roomId=${room.id}`}
                    className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    Join Party
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
