import { ROUTES_PATH } from '@/constants/routeConfig';

export interface LayoutConfig {
  showTopbar: boolean;
  showSidebar: boolean;
}

type RoutePattern = string;

// Define layout configurations for different route patterns
// Order matters: more specific routes should come first
const LAYOUT_CONFIGS: [RoutePattern, LayoutConfig][] = [
  [ROUTES_PATH.SETTINGS, { showTopbar: false, showSidebar: true }],
  [ROUTES_PATH.MACS, { showTopbar: false, showSidebar: false }],
];

const DEFAULT_CONFIG: LayoutConfig = {
  showTopbar: true,
  showSidebar: true,
};

/**
 * Get layout configuration based on the current pathname
 * Matches routes by prefix to handle nested routes
 */
export const getLayoutConfig = (pathname: string): LayoutConfig => {
  for (const [route, config] of LAYOUT_CONFIGS) {
    if (pathname.startsWith(route)) {
      return config;
    }
  }

  return DEFAULT_CONFIG;
};
