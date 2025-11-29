import Image from 'next/image';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src: string | null;
  alt: string;
  size?: number;
  rarity?: string | null;
  className?: string;
}

export default function UserAvatar({ src, alt, size = 40, rarity, className }: UserAvatarProps) {
  const getFrameClass = (rarity: string) => {
    // Frames disabled by user request
    return '';
    /*
    switch (rarity) {
      case 'COMMON': return 'frame-common';
      case 'RARE': return 'frame-rare';
      case 'EPIC': return 'frame-epic';
      case 'LEGENDARY': return 'frame-legendary';
      case 'COSMIC': return 'frame-cosmic';
      case 'DRAGON': return 'frame-dragon';
      default: return '';
    }
    */
  };

  const frameClass = rarity ? getFrameClass(rarity) : '';
  const hasFrame = !!frameClass;

  // Calculate padding/border size based on avatar size to keep proportions
  // This is a rough heuristic; might need tweaking for very small/large sizes
  const borderSize = Math.max(2, Math.round(size / 20)); 

  return (
    <div 
      className={cn(
        "relative shrink-0 rounded-full",
        hasFrame ? frameClass : "border border-white/10",
        className
      )}
      style={{ width: size, height: size }}
    >
      <div className="relative w-full h-full rounded-full overflow-hidden z-0">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400 font-bold select-none">
            {alt.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
