'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { OnboardingStatus } from 'modules/onboarding/onboarding.types';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';

export const WELCOME_SEEN_KEY = 'zamp_welcome_seen';

type Props = {
  nextStatus: OnboardingStatus;
  onComplete: (status: OnboardingStatus) => void;
};

const STORY_LINES = [
  'Welcome to Zamp.',
  'A different way to use your computer.',
  "Whether you're a solo builder",
  'or a team running complex operations',
  '\u2014 Zamp adapts to how you work.',
  'Just say what needs to happen.',
  'And it happens.',
  "It's time to start building.",
  'Ready?',
];

const FLOAT_COLORS = [
  'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
  'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
  'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
  'linear-gradient(135deg, #F3E5F5, #E1BEE7)',
];

const FLOAT_POSITIONS = [
  { width: 120, height: 80, top: '15%', left: '8%' },
  { width: 100, height: 100, top: '12%', right: '10%' },
  { width: 140, height: 90, bottom: '20%', left: '6%' },
  { width: 110, height: 75, bottom: '15%', right: '7%' },
];

const IMG_TRIGGERS = [
  { showAt: 1, expandAt: 4 },
  { showAt: 2, expandAt: 5 },
  { showAt: 4, expandAt: 7 },
  { showAt: 5, expandAt: 9 },
];

export const WelcomeStep = ({ nextStatus, onComplete }: Props) => {
  const [currentIdx, setCurrentIdx] = useState(-1);
  const currentIdxRef = useRef(-1);
  const [phase, setPhase] = useState<'revealing' | 'done'>('revealing');
  const phaseRef = useRef<'revealing' | 'done'>('revealing');
  const isAnimatingRef = useRef(false);
  const [revealedWords, setRevealedWords] = useState<Record<number, Set<number>>>({});
  const [exitIdx, setExitIdx] = useState<number | null>(null);
  const navigatedRef = useRef(false);

  const handleDone = useCallback(() => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    try {
      localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    } catch {
      // localStorage may be unavailable
    }
    onComplete(nextStatus);
  }, [onComplete, nextStatus]);

  const showSection = useCallback((idx: number) => {
    if (idx < 0 || idx >= STORY_LINES.length || isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setExitIdx(currentIdxRef.current >= 0 ? currentIdxRef.current : null);
    currentIdxRef.current = idx;
    setCurrentIdx(idx);

    const line = STORY_LINES[idx];
    const wordCount = line.split(' ').length;
    const overlap = 50;

    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let wi = 0; wi < wordCount; wi++) {
      timers.push(
        setTimeout(() => {
          setRevealedWords((prev) => {
            const next = { ...prev };

            next[idx] = new Set([...(prev[idx] ?? []), wi]);

            return next;
          });
        }, wi * overlap),
      );
    }

    const animTime = (wordCount - 1) * overlap + 600;
    const lockTime = Math.max(animTime, 1200);

    timers.push(
      setTimeout(() => {
        setExitIdx(null);
        isAnimatingRef.current = false;
      }, lockTime),
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => showSection(0), 400);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const lastAdvanceRef = useRef(0);

  const advance = useCallback(() => {
    if (Date.now() - lastAdvanceRef.current < 1500) return;
    if (phaseRef.current !== 'revealing') return;

    const next = currentIdxRef.current + 1;

    if (next < STORY_LINES.length) {
      lastAdvanceRef.current = Date.now();
      showSection(next);
    } else {
      phaseRef.current = 'done';
      setPhase('done');
      handleDone();
    }
  }, [showSection, handleDone]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY <= 0) return;
      advance();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        [KEYBOARD_KEYS.ARROW_DOWN, KEYBOARD_KEYS.ARROW_RIGHT, ' ', KEYBOARD_KEYS.ENTER].includes(e.key as KEYBOARD_KEYS)
      ) {
        e.preventDefault();
        advance();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [advance]);

  const getImgState = (imgIdx: number) => {
    const t = IMG_TRIGGERS[imgIdx];

    if (!t) return 'hidden';
    if (currentIdx >= t.expandAt) return 'expand';
    if (currentIdx >= t.showAt) return 'show';

    return 'hidden';
  };

  return (
    <div className='bg-GRAY_100 fixed inset-0 z-[150] flex items-center justify-center overflow-hidden'>
      {/* Floating image panels */}
      {FLOAT_POSITIONS.map((pos, i) => {
        const state = getImgState(i);

        return (
          <div
            key={i}
            className='absolute overflow-hidden rounded-xl'
            style={{
              ...pos,
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
              opacity: state === 'show' ? 1 : 0,
              transform: state === 'expand' ? 'scale(1.15)' : state === 'show' ? 'scale(1)' : 'scale(0.7)',
              transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: FLOAT_COLORS[i],
                borderRadius: 12,
              }}
            />
          </div>
        );
      })}

      {/* Story sections */}
      {STORY_LINES.map((line, idx) => {
        const isActive = idx === currentIdx && exitIdx !== idx;
        const isExiting = idx === exitIdx;
        const words = line.split(' ');

        return (
          <div
            key={idx}
            className='pointer-events-none absolute w-[640px] text-center'
            style={{
              top: '50%',
              left: '50%',
              transform: isExiting ? 'translate(-50%, -55%)' : 'translate(-50%, -50%)',
              opacity: isActive ? 1 : 0,
              transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)',
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-funnel-display), serif',
                fontSize: idx === STORY_LINES.length - 1 ? 52 : 44,
                color: 'var(--GRAY_1000)',
                lineHeight: 1.45,
                fontWeight: 300,
              }}
            >
              {words.map((word, wi) => (
                <span
                  key={wi}
                  style={{
                    display: 'inline-block',
                    opacity: revealedWords[idx]?.has(wi) ? 1 : 0,
                    transform: revealedWords[idx]?.has(wi) ? 'translateY(0)' : 'translateY(8px)',
                    filter: revealedWords[idx]?.has(wi) ? 'blur(0)' : 'blur(4px)',
                    transition:
                      'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1), filter 0.7s cubic-bezier(0.16,1,0.3,1)',
                  }}
                >
                  {word}
                  {wi < words.length - 1 ? '\u00A0' : ''}
                </span>
              ))}
            </div>
          </div>
        );
      })}

      {/* Scroll hint */}
      {currentIdx >= 0 && phase !== 'done' && (
        <div
          className='absolute bottom-10 text-xs'
          style={{ color: 'var(--GRAY_600)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em' }}
        >
          scroll to continue
        </div>
      )}
    </div>
  );
};
