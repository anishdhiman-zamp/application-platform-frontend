import { captureException } from '@sentry/nextjs';
import { readFile } from 'fs/promises';
import type { IntegrationsDataType, IntegrationType } from 'modules/integrations/integration.types';
import { join } from 'path';
import { IMAGE_PREFIX } from '@/constants/icons';

/**
 * Fetches integrations data from CDN if available, otherwise falls back to local file
 * @returns Promise resolving to an array of integrations
 * @throws Error if both CDN and local file fail to load
 */
export async function fetchIntegrations(): Promise<IntegrationType[]> {
  const cdnUrl = IMAGE_PREFIX;

  // Try fetching from CDN first if available
  if (cdnUrl) {
    try {
      const integrationsUrl = `${cdnUrl}/integrations/integrations.json`;
      const response = await fetch(integrationsUrl, { next: { revalidate: 3600 } });

      if (response.ok) {
        const data: IntegrationsDataType = await response.json();

        return data.integrations;
      }
    } catch (error) {
      // If CDN fetch fails, log error and fall through to local file
      captureException(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error('Failed to fetch integrations from CDN, falling back to local file:', errorMessage, error);
    }
  }

  // Fallback to local file
  try {
    const filePath = join(process.cwd(), 'public', 'integrations', 'integrations.json');
    const fileContents = await readFile(filePath, 'utf-8');
    const data: IntegrationsDataType = JSON.parse(fileContents);

    return data.integrations;
  } catch (error) {
    captureException(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('Failed to load integrations data from local file:', errorMessage, error);
    throw new Error('Failed to load integrations data');
  }
}
