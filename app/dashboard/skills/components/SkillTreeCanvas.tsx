'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Skill, SKILL_TREE_CONFIG } from '@/lib/skills-config';
import SkillNode from './SkillNode';
import { toast } from 'sonner';
import { unlockSkill } from '@/app/actions/skills';

interface SkillTreeCanvasProps {
  unlockedSkills: string[];
  points: number;
}

export default function SkillTreeCanvas({ unlockedSkills: initialUnlocked, points: initialPoints }: SkillTreeCanvasProps) {
  const [unlockedSkills, setUnlockedSkills] = useState(initialUnlocked);
  const [points, setPoints] = useState(initialPoints);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Derive status for each skill
  const getStatus = (skill: Skill) => {
    if (unlockedSkills.includes(skill.id)) return 'unlocked';
    
    // Check if parent is unlocked
    const parentsUnlocked = skill.requiredSkills.every(reqId => unlockedSkills.includes(reqId));
    if (parentsUnlocked) return 'available';
    
    return 'locked';
  };

  const handleUnlock = async (skillId: string) => {
    const skill = SKILL_TREE_CONFIG.find(s => s.id === skillId);
    if (!skill) return;

    if (points < skill.cost) {
      toast.error('Not enough Skill Points!');
      return;
    }

    setUnlockingId(skillId);
    
    // Optimistic Update (optional, but safer to wait for server here for critical logic)
    // Actually, let's wait for server response to be sure
    const result = await unlockSkill(skillId);
    
    if (result.success) {
      toast.success(result.message);
      setUnlockedSkills(prev => [...prev, skillId]);
      setPoints(prev => prev - skill.cost);
      
      // Play sound
      const audio = new Audio('/level-up.mp3'); // Assuming file exists or fails silently
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } else {
      toast.error(result.error || 'Failed to unlock');
    }
    
    setUnlockingId(null);
  };

  return (
    <div className="relative w-full h-[500px] md:h-[800px] overflow-hidden bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black rounded-3xl border border-white/10 shadow-2xl">
      
      {/* Background Grid/Stars Effect */}
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
      />

      {/* Points Display Overlay */}
      <div className="absolute top-6 left-6 z-30 flex items-center gap-3">
         <div className="bg-slate-900/90 backdrop-blur border border-cyan-500/30 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/10">
            <span className="text-cyan-400 font-bold text-xl">{points}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Skill Points</span>
         </div>
      </div>

      {/* Draggable/Pannable Area */}
      <div 
        ref={containerRef}
        className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <motion.div 
            drag
            className="absolute inset-0 flex items-center justify-center"
        >
             {/* Scaled Content Container */}
             <div className="relative w-[800px] h-[800px] scale-[0.5] sm:scale-75 md:scale-100 origin-center transition-transform duration-500">
                
                {/* Lines Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {SKILL_TREE_CONFIG.map(skill => {
                    return skill.requiredSkills.map(reqId => {
                      const parent = SKILL_TREE_CONFIG.find(s => s.id === reqId);
                      if (!parent) return null;
                      
                      const isUnlocked = unlockedSkills.includes(skill.id) && unlockedSkills.includes(parent.id);
                      
                      return (
                        <motion.line 
                          key={`${parent.id}-${skill.id}`}
                          x1={parent.position.x} 
                          y1={parent.position.y}
                          x2={skill.position.x} 
                          y2={skill.position.y}
                          stroke={isUnlocked ? '#06b6d4' : '#334155'} // Cyan or Slate-700
                          strokeWidth="2"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      );
                    });
                  })}
                </svg>

                {/* Nodes Layer */}
                {SKILL_TREE_CONFIG.map(skill => (
                  <SkillNode
                    key={skill.id}
                    skill={skill}
                    status={getStatus(skill)}
                    onUnlock={handleUnlock}
                    isUnlocking={unlockingId === skill.id}
                  />
                ))}

             </div>
        </motion.div>
      </div>
    </div>
  );
}
