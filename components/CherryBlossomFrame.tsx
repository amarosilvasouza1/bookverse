'use client';

import { useEffect, useRef } from 'react';

interface CherryBlossomFrameProps {
  size: number;
}

export default function CherryBlossomFrame({ size }: CherryBlossomFrameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration scaled to size
    const w = size;
    const h = size;
    // Increase initial radius to keep center clear (avatar is there)
    // Adjusted to be closer to the avatar edge (w / 3.2 is approx avatar radius)
    const minOrbit = w / 3.2; 
    const maxOrbit = w / 2.2;
    const scarea = Math.min(w/4, h/4); // Scare area
    
    // Reduce particle count for smaller size (original 300 for fullscreen)
    const noStarlings = 50; 
    const petalSize = Math.max(2, size / 40); // Scale petal size
    const maxSpeed = 1.5;
    const colors = ["#F5D1CE", "#F2A2C0", "#F2D4C9", "#F2BBB6"];

    let mousePos: { x: number, y: number } | null = null;
    let animationFrameId: number;

    canvas.width = w;
    canvas.height = h;

    // High DPI scaling
    const dpi = window.devicePixelRatio || 1;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.ceil(w * dpi);
    canvas.height = Math.ceil(h * dpi);
    ctx.scale(dpi, dpi);

    function randomIntFromRange(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    interface Starling {
      id: number;
      x: number;
      y: number;
      direction: number;
      baseSpeed: number;
      speed: number;
      alpha: number;
      color: string;
      scareDist: number;
      fearFactor: number;
      goalFactor: number;
      normalFactor: number;
      rotationSpeed: number;
      rotationDirection: number;
      startPetalRadians: number;
      orbitRadius: number;
      orbitAngle: number;
    }

    function createStarling(id: number): Starling {
        // Initialize positions in an outer ring
        const orbitAngle = Math.random() * 2 * Math.PI;
        const orbitRadius = randomIntFromRange(minOrbit, maxOrbit);

        const x = Math.floor(Math.cos(orbitAngle) * orbitRadius + w / 2);
        const y = Math.floor(Math.sin(orbitAngle) * orbitRadius + h / 2);

        return {
          id,
          x,
          y,
          direction: Math.random() * Math.PI * 2,
          baseSpeed: Math.random() * 0.5 + 0.5,
          speed: Math.random() * 0.5 + 0.5,
          alpha: 1,
          color: colors[randomIntFromRange(0, 3)],
          scareDist: 0.1 * Math.random() + scarea,
          fearFactor: Math.random() * 0.2 + 0.8,
          goalFactor: Math.random() * 0.1 + 0.9,
          normalFactor: 0.1,
          rotationSpeed: 0.05,
          rotationDirection: randomIntFromRange(0, 1),
          startPetalRadians: Math.PI * 2 * Math.random(),
          orbitRadius,
          orbitAngle
        };
    }

    const starlings: Starling[] = [];
    for (let i = 0; i < noStarlings; i++) {
      starlings.push(createStarling(i));
    }

    function updateStarlingPosition(starling: Starling) {
      // Rotate starling petal itself
      if (starling.rotationDirection === 0) {
        starling.startPetalRadians += starling.rotationSpeed;
      } else {
        starling.startPetalRadians -= starling.rotationSpeed;
      }

      const cx = w / 2;
      const cy = h / 2;

      // Calculate distance to center
      const dx_center = starling.x - cx;
      const dy_center = starling.y - cy;
      const distance_center = Math.sqrt(dx_center * dx_center + dy_center * dy_center);
      const angle_to_center = Math.atan2(-dy_center, -dx_center);

      if (mousePos) {
        // SCATTER MODE (Hover)
        const angle_away_mouse = Math.PI + Math.atan2(mousePos.y - starling.y, mousePos.x - starling.x);
        const distance_mouse = Math.sqrt(Math.pow(mousePos.y - starling.y, 2) + Math.pow(mousePos.x - starling.x, 2));

        // Boundary check radius (keep inside canvas)
        const boundaryRadius = (w / 2) - petalSize * 2;

        if (distance_mouse <= starling.scareDist) {
          // Scared by mouse
          starling.direction = starling.direction * (1 - starling.fearFactor) + angle_away_mouse * starling.fearFactor;
          starling.speed = starling.speed * (1 - starling.fearFactor) + starling.fearFactor * (maxSpeed * (1 - distance_mouse / starling.scareDist) + starling.baseSpeed * (distance_mouse / starling.scareDist));
        } else if (distance_center > boundaryRadius) { 
           // Hit the edge? Turn back!
           starling.direction = starling.direction * (1 - starling.goalFactor) + angle_to_center * starling.goalFactor;
           starling.speed = starling.speed * (1 - starling.goalFactor) + starling.goalFactor * (maxSpeed * 0.5 + starling.baseSpeed);
        }

        // Apply movement
        const addX = Math.cos(starling.direction) * starling.speed;
        const addY = Math.sin(starling.direction) * starling.speed;
        starling.x += addX;
        starling.y += addY;
        
        // Update orbit params
        starling.orbitAngle = Math.atan2(starling.y - cy, starling.x - cx);
        starling.orbitRadius = Math.sqrt(Math.pow(starling.x - cx, 2) + Math.pow(starling.y - cy, 2));

      } else {
        // ORBIT MODE (No Hover)
        starling.orbitAngle += 0.01 + (starling.speed * 0.01);
        
        const radiusNoise = Math.sin(starling.orbitAngle * 3 + starling.id) * 5;
        const currentRadius = starling.orbitRadius + radiusNoise;

        starling.x = cx + Math.cos(starling.orbitAngle) * currentRadius;
        starling.y = cy + Math.sin(starling.orbitAngle) * currentRadius;
      }

      // HARD CLAMP: Ensure they never leave the visible canvas
      const maxRadius = (w / 2) - petalSize;
      const finalDx = starling.x - cx;
      const finalDy = starling.y - cy;
      const finalDist = Math.sqrt(finalDx * finalDx + finalDy * finalDy);
      
      if (finalDist > maxRadius) {
         const angle = Math.atan2(finalDy, finalDx);
         starling.x = cx + Math.cos(angle) * maxRadius;
         starling.y = cy + Math.sin(angle) * maxRadius;
      }
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < starlings.length; i++) {
        const s = starlings[i];
        updateStarlingPosition(s);

        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;

        // Draw petals
        for (let j = 0; j < 5; j++) {
          ctx.beginPath();
          ctx.arc(
            s.x + petalSize * 1.3 * Math.cos(s.startPetalRadians + 2 * Math.PI * j / 5),
            s.y + petalSize * 1.3 * Math.sin(s.startPetalRadians + 2 * Math.PI * j / 5),
            petalSize,
            0,
            2 * Math.PI,
            true
          );
          ctx.fill();
          ctx.closePath();
        }

        // Draw center
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, petalSize / 3, 0, 2 * Math.PI, true);
        ctx.fill();
        ctx.closePath();
      }

      animationFrameId = requestAnimationFrame(draw);
    }

    draw();

    // Mouse handlers
    const getMousePos = (evt: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    };

    const handleMouseMove = (evt: MouseEvent) => {
      mousePos = getMousePos(evt);
    };

    const handleMouseLeave = () => {
      mousePos = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [size]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-20 flex items-center justify-center pointer-events-auto"
      style={{ width: size, height: size }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
