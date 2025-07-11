export const REVEAL_ELEMENT_PARENT_MOTION_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // slower between children
      when: 'beforeChildren',
    },
  },
};

export const REVEAL_ELEMENT_CHILD_MOTION_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6, // slower animation per item
      ease: 'easeOut',
    },
  },
};
