'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Cloud, Sun, Snowflake, Star, Ghost, Flower2 } from 'lucide-react';

interface ChatBubbleProps {
  variant?: 'snow' | 'halloween' | 'starry' | 'sky' | 'sakura' | 'spring' | 'default';
  isMe: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export default function ChatBubble({ 
  variant = 'default', 
  isMe, 
  children, 
  className,
  onClick,
  onTouchStart,
  onTouchEnd,
  onContextMenu
}: ChatBubbleProps) {
  // Base classes for the bubble shape
  const baseClasses = cn(
    "relative max-w-[75%] p-3 md:p-4 text-sm md:text-sm shadow-lg transition-all duration-300 hover:scale-[1.01] overflow-hidden",
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

  // Collect event handlers to spread on the main div
  const eventProps = {
    onClick,
    onTouchStart,
    onTouchEnd,
    onContextMenu
  };

  if (randomValues.length === 0) {
      return (
        <div className={cn(baseClasses, defaultClasses)} {...eventProps}>
          {children}
        </div>
      );
  }


  switch (variant) {
    case 'snow':
      // Frozen / Icicle Theme
      return (
        <div className={cn(baseClasses, "bg-linear-to-br from-cyan-950 via-sky-950 to-slate-950 border-2 border-cyan-300/50 shadow-[0_0_15px_rgba(34,211,238,0.3),inset_0_0_20px_rgba(255,255,255,0.1)] ring-1 ring-inset ring-white/20 overflow-hidden")} {...eventProps}>
          
          {/* Icicles hanging DOWN INSIDE the bubble from the TOP edge - with glow */}
          <div className="absolute top-0 left-3 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-[20px] border-t-cyan-300/80 drop-shadow-[0_0_4px_rgba(34,211,238,0.6)]" />
          <div className="absolute top-0 left-8 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[28px] border-t-white/90 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
          <div className="absolute top-0 left-14 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[16px] border-t-cyan-200/70 drop-shadow-[0_0_3px_rgba(34,211,238,0.5)]" />
          <div className="absolute top-0 left-20 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[22px] border-t-cyan-100/80 drop-shadow-[0_0_5px_rgba(34,211,238,0.7)]" />
          <div className="absolute top-0 right-6 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-[18px] border-t-cyan-200/75 drop-shadow-[0_0_4px_rgba(34,211,238,0.6)]" />
          <div className="absolute top-0 right-12 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[30px] border-t-white/85 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
          
          {/* Sparkle highlights on icicles */}
          <div className="absolute top-4 left-8 w-1 h-1 bg-white rounded-full animate-pulse opacity-80" />
          <div className="absolute top-6 right-12 w-1.5 h-1.5 bg-cyan-200 rounded-full animate-pulse opacity-70" style={{ animationDelay: '0.5s' }} />

          {/* Frozen texture overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none rounded-2xl" />

          {/* Dense Snowfall with varied sizes */}
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className="absolute animate-fall pointer-events-none"
              style={{
                left: `${randomValues[i]?.left || (i * 7)}%`,
                top: `-10px`,
                animationDuration: `${2 + (randomValues[i]?.duration || 1) * 0.8}s`,
                animationDelay: `${(randomValues[i]?.delay || 0) * 0.5}s`,
                opacity: 0.6 + (randomValues[i]?.opacity || 0.3)
              }}
            >
               <Snowflake 
                 className={cn(
                   "text-white animate-sway",
                   i % 3 === 0 ? "w-4 h-4" : i % 3 === 1 ? "w-2.5 h-2.5" : "w-1.5 h-1.5"
                 )} 
                 style={{ animationDuration: `${2 + (i % 4)}s` }} 
               />
            </div>
          ))}

          {/* Floating ice particles */}
          {[...Array(6)].map((_, i) => (
            <div 
              key={`ice-${i}`} 
              className="absolute w-1 h-1 bg-white/60 rounded-full animate-pulse pointer-events-none"
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + (i % 3) * 20}%`,
                animationDuration: `${2 + i * 0.5}s`,
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
          
          {/* Frost mist at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-cyan-200/20 via-white/10 to-transparent pointer-events-none" />
          
          {/* Frost Shine corners */}
          <div className="absolute top-1 right-1 w-16 h-16 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-cyan-300/10 rounded-full blur-lg pointer-events-none" />

          <div className="relative z-10 text-cyan-50 font-medium drop-shadow-sm">{children}</div>
        </div>
      );

    case 'halloween':
      return (
        <div className={cn(baseClasses, "bg-linear-to-b from-purple-950 via-zinc-950 to-orange-950 border border-orange-500/30 shadow-lg shadow-orange-900/20 overflow-hidden")} {...eventProps}>
           {/* Top Corner Spiderweb Gradient */}
           <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(255,255,255,0.05)_61%,transparent_65%,rgba(255,255,255,0.05)_66%)] opacity-30 pointer-events-none rotate-45" />

           {/* Floating Ghosts Trio */}
           <div className="absolute top-2 right-2 opacity-10 pointer-events-none animate-bounce" style={{ animationDuration: '4s' }}>
              <Ghost className="w-12 h-12 text-white" />
           </div>
           <div className="absolute top-8 right-12 opacity-5 pointer-events-none animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
              <Ghost className="w-8 h-8 text-orange-200" />
           </div>
           <div className="absolute top-[-5px] right-14 opacity-5 pointer-events-none animate-bounce" style={{ animationDuration: '6s', animationDelay: '2s' }}>
              <Ghost className="w-6 h-6 text-purple-200" />
           </div>

           {/* Rising Hellfire Embers */}
           {[...Array(8)].map((_, i) => (
             <div 
               key={i} 
               className="absolute bottom-0 animate-pulse pointer-events-none"
               style={{
                 left: `${randomValues[i]?.left || (i * 12)}%`,
                 bottom: '-10px',
                 transform: `translateY(-${(randomValues[i]?.top || 50) + 20}px)`, // Rise up
                 transition: 'transform 3s linear', // Simple rise simulation via keyframes would be better, but pulse works for flickering
                 animationDuration: `${2 + (randomValues[i]?.duration || 1)}s`,
                 animationDelay: `${randomValues[i]?.delay || 0}s`,
                 opacity: 0.6
               }}
             >
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full blur-[1px] shadow-[0_0_5px_rgba(249,115,22,0.8)]" 
                     style={{
                        animation: `rise ${3 + (randomValues[i]?.duration || 1)}s infinite linear` // Assuming global CSS has 'rise' or using generic pulse
                     }}
                />
             </div>
           ))}
           
           {/* Bottom Fog */}
           <div className="absolute bottom-0 left-0 w-full h-16 bg-linear-to-t from-orange-900/40 to-transparent pointer-events-none" />
           
           <div className="relative z-10 text-orange-50 font-medium tracking-wide drop-shadow-md">{children}</div>
        </div>
      );

    case 'starry':
      return (
        <div className={cn(baseClasses, "bg-linear-to-b from-indigo-950 via-purple-950 to-black border border-indigo-500/30")} {...eventProps}>
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
           <div className="absolute top-2 left-2 w-20 h-px bg-linear-to-r from-transparent via-white/20 to-transparent -rotate-12 opacity-30" />
          <div className="relative z-10 text-indigo-50">{children}</div>
        </div>
      );

    case 'sky':
      return (
        <div className={cn(baseClasses, "bg-linear-to-br from-sky-400 to-blue-500 border border-sky-300/50")} {...eventProps}>
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
       // True Pixel Art Sakura Theme
      return (
        <div className={cn(baseClasses, "bg-linear-to-br from-pink-900 via-rose-950 to-slate-900 border border-pink-500/30 overflow-hidden")} {...eventProps}>
            {/* Pixel Tree Layout (Bottom Right) */}
            <div className="absolute right-0 bottom-0 opacity-80 pointer-events-none scale-100 origin-bottom-right z-0">
                {/* Pixel Trunk */}
                <div className="w-4 h-16 bg-amber-900 absolute bottom-0 right-8" /> 
                <div className="w-8 h-2 bg-amber-900 absolute bottom-6 right-6" /> {/* Branch Left */}
                <div className="w-6 h-2 bg-amber-900 absolute bottom-10 right-4" /> {/* Branch Right */}
                
                {/* Pixel Foliage (Canopy) - built with squarish blocks */}
                <div className="w-16 h-8 bg-pink-400 absolute bottom-12 right-0" />
                <div className="w-12 h-12 bg-pink-500 absolute bottom-10 right-8" />
                <div className="w-8 h-8 bg-pink-400 absolute bottom-16 right-4" />
                <div className="w-4 h-4 bg-pink-300 absolute bottom-20 right-10" />
                <div className="w-8 h-4 bg-pink-500 absolute bottom-8 right-14" />
                <div className="w-2 h-2 bg-pink-300 absolute bottom-14 right-16" />
                
                {/* Floating "Pixel" Blooms */}
                <div className="w-2 h-2 bg-pink-200 absolute bottom-18 right-6 animate-pulse" />
                <div className="w-2 h-2 bg-pink-200 absolute bottom-12 right-2 animate-pulse" />
            </div>

           {/* Full Bubble Pixel Petal Rain */}
           {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="absolute animate-pixel-fall pointer-events-none"
              style={{
                left: `${randomValues[i]?.left || (i * 10)}%`, // Distribute across full width
                top: `-20px`,
                animationDuration: `${3 + (randomValues[i]?.duration || 1)}s`,
                animationDelay: `${randomValues[i]?.delay || 0}s`,
                opacity: 0.8
              }}
            >
               {/* Square Pixel Petal */}
               <div className={cn(
                   "w-1.5 h-1.5", 
                   i % 3 === 0 ? "bg-pink-300" : i % 3 === 1 ? "bg-rose-300" : "bg-white"
               )} /> 
            </div>
          ))}
           <div className="relative z-10 text-pink-50 font-medium tracking-wide drop-shadow-sm">{children}</div>
        </div>
      );
      
    case 'spring':
        // Vibrant Garden Spring Theme
        return (
            <div className={cn(baseClasses, "bg-linear-to-br from-emerald-600 via-green-500 to-teal-500 border-2 border-emerald-300/50 shadow-[0_0_15px_rgba(52,211,153,0.3)] overflow-hidden")} {...eventProps}>
                 
                 {/* Sun Glow in corner */}
                 <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-300/30 rounded-full blur-xl pointer-events-none" />
                 <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-200/50 rounded-full blur-md pointer-events-none animate-pulse" style={{ animationDuration: '3s' }} />
                 
                 {/* Large Decorative Flowers */}
                 <div className="absolute top-1 right-3 opacity-60 rotate-12 animate-sway" style={{ transformOrigin: 'center', animationDuration: '4s' }}>
                     <Flower2 className="w-10 h-10 text-yellow-300 fill-yellow-300/30 drop-shadow-lg" />
                 </div>
                 <div className="absolute top-2 left-2 opacity-50 -rotate-12 animate-sway" style={{ transformOrigin: 'center', animationDuration: '5s', animationDelay: '1s' }}>
                     <Flower2 className="w-8 h-8 text-pink-300 fill-pink-300/30" />
                 </div>
                 
                 {/* Bottom Garden - Row of Flowers */}
                 {[...Array(7)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bottom-1 animate-sway pointer-events-none"
                        style={{
                            left: `${8 + 13 * i}%`,
                            transform: `scale(${0.7 + (randomValues[i]?.scale || 0.3)})`,
                            animationDelay: `${i * 0.3}s`,
                            animationDuration: `${2 + (i % 3)}s`,
                            transformOrigin: 'bottom center'
                        }}
                    >
                        <Flower2 className={cn(
                            "drop-shadow-sm",
                            i % 3 === 0 ? "w-4 h-4 text-yellow-200 fill-yellow-200/40" : 
                            i % 3 === 1 ? "w-3 h-3 text-pink-200 fill-pink-200/40" : 
                            "w-3.5 h-3.5 text-white fill-white/30"
                        )} />
                    </div>
                 ))}

                 {/* Floating Petals */}
                 {[...Array(8)].map((_, i) => (
                    <div 
                      key={`petal-${i}`} 
                      className="absolute animate-fall pointer-events-none"
                      style={{
                        left: `${randomValues[i]?.left || (i * 12)}%`,
                        top: `-10px`,
                        animationDuration: `${3 + (randomValues[i]?.duration || 1)}s`,
                        animationDelay: `${(randomValues[i]?.delay || 0)}s`,
                        opacity: 0.7
                      }}
                    >
                       <div className={cn(
                           "w-2 h-2 rounded-full",
                           i % 4 === 0 ? "bg-pink-300" : 
                           i % 4 === 1 ? "bg-yellow-200" : 
                           i % 4 === 2 ? "bg-white" : "bg-emerald-200"
                       )} 
                       style={{ borderRadius: '50% 0 50% 50%', transform: `rotate(${i * 45}deg)` }}
                       />
                    </div>
                 ))}

                 {/* Butterfly-like floating elements */}
                 <div className="absolute top-6 left-1/3 w-2 h-2 pointer-events-none">
                     <div className="w-1.5 h-1 bg-yellow-200/70 rounded-full absolute animate-bounce" style={{ animationDuration: '1.5s' }} />
                     <div className="w-1.5 h-1 bg-pink-200/70 rounded-full absolute ml-1 animate-bounce" style={{ animationDuration: '1.5s', animationDelay: '0.1s' }} />
                 </div>
                 <div className="absolute top-10 right-1/4 w-2 h-2 pointer-events-none">
                     <div className="w-1 h-0.5 bg-white/60 rounded-full absolute animate-bounce" style={{ animationDuration: '2s' }} />
                     <div className="w-1 h-0.5 bg-emerald-200/60 rounded-full absolute ml-0.5 animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.15s' }} />
                 </div>

                 {/* Grass effect at bottom */}
                 <div className="absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-emerald-700/40 to-transparent pointer-events-none" />
                 
                 <div className="relative z-10 text-white font-semibold drop-shadow-md">{children}</div>
            </div>
        );


    default:
      return (
        <div className={cn(baseClasses, defaultClasses)} {...eventProps}>
          {children}
        </div>
      );
  }
}
