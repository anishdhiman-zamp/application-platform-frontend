'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { OnboardingStatus } from 'modules/onboarding/onboarding.types';
import { useWelcomeMutation } from '@/apis/onboarding';
import { Session } from '@/types/api/auth.types';

type Props = {
  session: Session;
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
  { showAt: 5, expandAt: 8 },
];

export const WelcomeStep = ({ session, onComplete }: Props) => {
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [phase, setPhase] = useState<'revealing' | 'fading' | 'fadingOut' | 'ready' | 'done'>('revealing');
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedWords, setRevealedWords] = useState<Record<number, Set<number>>>({});
  const [exitIdx, setExitIdx] = useState<number | null>(null);
  const [showReady, setShowReady] = useState(false);
  const wheelAccum = useRef(0);
  const [welcomeMutation] = useWelcomeMutation();
  const [apiCalled, setApiCalled] = useState(false);

  const callWelcomeApi = useCallback(async () => {
    if (apiCalled) return;
    setApiCalled(true);
    try {
      const orgId = session.orgs?.[0]?.organization_id;
      const body = orgId ? { organization_id: orgId } : {};
      const result = await welcomeMutation(body).unwrap();

      onComplete(result.onboarding_status);
    } catch {
      // On error, re-fetch whoami and render correct screen
      onComplete(OnboardingStatus.WELCOME);
    }
  }, [apiCalled, session, welcomeMutation, onComplete]);

  const showSection = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= STORY_LINES.length || isAnimating) return;
      setIsAnimating(true);
      setExitIdx(currentIdx);
      setCurrentIdx(idx);

      const line = STORY_LINES[idx];
      const wordCount = line.split(' ').length;
      const overlap = 50;

      // Reveal words staggered
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

      timers.push(
        setTimeout(() => {
          setExitIdx(null);
          setIsAnimating(false);
        }, animTime),
      );

      return () => timers.forEach(clearTimeout);
    },
    [currentIdx, isAnimating],
  );

  useEffect(() => {
    const timer = setTimeout(() => showSection(0), 400);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY <= 0) return;
      if (isAnimating) return;

      wheelAccum.current += Math.abs(e.deltaY);
      if (wheelAccum.current < 30) return;
      wheelAccum.current = 0;

      if (phase === 'revealing') {
        const next = currentIdx + 1;

        if (next < STORY_LINES.length) {
          showSection(next);
          if (next >= STORY_LINES.length - 1) {
            setTimeout(() => setPhase('fading'), 1200);
          }
        }
      } else if (phase === 'fading') {
        setPhase('fadingOut');
        setExitIdx(currentIdx);
        setTimeout(() => {
          setShowReady(true);
          setPhase('ready');
        }, 600);
      } else if (phase === 'ready') {
        setPhase('done');
        setShowReady(false);
        callWelcomeApi();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => window.removeEventListener('wheel', handleWheel);
  }, [phase, currentIdx, isAnimating, showSection, callWelcomeApi]);

  const getImgState = (imgIdx: number) => {
    const t = IMG_TRIGGERS[imgIdx];

    if (!t) return 'hidden';
    if (currentIdx >= t.expandAt) return 'expand';
    if (currentIdx >= t.showAt) return 'show';

    return 'hidden';
  };

  return (
    <div className='fixed inset-0 z-[150] flex items-center justify-center overflow-hidden bg-[#f3f3f3]'>
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
                fontFamily: "'FunnelDisplay', serif",
                fontSize: 44,
                color: '#1a1a1a',
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

      {/* "Ready?" overlay */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: "'FunnelDisplay', serif",
          fontSize: 52,
          color: '#1a1a1a',
          fontWeight: 300,
          opacity: showReady ? 1 : 0,
          transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1)',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      >
        Ready?
      </div>

      {/* Scroll hint */}
      {currentIdx >= 0 && phase !== 'done' && (
        <div
          className='absolute bottom-10 text-xs'
          style={{ color: '#bbb', fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em' }}
        >
          scroll to continue
        </div>
      )}
    </div>
  );
};
