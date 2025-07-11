'use client';

/*
 * `RevealElement` animates its children into view when the component enters the viewport.
 * It uses Framer Motion's `useInView` to detect visibility and triggers a parent-child
 * staggered animation defined in `REVEAL_ELEMENT_PARENT_MOTION_VARIANTS` and
 * `REVEAL_ELEMENT_CHILD_MOTION_VARIANTS`.
 *
 * Usage:
 * - Wrap any elements inside <RevealElement> to animate them
 * - The animation starts from left to right
 * - The animation is staggered (i.e, revealed one by one) and slower between children
 */

import {
  REVEAL_ELEMENT_CHILD_MOTION_VARIANTS,
  REVEAL_ELEMENT_PARENT_MOTION_VARIANTS,
} from '../../constants/animations.constants';
import { motion, useInView } from 'motion/react';
import { useEffect, useRef, ReactNode, Children, isValidElement, cloneElement, useState, ReactElement } from 'react';

interface RevealElementProps {
  className?: string;
  children: ReactNode;
}

export const RevealElement = ({ className, children }: RevealElementProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });
  const [animate, setAnimate] = useState<'hidden' | 'visible'>('hidden');

  useEffect(() => {
    if (isInView) setAnimate('visible');
  }, [isInView]);

  return (
    <motion.div
      ref={containerRef}
      className={className}
      variants={REVEAL_ELEMENT_PARENT_MOTION_VARIANTS}
      initial='hidden'
      animate={animate}
      data-testid='reveal-element'
      data-animate-state={animate}
    >
      {Children.map(children, (child, idx) => {
        if (!isValidElement(child)) {
          return <span data-testid='non-element-child'>{child}</span>;
        }

        // Create a new props object with the test ID
        const childProps = {
          ...(child.props as React.HTMLAttributes<HTMLElement>),
          'data-testid': `reveal-element-content-${idx}`,
        };

        return (
          <motion.div
            key={child.key ?? `reveal-${idx}`}
            variants={REVEAL_ELEMENT_CHILD_MOTION_VARIANTS}
            className='flex w-auto flex-wrap'
            data-testid='reveal-element-child'
            data-child-index={idx}
          >
            {cloneElement(child as ReactElement<typeof child.props>, childProps)}
          </motion.div>
        );
      })}
    </motion.div>
  );
};
