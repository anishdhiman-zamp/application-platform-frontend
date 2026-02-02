import { captureException } from '@sentry/nextjs';
import { ENVIRONMENT } from '@zamp-platform/api';
import { ENVIRONMENT_TYPES } from '@/constants/common.constants';
import { IMAGE_PREFIX } from '@/constants/icons';
import type { IntegrationsDataType, IntegrationType } from '@/modules/integrations/types/integrations.types';

/**
 * Fetches integrations data from CDN if available
 * @returns Promise resolving to an array of integrations
 * @throws Error if CDN fails to load
 */
export async function fetchIntegrations(): Promise<IntegrationType[]> {
  const cdnUrl = IMAGE_PREFIX;

  try {
    const integrationsUrl =
      ENVIRONMENT === ENVIRONMENT_TYPES.DEVELOPMENT
        ? `${cdnUrl}/integrations/integrations-dev.json`
        : `${cdnUrl}/integrations/integrations.json`;
    const response = await fetch(integrationsUrl, { next: { revalidate: 3600 } });

    if (response.ok) {
      const data: IntegrationsDataType = await response.json();

      return data?.integrations;
    }
  } catch (error) {
    captureException(error);
  }

  return [];
}

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
      integration.what_possible.some((action) => action.toLowerCase().includes(query)),
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
