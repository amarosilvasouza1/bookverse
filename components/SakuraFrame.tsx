'use client';

import { useState, useEffect } from 'react';

interface PetalData {
  id: string;
  type: number;
  delay: number;
  duration: number;
  driftDuration: number;
  xPos: number;
}

export default function SakuraFrame() {
  const [isHovering, setIsHovering] = useState(false);
  const [stormPetals, setStormPetals] = useState<PetalData[]>([]);

  // Standard petals (Deterministic)
  const standardPetals: PetalData[] = Array.from({ length: 12 }).map((_, i) => ({
    id: `std-${i}`,
    type: i % 3,
    delay: i * 0.8,
    duration: 3 + (i % 4),
    driftDuration: 2 + (i % 3),
    xPos: -20 + (i * 12),
  }));

  // Generate storm petals on mount
  useEffect(() => {
    const storm = Array.from({ length: 25 }).map((_, i) => ({
      id: `storm-${i}`,
      type: i % 3,
      delay: Math.random() * 2,
      duration: 1.5 + Math.random() * 2,
      driftDuration: 1 + Math.random(),
      xPos: Math.random() * 120 - 10,
    }));
    
    // Use setTimeout to avoid synchronous setState warning
    const timer = setTimeout(() => setStormPetals(storm), 0);
    return () => clearTimeout(timer);
  }, []);

  // Sakura definitions from the SVG - Scaled up (1.8x)
  const Sakura1 = () => (
    <g transform="scale(1.8)">
      <rect x="-2" y="-1" width="5" height="3" fill="#FF9EAE" />
      <rect x="-1" y="-2" width="3" height="1" fill="#FF9EAE" />
      <rect x="-1" y="2" width="3" height="1" fill="#FF9EAE" />
      <rect x="0" y="1" width="1" height="2" fill="#E06C8A" />
      <rect x="-1" y="0" width="1" height="1" fill="#E06C8A" />
    </g>
  );

  const Sakura2 = () => (
    <g transform="scale(1.8)">
      <rect x="-1" y="-3" width="3" height="5" fill="#FFC1CC" />
      <rect x="-2" y="-1" width="1" height="3" fill="#FFC1CC" />
      <rect x="2" y="-1" width="1" height="3" fill="#FFC1CC" />
      <rect x="0" y="2" width="1" height="1" fill="#FFC1CC" />
      <rect x="0" y="-1" width="1" height="2" fill="#FF9EAE" />
    </g>
  );

  const Sakura3 = () => (
    <g transform="scale(1.8)">
      <rect x="-2" y="-1" width="4" height="3" fill="#E06C8A" />
      <rect x="-1" y="-2" width="2" height="1" fill="#E06C8A" />
      <rect x="-1" y="2" width="2" height="1" fill="#E06C8A" />
      <rect x="-1" y="-1" width="1" height="1" fill="#FFC1CC" />
      <rect x="0" y="0" width="1" height="1" fill="#FFC1CC" />
    </g>
  );

  return (
    <div 
      className="absolute inset-0 pointer-events-auto"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <svg 
        viewBox="0 0 100 100" 
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          <style>
            {`
              @keyframes fall {
                0% { transform: translateY(-30px) rotate(0deg); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(130px) rotate(360deg); opacity: 0; }
              }
              
              @keyframes drift {
                0% { transform: translateX(0); }
                50% { transform: translateX(20px); }
                100% { transform: translateX(0); }
              }

              .falling {
                animation: fall linear infinite;
              }
              
              .drifting {
                animation: drift ease-in-out infinite;
              }
            `}
          </style>
        </defs>

        {/* Standard sakura */}
        {standardPetals.map((petal) => {
          const SakuraComponent = [Sakura1, Sakura2, Sakura3][petal.type];
          return (
            <g key={petal.id} transform={`translate(${petal.xPos}, 0)`}>
               <g 
                 className="falling"
                 style={{ 
                   animationDuration: `${petal.duration}s`,
                   animationDelay: `-${petal.delay}s`
                 }}
               >
                  <g 
                    className="drifting"
                    style={{ animationDuration: `${petal.driftDuration}s` }}
                  >
                     <SakuraComponent />
                  </g>
               </g>
            </g>
          );
        })}

        {/* Storm sakura (fade in on hover) */}
        <g style={{ opacity: isHovering ? 1 : 0, transition: 'opacity 1s ease-in-out' }}>
          {stormPetals.map((petal) => {
            const SakuraComponent = [Sakura1, Sakura2, Sakura3][petal.type];
            return (
              <g key={petal.id} transform={`translate(${petal.xPos}, 0)`}>
                 <g 
                   className="falling"
                   style={{ 
                     animationDuration: `${petal.duration}s`,
                     animationDelay: `-${petal.delay}s`
                 }}
               >
                  <g 
                    className="drifting"
                    style={{ animationDuration: `${petal.driftDuration}s` }}
                  >
                     <SakuraComponent />
                  </g>
               </g>
            </g>
          );
        })}
        </g>
      </svg>
    </div>
  );
}
