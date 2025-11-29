'use client';

import { useEffect, useRef } from 'react';


interface MagicBurstFrameProps {
  size: number;
}

interface MojsTimeline {
  play: () => void;
  stop: () => void;
  add: (...args: unknown[]) => this;
}

export default function MagicBurstFrame({ size }: MagicBurstFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let timeline: MojsTimeline;

    const initAnimation = async () => {
      // @ts-expect-error mo-js does not have types
      const mojs = (await import('mo-js')).default;

      // Scale factors
      const scale = size / 100; // Base scale on 100px reference
      const burstRadius = size * 1.5; // Explode outwards
      
      // Burst 1: Crosses
      const burst = new mojs.Burst({
        parent: containerRef.current,
        radius: { 0: burstRadius },
        count: 20,
        children: {
          shape: 'cross',
          stroke: 'purple',
          strokeWidth: { [10 * scale]: 2 * scale },
          angle: { 360: 0 },
          radius: { [30 * scale]: 5 * scale },
          duration: 1000
        }
      });

      // Burst 2: Zigzags
      const burst2 = new mojs.Burst({
        parent: containerRef.current,
        radius: { 0: burstRadius },
        count: 10,
        children: {
          shape: 'zigzag',
          points: 10,
          stroke: 'magenta',
          strokeWidth: { [6 * scale]: 2 * scale },
          angle: { '-360': 360 },
          radius: { [30 * scale]: 5 * scale },
          duration: 2000
        }
      });

      // Timeline
      timeline = new mojs.Timeline({
        repeat: 999 // Infinite repeat for the frame effect
      })
      .add(burst, burst2)
      .play();
    };

    initAnimation();

    return () => {
      if (timeline) timeline.stop();
    };
  }, [size]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ width: size, height: size }}
    />
  );
}
