'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Cloud, Sun, Snowflake, Star, Ghost, Flower2, Cherry } from 'lucide-react';

interface ChatBubbleProps {
  variant?: 'snow' | 'halloween' | 'starry' | 'sky' | 'sakura' | 'spring' | 'default';
  isMe: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function ChatBubble({ variant = 'default', isMe, children, className }: ChatBubbleProps) {
  // Base classes for the bubble shape
  const baseClasses = cn(
    "relative max-w-[75%] p-4 text-base md:text-sm shadow-lg transition-all duration-300 hover:scale-[1.01] overflow-hidden",
    isMe 
      ? "rounded-2xl rounded-tr-sm text-white" 
      : "rounded-2xl rounded-tl-sm text-white",
    className
  );

  // Default gradients/colors if no special variant
  const defaultClasses = isMe
    ? "bg-linear-to-br from-indigo-600 to-violet-600"
    : "bg-white/10 backdrop-blur-md border border-white/10";

  // Generate deterministic random CSS values once per mount to avoid hydration mismatch and impure render
  const [randomValues, setRandomValues] = React.useState<Array<{left: number, top: number, duration: number, delay: number, opacity: number, scale: number}>>([]);

  React.useEffect(() => {
     setRandomValues(Array.from({ length: 10 }).map(() => ({
         left: Math.random() * 100,
         top: Math.random() * 100,
         duration: Math.random() * 3,
         delay: Math.random() * 2,
         opacity: 0.4 + Math.random() * 0.4,
         scale: 0.5 + Math.random()
     })));
  }, []);

  if (randomValues.length === 0) {
      return (
        <div className={cn(baseClasses, defaultClasses)}>
          {children}
        </div>
      );
  }


  switch (variant) {
    case 'snow':
      return (
        <div className={cn(baseClasses, "bg-linear-to-b from-slate-800 to-slate-900 border border-slate-700/50")}>
          {/* Snowflakes */}
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="absolute animate-fall pointer-events-none"
              style={{
                left: `${randomValues[i].left}%`,
                top: `-20px`,
                animationDuration: `${3 + randomValues[i].duration}s`,
                animationDelay: `${randomValues[i].delay}s`,
                opacity: randomValues[i].opacity
              }}
            >
               <Snowflake className="w-3 h-3 text-white/80 animate-sway" style={{ animationDuration: '3s' }} />
            </div>
          ))}
          <div className="relative z-10">{children}</div>
        </div>
      );

    case 'halloween':
      return (
        <div className={cn(baseClasses, "bg-linear-to-br from-orange-950 via-zinc-900 to-black border border-orange-500/30 shadow-orange-500/10")}>
           <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none animate-ghost-float" style={{ animationDuration: '4s' }}>
              <Ghost className="w-12 h-12 text-orange-500" />
           </div>
           {/* Spooky Fog at bottom */}
           <div className="absolute -bottom-2 -left-2 w-full h-12 bg-gradient-to-t from-orange-900/20 to-transparent pointer-events-none" />
           <div className="relative z-10">{children}</div>
        </div>
      );

    case 'starry':
      return (
        <div className={cn(baseClasses, "bg-linear-to-b from-indigo-950 via-purple-950 to-black border border-indigo-500/30")}>
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${randomValues[i].left}%`,
                top: `${randomValues[i].top}%`,
                animationDuration: `${1 + randomValues[i].duration}s`,
                animationDelay: `${randomValues[i].delay}s`
              }}
            >
              <Star className={cn("text-yellow-100/70 fill-yellow-100/70", i % 3 === 0 ? "w-2 h-2" : "w-1 h-1")} />
            </div>
          ))}
          {/* Shooting Star hint? */}
           <div className="absolute top-2 left-2 w-20 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -rotate-12 opacity-30" />
          <div className="relative z-10 text-indigo-50">{children}</div>
        </div>
      );

    case 'sky':
      return (
        <div className={cn(baseClasses, "bg-linear-to-br from-sky-400 to-blue-500 border border-sky-300/50")}>
            <div className="absolute -top-2 -right-2 animate-pulse" style={{ animationDuration: '5s' }}>
              <Sun className="w-10 h-10 text-yellow-300 fill-yellow-300 opacity-60 blur-sm" />
            </div>
            <div className="absolute top-1 right-1">
               <Sun className="w-8 h-8 text-yellow-200 fill-yellow-200 opacity-90" />
            </div>
            
            <div className="absolute bottom-1 left-2 animate-cloud-move" style={{ animationDuration: '6s' }}>
               <Cloud className="w-6 h-6 text-white/80 fill-white/80" />
            </div>
             <div className="absolute bottom-6 right-4 animate-cloud-move" style={{ animationDuration: '8s', animationDelay: '1s' }}>
               <Cloud className="w-4 h-4 text-white/50 fill-white/50" />
            </div>
            <div className="relative z-10 text-white font-medium drop-shadow-sm">{children}</div>
        </div>
      );

    case 'sakura':
       // Pixelated Sakura Theme
      return (
        <div className={cn(baseClasses, "bg-linear-to-br from-pink-900/90 to-rose-950 border border-pink-500/30 overflow-hidden font-mono")}>
            {/* Pixel Tree Construction */}
            <div className="absolute -right-1 bottom-0 opacity-40 pointer-events-none scale-150 origin-bottom-right">
                {/* Trunk */}
                <div className="w-4 h-12 bg-amber-900/60 absolute bottom-0 right-4" />
                <div className="w-6 h-2 bg-amber-900/60 absolute bottom-4 right-3" />
                {/* Leaves/Blooms Blocks */}
                <div className="w-8 h-8 bg-pink-400/40 absolute bottom-10 right-2" />
                <div className="w-6 h-6 bg-pink-500/40 absolute bottom-12 right-6" />
                <div className="w-8 h-6 bg-pink-400/40 absolute bottom-8 right-0" />
                <div className="w-2 h-2 bg-pink-300/60 absolute bottom-14 right-4" />
            </div>

           {/* Falling Pixel Petals */}
           {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="absolute animate-pixel-fall pointer-events-none"
              style={{
                left: `${randomValues[i].left}%`,
                top: `-10px`,
                animationDuration: `${3 + randomValues[i].duration}s`,
                animationDelay: `${randomValues[i].delay}s`,
              }}
            >
               {/* Square petal for pixel art look */}
               <div className="w-1.5 h-1.5 bg-pink-300/80" /> 
            </div>
          ))}
           <div className="relative z-10 text-pink-50">{children}</div>
        </div>
      );
      
    case 'spring':
        // Flashy Floral
        return (
            <div className={cn(baseClasses, "bg-linear-to-r from-emerald-500 to-teal-500 border border-emerald-400/30")}>
                 <div className="absolute -top-3 -right-3 opacity-20 rotate-12 animate-sway" style={{ transformOrigin: 'center' }}>
                     <Flower2 className="w-14 h-14 text-yellow-200 fill-yellow-200/20" />
                 </div>
                 {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bottom-0 text-emerald-100/40 animate-sway"
                        style={{
                            left: `${15 + 15 * i}%`,
                            transform: `scale(${randomValues[i].scale})`,
                            animationDelay: `${i * 0.5}s`,
                            transformOrigin: 'bottom center'
                        }}
                    >
                        <Flower2 className={cn("w-3 h-3", i % 2 === 0 ? "text-yellow-200" : "text-pink-200")} />
                    </div>
                 ))}
                 <div className="relative z-10 text-white font-semibold drop-shadow-md">{children}</div>
            </div>
        );


    default:
      return (
        <div className={cn(baseClasses, defaultClasses)}>
          {children}
        </div>
      );
  }
}
