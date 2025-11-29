'use client';

import { useEffect, useRef } from 'react';

interface BlackHoleFrameProps {
  size: number;
}

export default function BlackHoleFrame({ size }: BlackHoleFrameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration scaled to size
    const cw = size;
    const ch = size;
    const centerx = cw / 2;
    const centery = ch / 2;
    
    // Scale maxorbit relative to size. 
    // In original: size ~? (window size), maxorbit = 255.
    // For avatar: size = 96px, maxorbit should be slightly larger than radius (48px).
    // Let's say maxorbit is 70% of size.
    const maxorbit = size * 0.7; 

    const startTime = new Date().getTime();
    let currentTime = 0;

    const stars: Star[] = [];
    
    // We can keep these simple for now, or attach to hover events if we want interactivity
    let collapse = false; 
    const expanse = false;
    const returning = false;

    canvas.width = cw;
    canvas.height = ch;

    // High DPI scaling
    const dpi = window.devicePixelRatio || 1;
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    canvas.width = Math.ceil(cw * dpi);
    canvas.height = Math.ceil(ch * dpi);
    ctx.scale(dpi, dpi);

    // Helper: Rotate function
    function rotate(cx: number, cy: number, x: number, y: number, angle: number) {
      const radians = angle;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
      const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
      return [nx, ny];
    }

    class Star {
      orbital: number;
      x: number;
      y: number;
      yOrigin: number;
      speed: number;
      rotation: number;
      startRotation: number;
      id: number;
      collapseBonus: number;
      color: string;
      hoverPos: number;
      expansePos: number;
      prevR: number;
      prevX: number;
      prevY: number;
      originalY: number;
      trail: number;

      constructor(index: number) {
        this.id = index;
        // Weighted random for orbit
        const rands = [];
        rands.push(Math.random() * (maxorbit / 2) + 1);
        rands.push(Math.random() * (maxorbit / 2) + maxorbit);
        
        this.orbital = (rands.reduce((p, c) => p + c, 0) / rands.length);
        
        this.x = centerx;
        this.y = centery + this.orbital;
        this.yOrigin = centery + this.orbital;
        
        this.speed = (Math.floor(Math.random() * 2.5) + 1.5) * Math.PI / 180;
        this.rotation = 0;
        this.startRotation = (Math.floor(Math.random() * 360) + 1) * Math.PI / 180;

        this.collapseBonus = this.orbital - (maxorbit * 0.7);
        if (this.collapseBonus < 0) this.collapseBonus = 0;

        this.color = 'rgba(255,255,255,' + (1 - ((this.orbital) / maxorbit)) + ')';
        
        this.hoverPos = centery + (maxorbit / 2) + this.collapseBonus;
        this.expansePos = centery + (this.id % 100) * -10 + (Math.floor(Math.random() * 20) + 1);

        this.prevR = this.startRotation;
        this.prevX = this.x;
        this.prevY = this.y;
        this.originalY = this.yOrigin;
        this.trail = 1;
      }

      draw() {
        // Logic simplified for always orbiting (no click expanse for now)
        this.rotation = this.startRotation + (currentTime * this.speed);
        
        if (!collapse) {
          if (this.y > this.yOrigin) this.y -= 2.5;
          if (this.y < this.yOrigin - 4) this.y += (this.yOrigin - this.y) / 10;
        } else {
          this.trail = 1;
          if (this.y > this.hoverPos) this.y -= (this.hoverPos - this.y) / -5;
          if (this.y < this.hoverPos - 4) this.y += 2.5;
        }

        ctx!.save();
        ctx!.fillStyle = this.color;
        ctx!.strokeStyle = this.color;
        ctx!.beginPath();
        
        const oldPos = rotate(centerx, centery, this.prevX, this.prevY, -this.prevR);
        ctx!.moveTo(oldPos[0], oldPos[1]);
        
        ctx!.translate(centerx, centery);
        ctx!.rotate(this.rotation);
        ctx!.translate(-centerx, -centery);
        
        ctx!.lineTo(this.x, this.y);
        ctx!.stroke();
        ctx!.restore();

        this.prevR = this.rotation;
        this.prevX = this.x;
        this.prevY = this.y;
      }
    }

    // Initialize stars
    // Reduce star count for performance on small avatars (original 2500)
    // 2500 is a lot for a small 96px canvas. Let's try 800.
    const starCount = 800;
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star(i));
    }

    let animationFrameId: number;

    function loop() {
      const now = new Date().getTime();
      currentTime = (now - startTime) / 50;

      // Clear with trail effect
      ctx!.fillStyle = 'rgba(25,25,25,0.2)';
      ctx!.fillRect(0, 0, cw, ch);

      for (let i = 0; i < stars.length; i++) {
        stars[i].draw();
      }

      animationFrameId = requestAnimationFrame(loop);
    }

    loop();

    // Hover listeners on container
    const handleMouseEnter = () => { collapse = true; };
    const handleMouseLeave = () => { collapse = false; };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [size]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden rounded-full bg-[#191919]"
      style={{ width: size, height: size }}
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
