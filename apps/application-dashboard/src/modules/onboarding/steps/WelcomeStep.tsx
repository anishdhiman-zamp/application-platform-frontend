'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Progress } from '@zamp-platform/ui';
import { OnboardingStatus } from 'modules/onboarding/onboarding.types';

export const WELCOME_SEEN_KEY = 'zamp_welcome_seen';

export const isWelcomeSeenForUser = (userId: string): boolean => {
  try {
    const raw = localStorage.getItem(WELCOME_SEEN_KEY);

    if (!raw) return false;
    const seen: string[] = JSON.parse(raw);

    return Array.isArray(seen) && seen.includes(userId);
  } catch {
    return false;
  }
};

export const markWelcomeSeenForUser = (userId: string): void => {
  try {
    const raw = localStorage.getItem(WELCOME_SEEN_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const seen: string[] = Array.isArray(parsed) ? parsed : [];

    if (!seen.includes(userId)) {
      seen.push(userId);
    }
    localStorage.setItem(WELCOME_SEEN_KEY, JSON.stringify(seen));
  } catch {
    // localStorage may be unavailable
  }
};

type Props = {
  nextStatus: OnboardingStatus;
  onComplete: (status: OnboardingStatus) => void;
  userId: string;
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

const AUTO_ADVANCE_DELAY = 500;

export const WelcomeStep = ({ nextStatus, onComplete, userId }: Props) => {
  const currentIdxRef = useRef(-1);
  const phaseRef = useRef<'revealing' | 'done'>('revealing');
  const isAnimatingRef = useRef(false);
  const navigatedRef = useRef(false);
  const lastAdvanceRef = useRef(0);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceRef = useRef<() => void>(() => {});

  const [currentIdx, setCurrentIdx] = useState(-1);
  const [phase, setPhase] = useState<'revealing' | 'done'>('revealing');
  const [revealedWords, setRevealedWords] = useState<Record<number, Set<number>>>({});
  const [exitIdx, setExitIdx] = useState<number | null>(null);

  const handleDone = useCallback(() => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    try {
      markWelcomeSeenForUser(userId);
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

    timers.push(
      ...Array.from({ length: wordCount }, (_, wi) =>
        setTimeout(() => {
          setRevealedWords((prev) => ({
            ...prev,
            [idx]: new Set(prev[idx]).add(wi),
          }));
        }, wi * overlap),
      ),
    );

    const animTime = (wordCount - 1) * overlap + 600;
    const lockTime = Math.max(animTime, 1200);

    timers.push(
      setTimeout(() => {
        setExitIdx(null);
        isAnimatingRef.current = false;

        // Schedule auto-advance after animation completes
        if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = setTimeout(() => {
          autoAdvanceTimerRef.current = null;
          advanceRef.current();
        }, AUTO_ADVANCE_DELAY);
      }, lockTime),
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const advance = useCallback(() => {
    if (Date.now() - lastAdvanceRef.current < 100) return;
    if (phaseRef.current !== 'revealing') return;

    // Clear any pending auto-advance
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

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

  advanceRef.current = advance;

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY <= 0) return;
      advance();
    },
    [advance],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Escape') return;
      e.preventDefault();
      advance();
    },
    [advance],
  );

  useEffect(() => {
    const timer = setTimeout(() => showSection(0), 400);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, [handleWheel, handleKeyDown]);

  const getImgState = (imgIdx: number) => {
    const t = IMG_TRIGGERS[imgIdx];

    if (!t) return 'hidden';
    if (currentIdx >= t.expandAt) return 'expand';
    if (currentIdx >= t.showAt) return 'show';

    return 'hidden';
  };

  return (
    <div
      className='bg-GRAY_100 fixed inset-0 z-[150] flex items-center justify-center overflow-hidden'
      onClick={advance}
    >
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
            className='pointer-events-none absolute top-1/2 left-1/2 z-2 w-160 text-center'
            style={{
              transform: isExiting ? 'translate(-50%, -55%)' : 'translate(-50%, -50%)',
              opacity: isActive ? 1 : 0,
              transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div
              className='text-GRAY_1000 font-funnel-display leading-[1.45] font-light'
              style={{
                fontSize: idx === STORY_LINES.length - 1 ? 52 : 44,
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

      {/* Progress bar */}
      {currentIdx >= 0 && phase !== 'done' && (
        <Progress
          value={((currentIdx + 1) / STORY_LINES.length) * 100}
          className='absolute bottom-10 w-30'
          indicatorClassName='bg-black'
        />
      )}
    </div>
  );
};
