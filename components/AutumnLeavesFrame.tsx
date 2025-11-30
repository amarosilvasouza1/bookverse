'use client';

import { useState, useEffect } from 'react';

interface LeafData {
  id: string;
  type: number;
  delay: number;
  duration: number;
  driftDuration: number;
  xPos: number;
}

export default function AutumnLeavesFrame() {
  const [isHovering, setIsHovering] = useState(false);
  const [stormLeaves, setStormLeaves] = useState<LeafData[]>([]);

  // Standard leaves (Deterministic)
  const standardLeaves: LeafData[] = Array.from({ length: 12 }).map((_, i) => ({
    id: `std-${i}`,
    type: i % 3,
    delay: i * 0.8,
    duration: 3 + (i % 4),
    driftDuration: 2 + (i % 3),
    xPos: -20 + (i * 12),
  }));

  // Generate storm leaves on mount to avoid impure render calls
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
    const timer = setTimeout(() => setStormLeaves(storm), 0);
    return () => clearTimeout(timer);
  }, []);

  // Leaf definitions from the SVG - Scaled up (1.8x)
  const Leaf1 = () => (
    <g transform="scale(1.8)">
      <rect x="-2" y="-2" width="5" height="4" fill="#D86B28"/>
      <rect x="-3" y="-3" width="1" height="1" fill="#D86B28"/>
      <rect x="3" y="-3" width="1" height="1" fill="#D86B28"/>
      <rect x="-3" y="1" width="1" height="1" fill="#D86B28"/>
      <rect x="3" y="1" width="1" height="1" fill="#D86B28"/>
      <rect x="0" y="-4" width="1" height="1" fill="#D86B28"/>
      <rect x="0" y="2" width="1" height="2" fill="#8B4513"/>
    </g>
  );

  const Leaf2 = () => (
    <g transform="scale(1.8)">
      <rect x="-1" y="-3" width="3" height="6" fill="#A33424"/>
      <rect x="-2" y="-2" width="1" height="2" fill="#A33424"/>
      <rect x="2" y="-2" width="1" height="2" fill="#A33424"/>
      <rect x="-2" y="1" width="1" height="2" fill="#A33424"/>
      <rect x="2" y="1" width="1" height="2" fill="#A33424"/>
      <rect x="0" y="-2" width="1" height="4" fill="#D86B28"/>
    </g>
  );

  const Leaf3 = () => (
    <g transform="scale(1.8)">
      <rect x="-2" y="-1" width="4" height="3" fill="#F2B035"/>
      <rect x="-1" y="-2" width="2" height="5" fill="#F2B035"/>
      <rect x="0" y="-1" width="1" height="3" fill="#D86B28"/>
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

        {/* Standard leaves */}
        {standardLeaves.map((leaf) => {
          const LeafComponent = [Leaf1, Leaf2, Leaf3][leaf.type];
          return (
            <g key={leaf.id} transform={`translate(${leaf.xPos}, 0)`}>
               <g 
                 className="falling"
                 style={{ 
                   animationDuration: `${leaf.duration}s`,
                   animationDelay: `-${leaf.delay}s`
                 }}
               >
                  <g 
                    className="drifting"
                    style={{ animationDuration: `${leaf.driftDuration}s` }}
                  >
                     <LeafComponent />
                  </g>
               </g>
            </g>
          );
        })}

        {/* Storm leaves (fade in on hover) */}
        <g style={{ opacity: isHovering ? 1 : 0, transition: 'opacity 1s ease-in-out' }}>
          {stormLeaves.map((leaf) => {
            const LeafComponent = [Leaf1, Leaf2, Leaf3][leaf.type];
            return (
              <g key={leaf.id} transform={`translate(${leaf.xPos}, 0)`}>
                 <g 
                   className="falling"
                   style={{ 
                     animationDuration: `${leaf.duration}s`,
                     animationDelay: `-${leaf.delay}s`
                   }}
                 >
                    <g 
                      className="drifting"
                      style={{ animationDuration: `${leaf.driftDuration}s` }}
                    >
                       <LeafComponent />
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
