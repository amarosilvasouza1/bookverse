'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBattle, joinBattle } from '@/app/actions/battles';
import { toast } from 'sonner';
import { Swords, Plus, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Battle {
  id: string;
  theme: string;
  status: string;
  createdAt: Date;
  startTime: Date;
  participants: {
      user: {
          username: string;
          image: string | null;
      }
  }[];
}

export default function BattleLobbyClient({ battles, userId }: { battles: Battle[], userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const theme = prompt("Enter a theme for the battle:");
    if (!theme) return;

    setLoading(true);
    const result = await createBattle(theme);
    if (result.success) {
        toast.success("Battle created!");
        router.push(`/dashboard/battles/${result.battleId}`);
    } else {
        toast.error(result.error);
    }
    setLoading(false);
  };

  const handleJoin = async (battleId: string) => {
      setLoading(true);
      const result = await joinBattle(battleId);
      if (result.success) {
          toast.success("Joined battle!");
          router.push(`/dashboard/battles/${battleId}`);
      } else {
          toast.error(result.error as string);
      }
      setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-xl font-bold text-zinc-300">Active Arenas</h2>
         <button 
           onClick={handleCreate}
           disabled={loading}
           className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors"
         >
           <Plus className="w-4 h-4" /> Create Battle
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {battles.length === 0 && (
             <p className="col-span-full text-center text-zinc-500 py-12">No active battles. Start one yourself!</p>
         )}
         
         {battles.map((battle) => (
             <div key={battle.id} className="bg-zinc-900 border border-zinc-800 hover:border-red-500/50 transition-colors rounded-xl p-5 space-y-4">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-zinc-800 ${
                            battle.status === 'WAITING' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                            {battle.status}
                        </span>
                        <h3 className="text-lg font-bold text-white line-clamp-1" title={battle.theme}>{battle.theme}</h3>
                    </div>
                 </div>

                 <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{battle.participants.length} Writers</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(battle.createdAt), { addSuffix: true })}</span>
                    </div>
                 </div>

                 <button
                    onClick={() => handleJoin(battle.id)}
                    disabled={loading}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                 >
                    <Swords className="w-4 h-4" /> Enter Arena
                 </button>
             </div>
         ))}
      </div>
    </div>
  );
}
