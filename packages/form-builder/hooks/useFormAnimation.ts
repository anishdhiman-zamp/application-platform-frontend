import type { TargetAndTransition, Transition } from 'framer-motion';
import { useMemo } from 'react';

import {
  DEFAULT_FIELD_ANIMATION,
  DEFAULT_NESTED_ANIMATION,
  DEFAULT_SECTION_ANIMATION,
  DEFAULT_STAGGER_CHILDREN,
} from '../constants';
import { FormBuilderAnimationConfig } from '../types';

export interface AnimationState {
  initial: TargetAndTransition | undefined;
  animate: TargetAndTransition | undefined;
  exit?: TargetAndTransition | undefined;
  transition: Transition;
}

interface UseFormAnimationReturn {
  isAnimationDisabled: boolean;
  sectionAnimation: AnimationState;
  nestedAnimation: AnimationState;
  fieldAnimation: AnimationState;
  getStaggerDelay: (index: number) => number;
}

/**
 * Hook to manage FormBuilder animations based on animationConfig
 * Provides computed animation states for sections, nested sections, and fields
 */
export const useFormAnimation = (animationConfig?: FormBuilderAnimationConfig): UseFormAnimationReturn => {
  const isAnimationDisabled = animationConfig?.disabled ?? false;

  const sectionAnimation = useMemo((): AnimationState => {
    if (isAnimationDisabled) {
      return {
        initial: undefined,
        animate: undefined,
        transition: { duration: 0 },
      };
    }
    return {
      initial: (animationConfig?.section?.initial ?? DEFAULT_SECTION_ANIMATION.initial) as TargetAndTransition,
      animate: (animationConfig?.section?.animate ?? DEFAULT_SECTION_ANIMATION.animate) as TargetAndTransition,
      transition: {
        ...DEFAULT_SECTION_ANIMATION.transition,
        ...animationConfig?.section?.transition,
      },
    };
  }, [animationConfig?.section, isAnimationDisabled]);

  const nestedAnimation = useMemo((): AnimationState => {
    if (isAnimationDisabled) {
      return {
        initial: undefined,
        animate: undefined,
        transition: { duration: 0 },
      };
    }
    return {
      initial: (animationConfig?.section?.initial ?? DEFAULT_NESTED_ANIMATION.initial) as TargetAndTransition,
      animate: (animationConfig?.section?.animate ?? DEFAULT_NESTED_ANIMATION.animate) as TargetAndTransition,
      transition: {
        ...DEFAULT_NESTED_ANIMATION.transition,
        ...animationConfig?.section?.transition,
      },
    };
  }, [animationConfig?.section, isAnimationDisabled]);

  const fieldAnimation = useMemo((): AnimationState => {
    if (isAnimationDisabled) {
      return {
        initial: undefined,
        animate: undefined,
        exit: undefined,
        transition: { duration: 0 },
      };
    }
    return {
      initial: (animationConfig?.field?.initial ?? DEFAULT_FIELD_ANIMATION.initial) as TargetAndTransition,
      animate: (animationConfig?.field?.animate ?? DEFAULT_FIELD_ANIMATION.animate) as TargetAndTransition,
      exit: (animationConfig?.field?.exit ?? DEFAULT_FIELD_ANIMATION.exit) as TargetAndTransition,
      transition: {
        ...DEFAULT_FIELD_ANIMATION.transition,
        ...animationConfig?.field?.transition,
      },
    };
  }, [animationConfig?.field, isAnimationDisabled]);

  const getStaggerDelay = useMemo(() => {
    const staggerDelay = animationConfig?.section?.transition?.staggerChildren ?? DEFAULT_STAGGER_CHILDREN;
    return (index: number) => (isAnimationDisabled ? 0 : index * staggerDelay);
  }, [animationConfig?.section?.transition?.staggerChildren, isAnimationDisabled]);

  return {
    isAnimationDisabled,
    sectionAnimation,
    nestedAnimation,
    fieldAnimation,
    getStaggerDelay,
  };
};
