'use client';

import { motion, useInView } from 'motion/react';
import { useEffect, useRef, ReactNode, Children, isValidElement, cloneElement, useState } from 'react';

type RevealElementPropsType = {
  className?: string;
  children: ReactNode;
};

const containerMotionVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // slower between children
      when: 'beforeChildren',
    },
  },
};

const itemMotionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6, // slower animation per item
      ease: 'easeOut',
    },
  },
};

export const RevealElement = ({ className, children }: RevealElementPropsType) => {
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
      variants={containerMotionVariants}
      initial='hidden'
      animate={animate}
    >
      {Children.map(children, (child, idx) =>
        isValidElement(child) ? (
          <motion.div
            key={child.key ?? `reveal-${idx}`}
            variants={itemMotionVariants}
            className='flex w-auto flex-wrap'
          >
            {cloneElement(child)}
          </motion.div>
        ) : null,
      )}
    </motion.div>
  );
};
