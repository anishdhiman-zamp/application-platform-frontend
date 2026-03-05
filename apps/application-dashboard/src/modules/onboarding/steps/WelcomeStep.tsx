'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { OnboardingStatus } from 'modules/onboarding/onboarding.types';
import { handleOnboardingApiError } from 'modules/onboarding/utils/onboardingErrors';
import { useWelcomeMutation } from '@/apis/onboarding';

const WELCOME_SEEN_KEY = 'zamp_welcome_seen';

type Props = {
  organizationId: string | null;
  onComplete: (status: OnboardingStatus) => void;
  onWrongStep: () => void;
  onFlagDisabled: () => void;
  /** When true, skip the /welcome API call (animation-only mode for reload scenarios) */
  skipApi?: boolean;
  /** Status to navigate to when skipApi is true (defaults to SETUP_WORKSPACE) */
  nextStatus?: OnboardingStatus;
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

export { WELCOME_SEEN_KEY };

export const WelcomeStep = ({
  organizationId,
  onComplete,
  onWrongStep,
  onFlagDisabled,
  skipApi = false,
  nextStatus,
}: Props) => {
  const [currentIdx, setCurrentIdx] = useState(-1);
  const currentIdxRef = useRef(-1);
  const [phase, setPhase] = useState<'revealing' | 'done'>('revealing');
  const phaseRef = useRef<'revealing' | 'done'>('revealing');
  const isAnimatingRef = useRef(false);
  const [revealedWords, setRevealedWords] = useState<Record<number, Set<number>>>({});
  const [exitIdx, setExitIdx] = useState<number | null>(null);
  const [apiError, setApiError] = useState(false);
  const [welcomeMutation] = useWelcomeMutation();

  // Track both conditions: API response received + animation finished
  const apiResultRef = useRef<OnboardingStatus | null>(null);
  const animationDoneRef = useRef(false);
  const navigatedRef = useRef(false);

  const tryNavigate = useCallback(() => {
    if (navigatedRef.current) return;
    if (apiResultRef.current && animationDoneRef.current) {
      navigatedRef.current = true;
      try {
        localStorage.setItem(WELCOME_SEEN_KEY, 'true');
      } catch {
        // localStorage may be unavailable
      }
      onComplete(apiResultRef.current);
    }
  }, [onComplete]);

  // Call /welcome API immediately on mount — provisioning starts while animation plays
  // In skipApi mode, set the result immediately (API was already called before reload)
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    if (skipApi) {
      apiResultRef.current = nextStatus || OnboardingStatus.SETUP_WORKSPACE;
      tryNavigate();

      return;
    }

    const callApi = async () => {
      try {
        const body = organizationId ? { organization_id: organizationId } : {};
        const result = await welcomeMutation(body).unwrap();

        apiResultRef.current = result.onboarding_status;
        setApiError(false);
        tryNavigate();
      } catch (err) {
        const noopSetError = () => {};

        if (!handleOnboardingApiError(err, { setError: noopSetError, onWrongStep, onFlagDisabled })) {
          setApiError(true);
        }
      }
    };

    callApi();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = async () => {
    setApiError(false);
    try {
      const body = organizationId ? { organization_id: organizationId } : {};
      const result = await welcomeMutation(body).unwrap();

      apiResultRef.current = result.onboarding_status;
      tryNavigate();
    } catch (err) {
      const noopSetError = () => {};

      if (!handleOnboardingApiError(err, { setError: noopSetError, onWrongStep, onFlagDisabled })) {
        setApiError(true);
      }
    }
  };

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
    // Lock for at least 1200ms so trackpad inertia dies before next scroll is accepted
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

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY <= 0) return;

      // Only allow one advance per 1.5s — kills all trackpad inertia
      if (Date.now() - lastAdvanceRef.current < 1500) return;

      if (phaseRef.current === 'revealing') {
        const next = currentIdxRef.current + 1;

        if (next < STORY_LINES.length) {
          lastAdvanceRef.current = Date.now();
          showSection(next);
        } else {
          // All lines including "Ready?" have been shown — done
          phaseRef.current = 'done';
          setPhase('done');
          animationDoneRef.current = true;
          tryNavigate();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => window.removeEventListener('wheel', handleWheel);
  }, [showSection, tryNavigate]);

  const getImgState = (imgIdx: number) => {
    const t = IMG_TRIGGERS[imgIdx];

    if (!t) return 'hidden';
    if (currentIdx >= t.expandAt) return 'expand';
    if (currentIdx >= t.showAt) return 'show';

    return 'hidden';
  };

  // If animation is done but API failed, show retry
  if (phase === 'done' && apiError) {
    return (
      <div className='fixed inset-0 z-[150] flex items-center justify-center overflow-hidden bg-[#f3f3f3]'>
        <div className='text-center'>
          <p className='mb-4 text-sm' style={{ color: '#999' }}>
            Something went wrong. Please try again.
          </p>
          <button
            type='button'
            onClick={handleRetry}
            className='rounded-lg bg-[#1a1a1a] px-6 py-2.5 text-sm text-white transition-opacity hover:opacity-80'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                fontSize: idx === STORY_LINES.length - 1 ? 52 : 44,
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

      {/* Loading spinner after animation done, waiting for API */}
      {phase === 'done' && !apiError && (
        <div className='absolute z-10' style={{ bottom: '15%' }}>
          <div className='h-5 w-5 animate-spin rounded-full border-2 border-black/10 border-t-black' />
        </div>
      )}

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
