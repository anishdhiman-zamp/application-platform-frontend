import { type Transition } from 'framer-motion';

// Ease-out (cubic). Entering/exiting elements should accelerate at the start
// and settle in — this is the curve sidebars and drawers want. Single shared
// curve so width on the outer column and transform/opacity on the inner
// content start and stop at the same visual pace (paired-elements rule).
export const SIDEBAR_EASE = [0.215, 0.61, 0.355, 1] as const;

// Frequent toggles should feel instant; reserve the longer band for the
// fullscreen transition where the sidebar travels across the whole viewport.
export const SIDEBAR_DURATION_SHORT = 0.2;
export const SIDEBAR_DURATION_LONG = 0.3;

export const SIDEBAR_TOGGLE_TRANSITION: Transition = {
  duration: SIDEBAR_DURATION_SHORT,
  ease: SIDEBAR_EASE,
};

export const SIDEBAR_FULLSCREEN_TRANSITION: Transition = {
  duration: SIDEBAR_DURATION_LONG,
  ease: SIDEBAR_EASE,
};
