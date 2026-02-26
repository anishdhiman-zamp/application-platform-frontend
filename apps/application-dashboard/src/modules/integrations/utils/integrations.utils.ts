import type { IntegrationType } from '@/modules/integrations/types/integrations.types';

/**
 * Filter integrations by search query
 * This runs on the server for SSR
 */
export const filterIntegrations = (integrations: IntegrationType[], searchQuery: string): IntegrationType[] => {
  if (!searchQuery.trim()) {
    return integrations;
  }

  const query = searchQuery.toLowerCase();

  return integrations.filter(
    (integration) =>
      integration.display_name.toLowerCase().includes(query) ||
      integration.what_possible.some((action: string) => action.toLowerCase().includes(query)),
  );
};

/**
 * Split integrations into enabled and available
 * For now, first 4 are considered enabled (placeholder logic)
 */
export const splitIntegrations = (integrations: IntegrationType[]) => {
  return {
    enabled: integrations.slice(0, 4),
    available: integrations.slice(4),
  };
};
