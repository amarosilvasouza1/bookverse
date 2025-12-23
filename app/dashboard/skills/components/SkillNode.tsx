'use client';

import { motion } from 'framer-motion';
import { Lock, Check } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Skill } from '@/lib/skills-config';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SkillNodeProps {
  skill: Skill;
  status: 'locked' | 'available' | 'unlocked';
  onUnlock: (id: string) => void;
  isUnlocking: boolean;
}

export default function SkillNode({ skill, status, onUnlock, isUnlocking }: SkillNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Dynamic Icon
  const IconComponent = (Icons as unknown as Record<string, React.ElementType>)[skill.icon] || Icons.HelpCircle;

  return (
    <div 
      className="absolute flex flex-col items-center"
      style={{ left: skill.position.x, top: skill.position.y, transform: 'translate(-50%, -50%)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Node Circle */}
      <motion.button
        onClick={() => status === 'available' && onUnlock(skill.id)}
        disabled={status !== 'available' || isUnlocking}
        whileHover={status === 'available' ? { scale: 1.1 } : {}}
        whileTap={status === 'available' ? { scale: 0.95 } : {}}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10 shadow-xl",
          status === 'unlocked' && "bg-cyan-500 border-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]",
          status === 'available' && "bg-slate-800 border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] cursor-pointer",
          status === 'locked' && "bg-slate-900/80 border-slate-700 text-slate-600 cursor-not-allowed opacity-60"
        )}
      >
        {status === 'unlocked' ? (
          <IconComponent className="w-8 h-8" />
        ) : status === 'locked' ? (
          <Lock className="w-6 h-6" />
        ) : (
          <IconComponent className="w-8 h-8 opacity-80" />
        )}

        {/* Loading Spinner */}
        {isUnlocking && (
          <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin" />
        )}
      </motion.button>

      {/* Hover Info Card (Tooltip) */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ 
          opacity: isHovered ? 1 : 0, 
          y: isHovered ? 15 : 10, 
          scale: isHovered ? 1 : 0.9,
          pointerEvents: isHovered ? 'auto' : 'none'
        }}
        className="absolute top-full w-48 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl z-20 shadow-2xl"
      >
        <h3 className="font-bold text-slate-100 text-sm mb-1">{skill.label}</h3>
        <p className="text-xs text-slate-400 leading-tight mb-2">{skill.description}</p>
        
        <div className="flex items-center justify-between text-xs font-mono">
           <span className={cn(
             "font-bold",
             status === 'unlocked' ? "text-emerald-400" : "text-cyan-400"
           )}>
             {status === 'unlocked' ? 'UNLOCKED' : `${skill.cost} PTS`}
           </span>
           {status === 'unlocked' && <Check className="w-3 h-3 text-emerald-400" />}
        </div>
      </motion.div>
      
      {/* Connector Node for visual layout debugging (optional) */}
      {/* <div className="absolute w-1 h-1 bg-red-500 z-50 rounded-full" /> */}
    </div>
  );
}
