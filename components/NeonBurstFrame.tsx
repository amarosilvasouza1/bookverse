'use client';

import { useEffect, useRef } from 'react';
interface NeonBurstFrameProps {
  size: number;
}

interface MojsTimeline {
  play: () => void;
  stop: () => void;
  add: (...args: unknown[]) => this;
}

export default function NeonBurstFrame({ size }: NeonBurstFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let timeline: MojsTimeline;

    const initAnimation = async () => {
      // @ts-expect-error mo-js does not have types
      const mojs = (await import('mo-js')).default;

      // Scale factors
      // Original radii were 150, 200, 100. Let's assume that was for a larger screen.
      // For a 100px avatar, we probably want radii around 60-80px to be visible but not huge.
      // Let's scale based on size.
      const scale = size / 200; // Scaling down significantly as original values are large

      const burst1 = new mojs.Burst({
        parent: containerRef.current,
        radius: { 0: 150 * scale * 2 }, // Increased multiplier to make it visible outside
        count: 30,
        opacity: {1: 0},
        children: {
          duration: 2500,
          fill: {'cyan': 'yellow'},
          radius: { [10 * scale]: 0 } // Add radius scaling for particles
        }
      });

      const burst2 = new mojs.Burst({
        parent: containerRef.current,
        radius: { 0: 200 * scale * 2 },
        count: 30,
        opacity: {1: 0},
        children: {
          duration: 2000,
          fill: {'magenta': 'yellow'},
          radius: { [10 * scale]: 0 }
        }
      });

      const burst3 = new mojs.Burst({
        parent: containerRef.current,
        radius: { 0: 100 * scale * 2 },
        count: 15,
        opacity: {1: 0},
        children: {
          rotation: {180: 0},
          shape: "rect",
          stroke: 3,
          duration: 3500,
          fill: {'pink': 'blue'},
          radius: { [10 * scale]: 0 }
        }
      });

      timeline = new mojs.Timeline({
        repeat: 999
      })
      .add(burst1, burst2, burst3)
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
