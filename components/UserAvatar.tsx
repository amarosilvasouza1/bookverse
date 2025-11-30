import Image from 'next/image';
import { cn } from '@/lib/utils';
import BlackHoleFrame from './BlackHoleFrame';
import CherryBlossomFrame from './CherryBlossomFrame';
import MagicBurstFrame from './MagicBurstFrame';
import NeonBurstFrame from './NeonBurstFrame';
import WaterDistortionFrame from './WaterDistortionFrame';
import GrokBlackHoleFrame from './GrokBlackHoleFrame';
import AutumnLeavesFrame from './AutumnLeavesFrame';
import SakuraFrame from './SakuraFrame';

interface UserAvatarProps {
  src: string | null;
  alt: string;
  size?: number;
  rarity?: string | null;
  className?: string;
}

export default function UserAvatar({ src, alt, size = 40, rarity, className }: UserAvatarProps) {
  // If no rarity/frame, just render simple avatar
  if (!rarity) {
    return (
      <div 
        className={cn("relative shrink-0 rounded-full border border-white/10 overflow-hidden", className)}
        style={{ width: size, height: size }}
      >
        {src ? (
          <Image src={src} alt={alt} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400 font-bold select-none">
            {alt.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    );
  }

  // Cherry Blossom Frame
  if (rarity === 'CHERRY_BLOSSOM') {
    return (
      <div 
        className={cn("relative shrink-0 flex items-center justify-center rounded-full", className)}
        style={{ width: size, height: size }}
      >
        {/* Frame is larger than the container/avatar */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20" style={{ width: size * 1.6, height: size * 1.6 }}>
           <CherryBlossomFrame size={size * 1.6} />
        </div>
        
        {/* Avatar Image */}
        <div 
          className="relative rounded-full overflow-hidden z-10"
          style={{ width: size, height: size }}
        >
          {src ? (
            <Image src={src} alt={alt} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400 font-bold select-none">
              {alt.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Black Hole Frame
  if (rarity === 'BLACK_HOLE') {
    return (
      <div 
        className={cn("relative shrink-0 flex items-center justify-center rounded-full", className)}
        style={{ width: size, height: size }}
      >
        <BlackHoleFrame size={size} />
        
        {/* Avatar Image (Smaller to show effect) */}
        <div 
          className="relative rounded-full overflow-hidden z-10 border border-white/10"
          style={{ width: size * 0.75, height: size * 0.75 }}
        >
          {src ? (
            <Image src={src} alt={alt} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400 font-bold select-none">
              {alt.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Magic Burst Frame
  if (rarity === 'MAGIC_BURST') {
    return (
      <div 
        className={cn("relative shrink-0 flex items-center justify-center rounded-full", className)}
        style={{ width: size, height: size }}
      >
        {/* Frame container with overflow visible */}
        <div className="absolute inset-0 z-20 overflow-visible">
           <MagicBurstFrame size={size} />
        </div>
        
        {/* Avatar Image */}
        <div 
          className="relative rounded-full overflow-hidden z-10"
          style={{ width: size, height: size }}
        >
          {src ? (
            <Image src={src} alt={alt} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400 font-bold select-none">
              {alt.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Neon Burst Frame
  if (rarity === 'NEON_BURST') {
    return (
      <div 
        className={cn("relative shrink-0 flex items-center justify-center rounded-full", className)}
        style={{ width: size, height: size }}
      >
        {/* Frame container with overflow visible */}
        <div className="absolute inset-0 z-20 overflow-visible">
           <NeonBurstFrame size={size} />
        </div>
        
        {/* Avatar Image */}
        <div 
          className="relative rounded-full overflow-hidden z-10"
          style={{ width: size, height: size }}
        >
          {src ? (
            <Image src={src} alt={alt} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400 font-bold select-none">
              {alt.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Water Distortion Frame
  if (rarity === 'WATER_DISTORTION') {
    return (
      <div 
        className={cn("relative shrink-0 flex items-center justify-center rounded-full", className)}
        style={{ width: size, height: size }}
      >
        <WaterDistortionFrame src={src || '/placeholder-avatar.png'} size={size} />
      </div>
    );
  }

  // Grok Black Hole Frame
  if (rarity === 'GROK_BLACK_HOLE') {
    return (
      <div 
        className={cn("relative shrink-0 flex items-center justify-center rounded-full", className)}
        style={{ width: size, height: size }}
      >
        {/* Grok Frame Overlay (appears on hover) */}
        <div className="absolute inset-0 z-20 overflow-hidden rounded-full">
           <GrokBlackHoleFrame size={size} />
        </div>

        {/* Avatar Image */}
        <div 
          className="relative rounded-full overflow-hidden z-10"
          style={{ width: size, height: size }}
        >
          {src ? (
            <Image src={src} alt={alt} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400 font-bold select-none">
              {alt.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Autumn Leaves Frame
  if (rarity === 'AUTUMN_LEAVES') {
    return (
      <div 
        className={cn("relative shrink-0 flex items-center justify-center rounded-full", className)}
        style={{ width: size, height: size }}
      >
        {/* Frame Overlay */}
        <div className="absolute inset-0 z-20 overflow-visible pointer-events-none">
           <div className="w-full h-full pointer-events-auto">
             <AutumnLeavesFrame size={size} />
           </div>
        </div>

        {/* Avatar Image */}
        <div 
          className="relative rounded-full overflow-hidden z-10"
          style={{ width: size, height: size }}
        >
          {src ? (
            <Image src={src} alt={alt} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400 font-bold select-none">
              {alt.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Sakura Frame
  if (rarity === 'SAKURA_BREEZE') {
    return (
      <div 
        className={cn("relative shrink-0 flex items-center justify-center rounded-full", className)}
        style={{ width: size, height: size }}
      >
        {/* Frame Overlay */}
        <div className="absolute inset-0 z-20 overflow-visible pointer-events-none">
           <div className="w-full h-full pointer-events-auto">
             <SakuraFrame size={size} />
           </div>
        </div>

        {/* Avatar Image */}
        <div 
          className="relative rounded-full overflow-hidden z-10"
          style={{ width: size, height: size }}
        >
          {src ? (
            <Image src={src} alt={alt} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400 font-bold select-none">
              {alt.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Electric Frame Structure
  const isBlue = rarity === 'ELECTRIC_BLUE';
  
  return (
    <div 
      className={cn(
        "electric-frame-wrapper shrink-0", 
        isBlue && "electric-blue",
        className
      )}
      style={{ width: size, height: size }}
    >
      <div className="electric-inner">
        <div className="electric-border-outer">
          <div className="electric-main-card"></div>
        </div>
        <div className="electric-glow-1"></div>
        <div className="electric-glow-2"></div>
        
        {/* Avatar Image Container */}
        <div className="relative w-full h-full rounded-full overflow-hidden z-30 bg-zinc-900">
          {src ? (
            <Image src={src} alt={alt} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400 font-bold select-none">
              {alt.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="electric-overlay-1"></div>
      <div className="electric-overlay-2"></div>
      <div className="electric-background-glow"></div>
    </div>
  );
}
