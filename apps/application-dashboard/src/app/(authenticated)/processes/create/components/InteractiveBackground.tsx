'use client';

import { useEffect, useRef } from 'react';

interface InteractiveBackgroundProps {
  clickEvent?: { x: number; y: number; timestamp: number } | null;
}

export const InteractiveBackground = ({ clickEvent }: InteractiveBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const ripplesRef = useRef<Array<{ x: number; y: number; startTime: number }>>([]);
  const prevClickTimeRef = useRef<number>(0);

  useEffect(() => {
    if (clickEvent && clickEvent.timestamp !== prevClickTimeRef.current) {
      prevClickTimeRef.current = clickEvent.timestamp;
      ripplesRef.current.push({
        x: clickEvent.x,
        y: clickEvent.y,
        startTime: Date.now(),
      });
    }
  }, [clickEvent]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const chars = 'https://www.google.com/search?q=ai+agent&sourceid=chrome&ie=UTF-8'.split('');
    const uniqueChars = Array.from(new Set(chars)).filter((c) => c !== ' ');

    let animationFrameId: number;

    const render = () => {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fontSize = 10;
      const spacing = 14;
      const cols = Math.ceil(canvas.width / spacing);
      const rows = Math.ceil(canvas.height / spacing);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const now = Date.now();
      const rippleLife = 1000;

      // Filter old ripples
      ripplesRef.current = ripplesRef.current.filter((r) => now - r.startTime < rippleLife);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;

          const dx = x - mouseRef.current.x;
          const dy = y - mouseRef.current.y;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);
          const mouseRadius = 75;

          const charIndex = (i + j) % uniqueChars.length;
          let char = uniqueChars[charIndex];
          let isFluctuating = false;
          let intensity = 0;

          // Check Ripples
          for (const ripple of ripplesRef.current) {
            const rDistX = x - ripple.x;
            const rDistY = y - ripple.y;
            const rDist = Math.sqrt(rDistX * rDistX + rDistY * rDistY);

            const rippleAge = now - ripple.startTime;
            const rippleSpeed = 0.5;
            const currentRadius = rippleAge * rippleSpeed;
            const rippleWidth = 50;

            const distFromWave = Math.abs(rDist - currentRadius);

            if (distFromWave < rippleWidth) {
              isFluctuating = true;
              const ageFactor = 1 - rippleAge / rippleLife;
              const waveFactor = 1 - distFromWave / rippleWidth;

              intensity = Math.max(intensity, waveFactor * ageFactor);
            }
          }

          if (isFluctuating && intensity > 0.1) {
            const timeQuantized = Math.floor(now / 150);
            const noise = (i * 3 + j * 7 + timeQuantized) % uniqueChars.length;

            char = uniqueChars[noise];

            const val = Math.floor(50 * (1 - intensity));

            ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
            ctx.globalAlpha = 0.4 * intensity;
            ctx.font = `bold ${fontSize}px monospace`;
          } else if (distToMouse < mouseRadius) {
            const hoverIntensity = 1 - distToMouse / mouseRadius;
            const base = 200;
            const target = 100;
            const val = Math.floor(base - (base - target) * hoverIntensity);

            ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
            ctx.globalAlpha = 0.3 + 0.3 * hoverIntensity;
            ctx.font = `${fontSize}px monospace`;
          } else {
            ctx.fillStyle = '#d0d0d0';
            ctx.globalAlpha = 0.2;
            ctx.font = `${fontSize}px monospace`;
          }

          ctx.fillText(char, x + spacing / 2, y + spacing / 2);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (canvas) {
        const parent = canvas.parentElement;

        if (parent) {
          const rect = parent.getBoundingClientRect();
          const dpr = window.devicePixelRatio || 1;

          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;

          ctx.scale(dpr, dpr);

          canvas.style.width = `${rect.width}px`;
          canvas.style.height = `${rect.height}px`;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (canvas) {
        const rect = canvas.getBoundingClientRect();

        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    handleResize();
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className='pointer-events-none absolute inset-0 z-0 h-full w-full mix-blend-multiply' />
  );
};
