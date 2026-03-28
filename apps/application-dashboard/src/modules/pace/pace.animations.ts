import { type Transition } from 'framer-motion';
import { CHAT_SIDEBAR_STATE, type ChatSidebarState } from 'modules/pace/pace.types';

export const FULLSCREEN_SIDEBAR_SPRING = {
  type: 'spring',
  stiffness: 265,
  damping: 28.4,
  mass: 0.95,
} as const;

export const FULLSCREEN_SIDEBAR_BEZIER = {
  duration: 0.4,
  ease: [0.3, 0, 0.1, 1] as [number, number, number, number],
};

export const COLLAPSED_SIDEBAR_SPRING = {
  type: 'spring',
  stiffness: 428,
  damping: 32.5,
  mass: 0.95,
} as const;

export const COLLAPSED_SIDEBAR_BEZIER = {
  duration: 0.3,
  ease: [0.6, 0, 0.2, 1] as [number, number, number, number],
};

export const TAB_CHANGE_FADE = {
  duration: 0.45,
  ease: 'easeInOut',
} as const;

export const NO_ANIMATION = {
  duration: 0,
} as const;

export const FILES_PANEL_SPACER_TRANSITION = {
  duration: 0.3,
  ease: [0.6, 0, 0.2, 1] as [number, number, number, number],
} as const;

/** Files right sidebar slide-in: cubic-bezier(0, 0, 0.1, 1), 350ms */
export const FILES_PANEL_ENTER_TRANSITION = {
  duration: 0.35,
  ease: [0, 0, 0.1, 1] as [number, number, number, number],
} as const;

/** Files right sidebar slide-out: cubic-bezier(0.3, 0, 1, 1), 250ms */
export const FILES_PANEL_EXIT_TRANSITION = {
  duration: 0.25,
  ease: [0.3, 0, 1, 1] as [number, number, number, number],
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
      return { width: FULLSCREEN_SIDEBAR_BEZIER, opacity: { duration: 0.15, ease: 'easeInOut' } };
    case 'sidebar-to-fullscreen':
      return { width: FULLSCREEN_SIDEBAR_SPRING, opacity: { duration: 0.15, ease: 'easeInOut' } };
    case 'collapsed-to-sidebar':
      return { width: COLLAPSED_SIDEBAR_SPRING, opacity: { duration: 0.15, ease: 'easeInOut' } };
    case 'collapsed-to-expanded':
      return { width: NO_ANIMATION, opacity: { duration: 0.25, ease: 'easeInOut' } };
    case 'sidebar-to-collapsed':
      return { width: COLLAPSED_SIDEBAR_BEZIER, opacity: { duration: 0.15, ease: 'easeOut' } };
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

  switch (key) {
    case `${CHAT_SIDEBAR_STATE.SIDEBAR}->${CHAT_SIDEBAR_STATE.COLLAPSED}`:
      return {
        spacer: COLLAPSED_SIDEBAR_BEZIER,
        collapseIcon: { duration: 0.15, ease: 'easeIn' },
        chatIcon: NO_ANIMATION,
        navItems: { initial: false, transition: NO_ANIMATION },
      };

    case `${CHAT_SIDEBAR_STATE.COLLAPSED}->${CHAT_SIDEBAR_STATE.SIDEBAR}`:
      return {
        spacer: COLLAPSED_SIDEBAR_SPRING,
        collapseIcon: { duration: 0.15, ease: 'easeIn', delay: 0.05 },
        chatIcon: COLLAPSED_SIDEBAR_SPRING,
        navItems: { initial: { opacity: 0 }, transition: COLLAPSED_SIDEBAR_SPRING },
      };

    case `${CHAT_SIDEBAR_STATE.SIDEBAR}->${CHAT_SIDEBAR_STATE.EXPANDED}`:
    case `${CHAT_SIDEBAR_STATE.EXPANDED}->${CHAT_SIDEBAR_STATE.SIDEBAR}`:
      return {
        spacer: NO_ANIMATION,
        collapseIcon: TAB_CHANGE_FADE,
        chatIcon: TAB_CHANGE_FADE,
        navItems: { initial: { opacity: 0 }, transition: TAB_CHANGE_FADE },
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
        collapseIcon: TAB_CHANGE_FADE,
        chatIcon: TAB_CHANGE_FADE,
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
