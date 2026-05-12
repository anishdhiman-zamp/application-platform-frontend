'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type MouseEvent, useCallback, useLayoutEffect, useRef, useState } from 'react';

import { HITL_QUESTIONS_LAYOUT } from './constants';
import { CustomInputRow } from './CustomInputRow';
import { HITLQuestionItem } from './HITLQuestionItem';
import {
  HITLQuestionsContext,
  HITLQuestionsContextActions,
  HITLQuestionsProvider,
  type NavigationDirection,
  useHITLQuestionsContext,
} from './HITLQuestionsContext';
import { HITLQuestionsFooter } from './HITLQuestionsFooter';
import { HITLQuestionsHeader } from './HITLQuestionsHeader';
import type { HITLQuestionsBlockProps } from './types';
import { useHITLKeyboard } from './useHITLKeyboard';

const TRANSITION_DURATION = 0.4;
const TRANSITION_EASE = [0.645, 0.045, 0.355, 1] as const; // ease-in-out-cubic

const slideVariants = {
  enter: (dir: NavigationDirection) => ({ x: dir === 'forward' ? '100%' : '-100%', opacity: 0 }),
  center: { x: '0%', opacity: 1 },
  exit: (dir: NavigationDirection) => ({ x: dir === 'forward' ? '-100%' : '100%', opacity: 0 }),
};

const HITLQuestionsContent = () => {
  const measureRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);

  const ctx = useHITLQuestionsContext();
  const {
    state: { currentQuestion, navigationDirection },
    questions,
    containerRef,
    dispatch,
  } = ctx;
  const prefersReducedMotion = useReducedMotion();

  useHITLKeyboard();

  const handleMouseEnter = useCallback(() => {
    dispatch({ type: HITLQuestionsContextActions.SET_HOVER_VISIBLE, payload: { value: true } });
  }, [dispatch]);

  const handleMouseLeave = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (containerRef.current?.contains(e.relatedTarget as Node | null)) return;
      dispatch({ type: HITLQuestionsContextActions.SET_HOVER_VISIBLE, payload: { value: false } });
    },
    [dispatch, containerRef],
  );

  // Animate `height` (not Motion's `layout`) so the slide transform on children doesn't warp.
  // First measurement is synchronous so the panel mounts at its natural height.
  const observeHeight = useCallback(() => {
    const el = measureRef.current;
    if (!el) return;
    setContainerHeight(el.offsetHeight);
    const observer = new ResizeObserver(([entry]) => setContainerHeight(entry.contentRect.height));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Returned value IS the cleanup (the disconnect closure from observeHeight).
  useLayoutEffect(() => observeHeight(), [observeHeight]);

  if (!questions.length || !currentQuestion) return null;

  const transition = prefersReducedMotion ? { duration: 0 } : { duration: TRANSITION_DURATION, ease: TRANSITION_EASE };

  return (
    <div
      ref={containerRef}
      className='w-full min-w-0 outline-none'
      tabIndex={-1}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className='bg-GRAY_100 shadow-table-filter-menu relative flex w-full flex-col overflow-hidden rounded-3xl'>
        <HITLQuestionsHeader />

        <div className='bg-BG_WHITE shadow-table-filter-menu relative flex flex-col overflow-hidden rounded-3xl border border-gray-300'>
          <motion.div
            initial={false}
            animate={containerHeight === null ? undefined : { height: containerHeight }}
            transition={transition}
            className='relative overflow-hidden'
          >
            <div ref={measureRef}>
              <AnimatePresence mode='popLayout' initial={false} custom={navigationDirection}>
                <motion.div
                  key={currentQuestion.id}
                  custom={navigationDirection}
                  variants={slideVariants}
                  initial='enter'
                  animate='center'
                  exit='exit'
                  transition={transition}
                >
                  {/* Inner Provider snapshots ctx so the exiting slide keeps rendering the previous
                      question's data instead of flashing the new one mid-transition. */}
                  <HITLQuestionsContext.Provider value={ctx}>
                    <div
                      data-hitl-scroll
                      className='overflow-y-auto [scrollbar-width:thin]'
                      style={{ maxHeight: HITL_QUESTIONS_LAYOUT.PANEL_MAX_HEIGHT_PX }}
                    >
                      <HITLQuestionItem />
                    </div>
                  </HITLQuestionsContext.Provider>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <div className='w-full px-1'>
            <CustomInputRow />
          </div>

          <HITLQuestionsFooter />
        </div>
      </div>
    </div>
  );
};

export const HITLQuestionsBlock = (props: HITLQuestionsBlockProps) => (
  <HITLQuestionsProvider {...props}>
    <HITLQuestionsContent />
  </HITLQuestionsProvider>
);
