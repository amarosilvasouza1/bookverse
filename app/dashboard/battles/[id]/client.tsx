'use client';

import { useState, useEffect, useRef } from 'react';
import { getBattleState, startBattle, submitBattleContent, voteForParticipant } from '@/app/actions/battles';
import { toast } from 'sonner';
import { User, Swords, CheckCircle, Trophy } from 'lucide-react';

interface BattleUser {
    id: string;
    username: string;
    image: string | null;
}

interface Participant {
    id: string;
    userId: string;
    content: string | null;
    user: BattleUser;
}

interface Vote {
    id: string;
    voterId: string;
    participantId: string;
}

interface BattleState {
    id: string;
    theme: string;
    status: string;
    startTime: Date;
    endTime: Date | null;
    participants: Participant[];
    votes: Vote[];
}

export default function BattleRoomClient({ initialBattle, userId }: { initialBattle: BattleState, userId: string }) {
    const [battle, setBattle] = useState<BattleState>(initialBattle);
    const [content, setContent] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const pollingRef = useRef<NodeJS.Timeout>(null);
    
    // Find my participant ID
    const myParticipant = battle.participants.find(p => p.userId === userId);

    // Polling Logic
    useEffect(() => {
        const fetchState = async () => {
            const result = await getBattleState(battle.id);
            if (result.success && result.data) {
                setBattle(result.data);
            }
        };

        pollingRef.current = setInterval(fetchState, 3000); // Poll every 3s
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [battle.id]);

    // Timer Logic
    useEffect(() => {
        if (battle.status === 'IN_PROGRESS' && battle.endTime) {
            const end = new Date(battle.endTime).getTime();
            const interval = setInterval(() => {
                const now = Date.now();
                const diff = Math.max(0, Math.floor((end - now) / 1000));
                setTimeLeft(diff);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [battle.status, battle.endTime]);

    // Auto-save content (Debounced ideally, but simple interval here)
    useEffect(() => {
        if (battle.status !== 'IN_PROGRESS' || !content) return;
        
        const saveTimer = setTimeout(() => {
            submitBattleContent(battle.id, content);
        }, 2000); // Auto-save 2s after typing stops
        
        return () => clearTimeout(saveTimer);
    }, [content, battle.id, battle.status]);

    const handleStart = async () => {
        const result = await startBattle(battle.id);
        if (!result.success) toast.error(result.error);
    };

    const handleVote = async (participantId: string) => {
        const result = await voteForParticipant(battle.id, participantId);
        if (result.success) toast.success("Voted!");
        else toast.error(result.error);
    };

    // --- RENDERERS ---

    if (battle.status === 'WAITING') {
        return (
            <div className="max-w-2xl mx-auto space-y-8 text-center py-12">
                <div className="space-y-2">
                   <h1 className="text-4xl font-bold bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">{battle.theme}</h1>
                   <p className="text-zinc-400">Waiting for gladiators...</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {battle.participants.map(p => (
                        <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                <User className="w-5 h-5 text-zinc-500" />
                            </div>
                            <span className="font-bold text-white">{p.user.username}</span>
                        </div>
                    ))}
                    {/* Empty slots placeholders could go here */}
                </div>

                <div className="pt-8">
                     <button
                        onClick={handleStart}
                        className="px-8 py-4 bg-white text-black font-bold rounded-full text-xl hover:scale-105 transition-transform flex items-center gap-3 mx-auto"
                     >
                        <Swords className="w-6 h-6" /> Start Battle
                     </button>
                </div>
            </div>
        );
    }

    if (battle.status === 'IN_PROGRESS') {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        return (
            <div className="max-w-4xl mx-auto space-y-6 h-[calc(100vh-120px)] flex flex-col">
                <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                    <div>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Theme</span>
                        <h2 className="text-xl font-bold text-white">{battle.theme}</h2>
                    </div>
                    <div className="text-right">
                         <div className={`text-3xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {minutes}:{seconds.toString().padStart(2, '0')}
                         </div>
                    </div>
                </div>

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing..."
                    disabled={!myParticipant} // Spectators cannot write
                    className="flex-1 w-full bg-black/50 border border-zinc-800 rounded-xl p-6 text-lg text-zinc-200 resize-none focus:outline-none focus:border-red-500 transition-colors font-serif leading-relaxed"
                    spellCheck={false}
                />
            </div>
        );
    }

    if (battle.status === 'VOTING' || battle.status === 'FINISHED') {
        // Find winner if finished? 
        // Simple logic: most votes
        
        return (
            <div className="max-w-4xl mx-auto space-y-8 py-8">
                 <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-white mb-2">{battle.theme}</h1>
                    <p className="text-zinc-400">
                        {battle.status === 'FINISHED' ? 'Battle Concluded' : 'Vote for the best story!'}
                    </p>
                 </div>

                 <div className="grid gap-6">
                    {battle.participants.map(p => {
                        const voteCount = battle.votes.filter(v => v.participantId === p.id).length;
                        const hasVoted = battle.votes.some(v => v.voterId === userId);
                        const isMe = p.userId === userId;

                        return (
                            <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                                <div className="p-4 bg-black/20 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white">{p.user.username}</span>
                                        {battle.status === 'FINISHED' && (
                                             <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Trophy className="w-3 h-3" /> {voteCount} Votes
                                             </span>
                                        )}
                                    </div>
                                    {!isMe && battle.status === 'VOTING' && (
                                        <button
                                            onClick={() => handleVote(p.id)}
                                            disabled={hasVoted}
                                            className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-colors ${
                                                hasVoted ? 'bg-zinc-800 text-zinc-500' : 'bg-red-600 hover:bg-red-700 text-white'
                                            }`}
                                        >
                                            <CheckCircle className="w-3 h-3" /> Vote
                                        </button>
                                    )}
                                </div>
                                <div className="p-6 text-zinc-300 font-serif whitespace-pre-wrap leading-relaxed">
                                    {p.content || "No content written."}
                                </div>
                            </div>
                        );
                    })}
                 </div>
            </div>
        );
    }

    return <div>Loading arena...</div>;
}
