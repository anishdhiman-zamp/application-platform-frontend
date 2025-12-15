import type { TargetAndTransition, Transition } from 'framer-motion';
import { useMemo } from 'react';

import {
  DEFAULT_FIELD_ANIMATION,
  DEFAULT_NESTED_ANIMATION,
  DEFAULT_SECTION_ANIMATION,
  DEFAULT_STAGGER_CHILDREN,
} from '../constants';

export interface AnimationState {
  initial: TargetAndTransition | undefined;
  animate: TargetAndTransition | undefined;
  exit?: TargetAndTransition | undefined;
  transition: Transition;
}

interface UseFormAnimationReturn {
  sectionAnimation: AnimationState;
  nestedAnimation: AnimationState;
  fieldAnimation: AnimationState;
  getStaggerDelay: (index: number) => number;
}

const DISABLED_ANIMATION: AnimationState = {
  initial: undefined,
  animate: undefined,
  exit: undefined,
  transition: { duration: 0 },
};

/**
 * Hook to manage FormBuilder animations
 * @param animated - Whether animations are enabled (default: true)
 */
export const useFormAnimation = (animated = true): UseFormAnimationReturn => {
  const sectionAnimation = useMemo((): AnimationState => {
    if (!animated) return DISABLED_ANIMATION;
    return {
      initial: DEFAULT_SECTION_ANIMATION.initial as TargetAndTransition,
      animate: DEFAULT_SECTION_ANIMATION.animate as TargetAndTransition,
      transition: DEFAULT_SECTION_ANIMATION.transition,
    };
  }, [animated]);

  const nestedAnimation = useMemo((): AnimationState => {
    if (!animated) return DISABLED_ANIMATION;
    return {
      initial: DEFAULT_NESTED_ANIMATION.initial as TargetAndTransition,
      animate: DEFAULT_NESTED_ANIMATION.animate as TargetAndTransition,
      transition: DEFAULT_NESTED_ANIMATION.transition,
    };
  }, [animated]);

  const fieldAnimation = useMemo((): AnimationState => {
    if (!animated) return DISABLED_ANIMATION;
    return {
      initial: DEFAULT_FIELD_ANIMATION.initial as TargetAndTransition,
      animate: DEFAULT_FIELD_ANIMATION.animate as TargetAndTransition,
      exit: DEFAULT_FIELD_ANIMATION.exit as TargetAndTransition,
      transition: DEFAULT_FIELD_ANIMATION.transition,
    };
  }, [animated]);

  const getStaggerDelay = useMemo(() => {
    return (index: number) => (animated ? index * DEFAULT_STAGGER_CHILDREN : 0);
  }, [animated]);

  return {
    sectionAnimation,
    nestedAnimation,
    fieldAnimation,
    getStaggerDelay,
  };
};
