'use client';

import { ShimmerText } from '@zamp-platform/ui';
import { AnimatePresence, motion } from 'motion/react';
import React, { FC } from 'react';

interface StatusLabelProps {
  isComplete: boolean;
  loadingText: string;
  completedText: string;
  className?: string;
}

/**
 * A reusable component for displaying animated status transitions.
 * Shows a shimmer animation while loading, then transitions to completed text.
 * Used in thinking blocks and tool call blocks.
 */
export const StatusLabel: FC<StatusLabelProps> = ({
  isComplete,
  loadingText,
  completedText,
  className = 'f-12-450 text-GRAY_900 text-left',
}) => {
  return (
    <AnimatePresence mode='wait' initial={false}>
      {!isComplete ? (
        <div key='loading'>
          <ShimmerText text={loadingText} autoAnimate={true} />
        </div>
      ) : (
        <motion.span
          key='completed'
          className={className}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {completedText}
        </motion.span>
      )}
    </AnimatePresence>
  );
};
