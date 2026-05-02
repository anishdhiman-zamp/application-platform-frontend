import { type Transition } from 'framer-motion';
import { CHAT_SIDEBAR_STATE, type ChatSidebarState } from 'modules/pace/pace.types';
import {
  SIDEBAR_DURATION_LONG,
  SIDEBAR_DURATION_SHORT,
  SIDEBAR_EASE,
  SIDEBAR_FULLSCREEN_TRANSITION,
  SIDEBAR_TOGGLE_TRANSITION,
} from '@/utils/animations/sidebar.animations';

export const NO_ANIMATION = {
  duration: 0,
} as const;

export type SidebarTransitionDirection =
  | 'fullscreen-to-sidebar'
  | 'sidebar-to-fullscreen'
  | 'collapsed-to-sidebar'
  | 'collapsed-to-expanded'
  | 'sidebar-to-collapsed'
  | 'expanded-to-collapsed'
  | 'same';

export interface SidebarTransitions {
  width: Transition;
  opacity: Transition;
}

export const getSidebarTransitionDirection = (
  prev: ChatSidebarState,
  current: ChatSidebarState,
): SidebarTransitionDirection => {
  if (prev === current) return 'same';
  if (prev === CHAT_SIDEBAR_STATE.EXPANDED && current === CHAT_SIDEBAR_STATE.SIDEBAR) return 'fullscreen-to-sidebar';
  if (prev === CHAT_SIDEBAR_STATE.SIDEBAR && current === CHAT_SIDEBAR_STATE.EXPANDED) return 'sidebar-to-fullscreen';
  if (prev === CHAT_SIDEBAR_STATE.EXPANDED && current === CHAT_SIDEBAR_STATE.COLLAPSED) return 'expanded-to-collapsed';
  if (prev === CHAT_SIDEBAR_STATE.SIDEBAR && current === CHAT_SIDEBAR_STATE.COLLAPSED) return 'sidebar-to-collapsed';
  if (prev === CHAT_SIDEBAR_STATE.COLLAPSED && current === CHAT_SIDEBAR_STATE.EXPANDED) return 'collapsed-to-expanded';
  if (prev === CHAT_SIDEBAR_STATE.COLLAPSED && current === CHAT_SIDEBAR_STATE.SIDEBAR) return 'collapsed-to-sidebar';

  return 'collapsed-to-sidebar';
};

export const getSidebarTransitions = (direction: SidebarTransitionDirection): SidebarTransitions => {
  switch (direction) {
    case 'fullscreen-to-sidebar':
    case 'sidebar-to-fullscreen':
      return { width: SIDEBAR_FULLSCREEN_TRANSITION, opacity: SIDEBAR_FULLSCREEN_TRANSITION };
    case 'collapsed-to-sidebar':
    case 'sidebar-to-collapsed':
      return { width: SIDEBAR_TOGGLE_TRANSITION, opacity: SIDEBAR_TOGGLE_TRANSITION };
    case 'collapsed-to-expanded':
      return { width: NO_ANIMATION, opacity: SIDEBAR_TOGGLE_TRANSITION };
    case 'expanded-to-collapsed':
      return { width: NO_ANIMATION, opacity: NO_ANIMATION };
    default:
      return { width: NO_ANIMATION, opacity: NO_ANIMATION };
  }
};

export interface NavbarAnimations {
  spacer: Transition;
  collapseIcon: Transition;
  chatIcon: Transition;
  navItems: {
    initial: false | { opacity: number };
    transition: Transition;
  };
}

export const getNavbarAnimations = (prev: ChatSidebarState, current: ChatSidebarState): NavbarAnimations => {
  const key = `${prev}->${current}`;
  const toggle: Transition = { duration: SIDEBAR_DURATION_SHORT, ease: SIDEBAR_EASE };
  const fullscreen: Transition = { duration: SIDEBAR_DURATION_LONG, ease: SIDEBAR_EASE };

  switch (key) {
    case `${CHAT_SIDEBAR_STATE.SIDEBAR}->${CHAT_SIDEBAR_STATE.COLLAPSED}`:
      return {
        spacer: toggle,
        collapseIcon: toggle,
        chatIcon: NO_ANIMATION,
        navItems: { initial: false, transition: NO_ANIMATION },
      };

    case `${CHAT_SIDEBAR_STATE.COLLAPSED}->${CHAT_SIDEBAR_STATE.SIDEBAR}`:
      return {
        spacer: toggle,
        collapseIcon: { ...toggle, delay: 0.05 },
        chatIcon: toggle,
        navItems: { initial: { opacity: 0 }, transition: toggle },
      };

    case `${CHAT_SIDEBAR_STATE.SIDEBAR}->${CHAT_SIDEBAR_STATE.EXPANDED}`:
    case `${CHAT_SIDEBAR_STATE.EXPANDED}->${CHAT_SIDEBAR_STATE.SIDEBAR}`:
      return {
        spacer: NO_ANIMATION,
        collapseIcon: fullscreen,
        chatIcon: fullscreen,
        navItems: { initial: { opacity: 0 }, transition: fullscreen },
      };

    case `${CHAT_SIDEBAR_STATE.EXPANDED}->${CHAT_SIDEBAR_STATE.COLLAPSED}`:
      return {
        spacer: NO_ANIMATION,
        collapseIcon: NO_ANIMATION,
        chatIcon: NO_ANIMATION,
        navItems: { initial: false, transition: NO_ANIMATION },
      };

    case `${CHAT_SIDEBAR_STATE.COLLAPSED}->${CHAT_SIDEBAR_STATE.EXPANDED}`:
      return {
        spacer: NO_ANIMATION,
        collapseIcon: fullscreen,
        chatIcon: fullscreen,
        navItems: { initial: false, transition: NO_ANIMATION },
      };

    default:
      return {
        spacer: NO_ANIMATION,
        collapseIcon: NO_ANIMATION,
        chatIcon: NO_ANIMATION,
        navItems: { initial: false, transition: NO_ANIMATION },
      };
  }
};
