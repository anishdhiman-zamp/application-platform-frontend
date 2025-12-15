// Default animation configurations for FormBuilder

export const DEFAULT_SECTION_ANIMATION = {
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
} as const;

export const DEFAULT_NESTED_ANIMATION = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay: 0.1 },
} as const;

export const DEFAULT_FIELD_ANIMATION = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.2 },
} as const;

// Default stagger delay between sections
export const DEFAULT_STAGGER_CHILDREN = 0.15;
