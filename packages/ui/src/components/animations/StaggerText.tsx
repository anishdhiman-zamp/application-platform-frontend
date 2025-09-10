'use client';

import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'motion/react';
import { type FC } from 'react';

interface StaggeredTextPropsType {
  text: string;
  className?: string;
  delay?: number;
  showAnimation?: boolean;
  onStaggerAnimationComplete?: () => void;
}

export const StaggerText: FC<StaggeredTextPropsType> = ({
  text,
  className = '',
  delay = 0,
  showAnimation = true,
  onStaggerAnimationComplete,
}) => {
  // Split text into words and then into letters while preserving word boundaries
  const words = text.split(' ');
  const staggerRatePerLetter = 0.005;

  let letterIndex = 0;
  const wordsWithLetters = words.map((word) => {
    const letters = word.split('').map((letter, i) => ({
      letter,
      globalIndex: letterIndex + i,
    }));
    letterIndex += word.length + 1; // +1 for the space
    return { word, letters };
  });

  const totalLetters = text.replace(/ /g, '').length; // Total letters excluding spaces

  const variants = {
    hidden: { opacity: 0, y: 0 },
    show: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: showAnimation ? delay + i * staggerRatePerLetter : 0,
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    }),
  };

  return (
    <motion.div
      initial='hidden'
      animate={showAnimation ? 'show' : 'hidden'}
      className={cn('text-GRAY_1000 break-words', className)}
      data-testid='stagger-text-container'
      data-state={showAnimation ? 'show' : 'hidden'}
    >
      {wordsWithLetters.map((wordData, wordIndex) => (
        <span key={`word-${wordIndex}`} className='inline-block'>
          {wordData.letters.map((letterData) => (
            <motion.span
              key={`${letterData.letter}-${letterData.globalIndex}`}
              custom={letterData.globalIndex}
              variants={variants}
              className='inline-block'
              data-testid='stagger-letter'
              onAnimationComplete={letterData.globalIndex === totalLetters - 1 ? onStaggerAnimationComplete : undefined}
            >
              {letterData.letter}
            </motion.span>
          ))}
          {/* Add a space between words to avoid text from sticking together */}
          {wordIndex < wordsWithLetters.length - 1 && <span className='inline-block'>&nbsp;</span>}
        </span>
      ))}
    </motion.div>
  );
};
