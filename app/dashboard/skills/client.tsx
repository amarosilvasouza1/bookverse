'use client';

import { useState } from 'react';
import { unlockSkill } from '@/app/actions/rpg';
import { toast } from 'sonner';
import { BookOpen, Map, Crown, Lock, Check } from 'lucide-react';

interface Skill {
  id: string;
  label: string;
  description: string;
  cost: number;
  path: 'CRITIC' | 'EXPLORER' | 'PATRON';
  tier: number;
  parentId?: string;
  icon: any;
}

const SKILLS: Skill[] = [
  // CRITIC PATH
  { id: 'critic_1', label: 'Keen Eye', description: '+10% XP from reviews', cost: 1, path: 'CRITIC', tier: 1, icon: BookOpen },
  { id: 'critic_2', label: 'Detailed Analysis', description: 'Reviews longer than 100 words give double XP', cost: 3, path: 'CRITIC', tier: 2, parentId: 'critic_1', icon: BookOpen },
  
  // EXPLORER PATH
  { id: 'explorer_1', label: 'Wanderer', description: 'Discovering new genres gives bonus XP', cost: 1, path: 'EXPLORER', tier: 1, icon: Map },
  { id: 'explorer_2', label: 'Treasure Hunter', description: '5% chance to find Ink Drops when reading', cost: 3, path: 'EXPLORER', tier: 2, parentId: 'explorer_1', icon: Map },
  
  // PATRON PATH
  { id: 'patron_1', label: 'Supporter', description: 'Cosmetics cost 5% less', cost: 2, path: 'PATRON', tier: 1, icon: Crown },
  { id: 'patron_2', label: 'Benefactor', description: 'Tipping authors grants 20% XP back', cost: 4, path: 'PATRON', tier: 2, parentId: 'patron_1', icon: Crown },
];

export default function SkillTreeClient({ initialData }: { initialData: any }) {
    const [points, setPoints] = useState(initialData.points);
    const [unlocked, setUnlocked] = useState<string[]>(JSON.parse(initialData.unlockedSkills || "[]"));
    const [loading, setLoading] = useState<string | null>(null);

    const handleUnlock = async (skill: Skill) => {
        if (loading || points < skill.cost) return;
        
        // Check parent
        if (skill.parentId && !unlocked.includes(skill.parentId)) {
            toast.error("Unlock previous skill first!");
            return;
        }

        setLoading(skill.id);
        const result = await unlockSkill(skill.id, skill.cost);
        
        if (result.success) {
            toast.success("Skill Unlocked!");
            setPoints((prev: number) => prev - skill.cost);
            setUnlocked((prev) => [...prev, skill.id]);
        } else {
            toast.error(result.error);
        }
        setLoading(null);
    };

    const renderSkillNode = (skill: Skill) => {
        const isUnlocked = unlocked.includes(skill.id);
        const isParentUnlocked = !skill.parentId || unlocked.includes(skill.parentId);
        const canUnlock = !isUnlocked && isParentUnlocked && points >= skill.cost;

        return (
            <button
                key={skill.id}
                onClick={() => !isUnlocked && handleUnlock(skill)}
                disabled={isUnlocked || !canUnlock || !!loading}
                className={`relative group flex flex-col items-center p-4 rounded-xl border-2 transition-all w-48 ${
                    isUnlocked 
                    ? 'bg-green-500/10 border-green-500 text-green-400' 
                    : canUnlock
                    ? 'bg-zinc-800 border-white/20 hover:border-white hover:bg-zinc-700 text-white cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed'
                }`}
            >
                <div className={`p-3 rounded-full mb-3 ${isUnlocked ? 'bg-green-500/20' : 'bg-black/30'}`}>
                    <skill.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm mb-1">{skill.label}</h3>
                <p className="text-[10px] text-center opacity-80 mb-2">{skill.description}</p>
                
                <div className="mt-auto pt-2 border-t border-white/5 w-full text-center font-mono text-xs font-bold">
                    {isUnlocked ? (
                        <span className="flex items-center justify-center gap-1"><Check className="w-3 h-3" /> Learned</span>
                    ) : (
                        <span className="flex items-center justify-center gap-1">
                            {canUnlock ? 'Unlock' : 'Locked'} • {skill.cost} PTS
                        </span>
                    )}
                </div>
            </button>
        );
    };

    return (
        <div className="space-y-12">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                <div>
                   <h2 className="text-xl font-bold text-white">Skill Points</h2>
                   <p className="text-zinc-400 text-sm">Read books and review to earn points.</p>
                </div>
                <div className="text-4xl font-bold text-purple-400 text-shadow-glow">
                   {points} <span className="text-lg text-zinc-500">PTS</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {['CRITIC', 'EXPLORER', 'PATRON'].map(path => (
                    <div key={path} className="flex flex-col items-center gap-8 relative">
                        <h3 className="text-lg font-bold text-zinc-300 uppercase tracking-widest border-b border-white/10 pb-2 mb-4 w-full text-center">
                            {path} Path
                        </h3>
                        {/* Connecting Line (Fake) */}
                        <div className="absolute top-16 bottom-10 w-0.5 bg-zinc-800 -z-10" />
                        
                        {SKILLS.filter(s => s.path === path).sort((a,b) => a.tier - b.tier).map(renderSkillNode)}
                    </div>
                ))}
            </div>
        </div>
    );
}
