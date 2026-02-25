'use client';

import { RefObject, useEffect, useRef } from 'react';
import {
  CARD_FADE_ZONE,
  CARD_PAD_X,
  CARD_PAD_Y,
  COLOR_PALETTE,
  PROFESSIONS,
  REVEAL_RADIUS,
} from 'modules/login/login.constants';

function seededRandom(seed: number) {
  let s = seed;

  return () => {
    s = (s * 16807 + 0) % 2147483647;

    return (s - 1) / 2147483646;
  };
}

const rng = seededRandom(42);

const shuffledProfessionItems = Array.from({ length: 6 })
  .flatMap(() => PROFESSIONS)
  .sort(() => rng() - 0.5)
  .map((profession) => ({
    name: profession,
    color: COLOR_PALETTE[Math.floor(rng() * COLOR_PALETTE.length)],
  }));

type LabelData = {
  el: HTMLDivElement;
  cx: number;
  cy: number;
  isHovered: boolean;
  switchTimeout: ReturnType<typeof setTimeout> | null;
};

function cachePositions(labelData: LabelData[]) {
  for (const label of labelData) {
    const { left, top, width, height } = label.el.getBoundingClientRect();

    label.cx = left + width / 2;
    label.cy = top + height / 2;
  }
}

function startSwitching(data: LabelData) {
  if (data.switchTimeout) return;
  const run = () => {
    if (!data.isHovered) {
      data.switchTimeout = null;

      return;
    }
    data.el.textContent = PROFESSIONS[Math.floor(Math.random() * PROFESSIONS.length)];
    data.el.style.fontWeight = String(Math.random() > 0.5 ? 500 : 200);
    data.switchTimeout = setTimeout(run, 100 + Math.random() * 500);
  };

  run();
}

function stopSwitching(data: LabelData) {
  if (data.switchTimeout) {
    clearTimeout(data.switchTimeout);
    data.switchTimeout = null;
  }
}

type Props = {
  /** Ref to the centered card container, used to dampen label opacity near it */
  containerRef: RefObject<HTMLDivElement | null>;
};

export const ProfessionRevealBackground = ({ containerRef }: Props) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const grid = gridRef.current;
    const glow = glowRef.current;

    if (!grid || !glow) return;

    const labelData: LabelData[] = [];

    shuffledProfessionItems.forEach(({ name, color }) => {
      const element = document.createElement('div');

      element.className = 'profession-label';
      element.textContent = name;
      element.style.color = color;
      grid.appendChild(element);
      labelData.push({ el: element, cx: 0, cy: 0, isHovered: false, switchTimeout: null });
    });

    requestAnimationFrame(() => cachePositions(labelData));

    let rafId = 0;
    let isActive = false;

    function updateGrid() {
      const { x: mouseX, y: mouseY } = mouseRef.current;
      const mouseOffscreen = mouseX < -500;

      if (mouseOffscreen) {
        let anyHovered = false;

        for (const label of labelData) {
          if (!label.isHovered) continue;

          anyHovered = true;
          label.isHovered = false;
          stopSwitching(label);

          Object.assign(label.el.style, {
            fontWeight: '100',
            opacity: '0',
            transitionDuration: '1200ms',
          });
        }
        if (glow) glow.style.background = 'none';
        isActive = false;
        if (anyHovered) return;

        return;
      }

      const card = containerRef.current;
      const cardRect = card?.getBoundingClientRect();
      const expanded = cardRect
        ? {
            left: cardRect.left - CARD_PAD_X,
            right: cardRect.right + CARD_PAD_X,
            top: cardRect.top - CARD_PAD_Y,
            bottom: cardRect.bottom + CARD_PAD_Y,
          }
        : null;

      for (const data of labelData) {
        const { el, cx, cy } = data;
        const dist = Math.sqrt((cx - mouseX) ** 2 + (cy - mouseY) ** 2);

        if (dist < REVEAL_RADIUS) {
          const strength = 1 - dist / REVEAL_RADIUS;
          let opacity = Math.pow(strength, 1.2) * 0.95;

          if (expanded) {
            const nearestX = Math.max(expanded.left, Math.min(cx, expanded.right));
            const nearestY = Math.max(expanded.top, Math.min(cy, expanded.bottom));
            const cardDist = Math.sqrt((cx - nearestX) ** 2 + (cy - nearestY) ** 2);

            if (cardDist <= 0) {
              opacity *= 0.08;
            } else if (cardDist < CARD_FADE_ZONE) {
              opacity *= 0.14 + (cardDist / CARD_FADE_ZONE) * 0.86;
            }
          }

          el.style.opacity = String(opacity);
          el.style.transitionDuration = '150ms';

          if (!data.isHovered) {
            data.isHovered = true;
            startSwitching(data);
          }
        } else {
          if (data.isHovered) {
            data.isHovered = false;
            stopSwitching(data);
            el.style.fontWeight = '100';
          }
          if (
            expanded &&
            !data.isHovered &&
            cx >= expanded.left &&
            cx <= expanded.right &&
            cy >= expanded.top &&
            cy <= expanded.bottom
          ) {
            el.style.opacity = '0';
          } else {
            el.style.opacity = '0';
            el.style.transitionDuration = '1200ms';
          }
        }
      }

      if (glow) {
        glow.style.background = `radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.3), transparent 100%)`;
      }
      rafId = requestAnimationFrame(updateGrid);
    }

    function scheduleUpdate() {
      if (!isActive) {
        isActive = true;
        rafId = requestAnimationFrame(updateGrid);
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      scheduleUpdate();
    };
    const onTouchStart = (e: TouchEvent) => {
      mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      scheduleUpdate();
    };
    const onTouchMove = (e: TouchEvent) => {
      mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      scheduleUpdate();
    };
    const onTouchEnd = () => {
      mouseRef.current = { x: -1000, y: -1000 };
      scheduleUpdate();
    };

    const onResize = () => cachePositions(labelData);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
      labelData.forEach((d) => stopSwitching(d));
      while (grid.firstChild) grid.removeChild(grid.firstChild);
    };
  }, [containerRef]);

  return (
    <>
      <style>{`.profession-label{display:flex;align-items:center;font-family:'Geist Mono',monospace;font-size:.8rem;text-transform:uppercase;letter-spacing:.1em;line-height:1;white-space:nowrap;opacity:0;transition:opacity 1200ms ease-out;font-weight:100;will-change:opacity;user-select:none}`}</style>
      <div
        ref={gridRef}
        className='pointer-events-none fixed inset-0 z-0 grid gap-x-4 gap-y-7 p-8'
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        }}
      />

      <div ref={glowRef} className='pointer-events-none fixed inset-0 z-0 mix-blend-soft-light' />
    </>
  );
};
