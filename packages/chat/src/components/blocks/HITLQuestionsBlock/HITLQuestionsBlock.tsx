'use client';

import { AnimatePresence, motion } from 'motion/react';

import { HITL_QUESTIONS_LAYOUT } from './constants';
import { HITLQuestionItem } from './HITLQuestionItem';
import { HITLQuestionsProvider, useHITLQuestionsContext } from './HITLQuestionsContext';
import { HITLQuestionsFooter } from './HITLQuestionsFooter';
import { HITLQuestionsHeader } from './HITLQuestionsHeader';
import type { HITLQuestionsBlockProps } from './types';
import { useHITLKeyboard } from './useHITLKeyboard';

const SLIDE_OFFSET_PX = 32;

const HITLQuestionsContent = () => {
  const {
    state: { currentQuestion },
    questions,
    containerRef,
    questionScrollRef,
    navDirectionRef,
  } = useHITLQuestionsContext();

  useHITLKeyboard();

  if (!questions.length || !currentQuestion) return null;

  return (
    <div ref={containerRef} className='w-full max-w-[659px] outline-none' tabIndex={-1}>
      <div className='bg-GRAY_100 shadow-table-filter-menu relative flex w-full flex-col overflow-hidden rounded-xl'>
        <HITLQuestionsHeader />

        <div className='bg-BG_WHITE shadow-table-filter-menu relative flex flex-col overflow-hidden rounded-xl border border-gray-300'>
          <div className='relative overflow-hidden'>
            <AnimatePresence mode='wait' initial={false}>
              <motion.div
                key={currentQuestion.id}
                initial={{ x: navDirectionRef.current === 'next' ? SLIDE_OFFSET_PX : -SLIDE_OFFSET_PX, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: navDirectionRef.current === 'next' ? -SLIDE_OFFSET_PX : SLIDE_OFFSET_PX, opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
              >
                <div
                  ref={questionScrollRef}
                  className='overflow-y-auto [scrollbar-width:thin]'
                  style={{ maxHeight: HITL_QUESTIONS_LAYOUT.PANEL_MAX_HEIGHT_PX }}
                >
                  <HITLQuestionItem />
                </div>
              </motion.div>
            </AnimatePresence>
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
