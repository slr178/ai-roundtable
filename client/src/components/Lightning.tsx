import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

interface LightningProps {
  isVisible: boolean;
}

export interface LightningRef {
  strike: () => void;
}

const Lightning = forwardRef<LightningRef, LightningProps>(({ isVisible }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useImperativeHandle(ref, () => ({
    strike: () => {
      console.log('⚡ Lightning strike method called');
      if (canvasRef.current) {
        console.log('⚡ Canvas found, executing lightning and sound');
        // Play thunder sound
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
        
        // Trigger lightning with enhanced visibility
        strikeMultiple();
        
        // Add screen flash effect for better visibility
        flashScreen();
      } else {
        console.log('⚡ Canvas not found when trying to strike lightning');
      }
    }
  }));

  const options = { speed: 50, spread: 50, branching: 20 };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  class LightningBolt {
    private ctx: CanvasRenderingContext2D;
    private options: any;
    private point: number[];
    private lastAngle: number;
    private children: LightningBolt[];

    constructor(ctx: CanvasRenderingContext2D, opts: any) {
      this.ctx = ctx;
      this.options = {
        startPoint: [0, 0],
        length: 100,
        angle: 90,
        speed: 30,
        spread: 50,
        branches: 10,
        maxBranches: 10,
        ...opts
      };
      this.point = [...this.options.startPoint];
      this.lastAngle = this.options.angle;
      this.children = [];

      ctx.shadowColor = "#FFF";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
    }

    draw(isChild = false) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.options.startPoint[0], this.options.startPoint[1]);
      const angleDelta = rand(1, this.options.spread);
      this.lastAngle += (this.lastAngle > this.options.angle) ? -angleDelta : angleDelta;
      const r = this.lastAngle * Math.PI / 180;
      this.point[0] += Math.cos(r) * this.options.speed;
      this.point[1] += Math.sin(r) * this.options.speed;
      this.ctx.lineTo(this.point[0], this.point[1]);
      this.ctx.stroke();

      const dx = this.point[0] - this.options.startPoint[0];
      const dy = this.point[1] - this.options.startPoint[1];
      const dist = Math.sqrt(dx * dx + dy * dy);

      // spawn branches
      if (rand(0, 99) < this.options.branches && this.children.length < this.options.maxBranches) {
        this.children.push(new LightningBolt(this.ctx, {
          startPoint: [...this.point],
          length: dist * 0.8,
          angle: this.lastAngle + rand(350 - this.options.spread, 370 + this.options.spread),
          speed: this.options.speed - 2,
          spread: this.options.spread - 2,
          branches: this.options.branches,
          maxBranches: this.options.maxBranches
        }));
      }

      this.children.forEach(c => c.draw(true));

      if (isChild) return;
      if (dist < this.options.length) {
        requestAnimationFrame(() => this.draw());
      } else {
        this.fade();
      }
    }

    fade() {
      this.ctx.shadowColor = '#000';
      this.ctx.fillStyle = 'rgba(0,0,0,0.05)';
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      const px = this.ctx.getImageData(0, 0, 1, 1).data;
      if (px[0] === 0 && px[3] > 240) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      } else {
        setTimeout(() => this.fade(), 50);
      }
    }
  }

  const flashScreen = () => {
    // Create a bright white flash overlay for enhanced visibility
    const flashDiv = document.createElement('div');
    flashDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(255, 255, 255, 0.8);
      pointer-events: none;
      z-index: 10000;
      animation: lightning-flash 0.3s ease-out;
    `;
    
    // Add CSS animation if not already added
    if (!document.getElementById('lightning-flash-styles')) {
      const style = document.createElement('style');
      style.id = 'lightning-flash-styles';
      style.textContent = `
        @keyframes lightning-flash {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(flashDiv);
    setTimeout(() => {
      document.body.removeChild(flashDiv);
    }, 300);
  };

  const strikeMultiple = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create 3 lightning bolts at random positions
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const startX = Math.random() * canvas.width;
        const bolt = new LightningBolt(ctx, {
          startPoint: [startX, 0],
          length: canvas.height,
          speed: options.speed,
          spread: options.spread,
          branches: options.branching,
          maxBranches: options.branching
        });
        bolt.draw();
      }, i * 150);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9999,
          background: 'transparent'
        }}
      />
      <audio
        ref={audioRef}
        preload="auto"
        src="/thunder.mp3"
        style={{ display: 'none' }}
      />
    </>
  );
});

Lightning.displayName = 'Lightning';

export default Lightning; 