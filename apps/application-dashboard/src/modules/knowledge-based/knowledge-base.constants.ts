export const kbChatVariants = {
  visible: {
    y: 0,
    scale: 1,
    opacity: 1,
  },
  hidden: {
    y: -100,
    scale: 0.9,
    opacity: 0.3,
  },
};

export const kbContentVariants = {
  visible: {
    y: 0,
    opacity: 1,
    zIndex: 20,
  },
  hidden: {
    y: '100vh',
    opacity: 0,
    zIndex: 20,
  },
};
