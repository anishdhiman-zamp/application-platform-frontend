import { createElement } from 'react';
import { MenuNode } from '@zamp-platform/ui';
import { Zap } from 'lucide-react';
import { IMAGE_PREFIX } from '@/constants/icons';
import type { IntegrationType } from '@/modules/integrations/types/integrations.types';

/**
 * Builds a MenuNode structure from integrations data
 * Uses metadata to store the full integration object for easy access
 * Adds iconSrc from integration.logo for image-based icons
 */
export const buildMenuFromIntegrations = (integrations: IntegrationType[]): MenuNode => {
  // Single loop to categorize integrations and build menu nodes
  const integrationChildren: MenuNode[] = [];
  const comingSoonIntegrations: MenuNode[] = [];

  integrations.forEach((integration) => {
    const hasEvents = integration.events && integration.events.length > 0;

    if (hasEvents) {
      // Build children for event-based integrations
      const events = integration.events || [];
      const hasSingleEvent = events.length === 1;

      // If there's only one event, auto-select it by making the integration node act as the event
      if (hasSingleEvent) {
        const event = events[0];

        integrationChildren.push({
          id: event.id, // Use event id so it works as if the event was clicked
          label: integration.display_name,
          // No children - clicking will directly select the event
          isHoverActionEnabled: true,
          // Add iconSrc from integration.logo if available
          ...(integration.logo && { iconSrc: `${IMAGE_PREFIX}${integration.logo}` }),
          // Store both integration and event in metadata
          metadata: {
            integration,
            event,
          },
        });
      } else {
        // Build event children for integrations with multiple events
        const eventChildren: MenuNode[] = events.map((event) => ({
          id: event.id,
          label: event.display_name,
          // Store the full integration and event data in metadata
          metadata: {
            integration,
            event,
          },
        }));

        integrationChildren.push({
          id: integration.id,
          label: integration.display_name,
          children: eventChildren.length > 0 ? eventChildren : undefined,
          backText: `${integration.display_name} events`,
          isHoverActionEnabled: true,
          // Add iconSrc from integration.logo if available
          ...(integration.logo && { iconSrc: `${IMAGE_PREFIX}${integration.logo}` }),
          // Store the full integration object in metadata
          metadata: {
            integration,
          },
        });
      }
    } else {
      // Integrations without events are marked as "coming soon" (disabled)
      comingSoonIntegrations.push({
        id: `${integration.id}-coming-soon`,
        label: integration.display_name,
        disabled: true,
        rightText: 'Coming soon',
        metadata: {
          integration,
        },
        ...(integration.logo && { iconSrc: `${IMAGE_PREFIX}${integration.logo}` }),
        isHoverActionEnabled: false,
      });
    }
  });

  return {
    id: 'root',
    label: 'Menu',
    children: [
      {
        id: 'event-based-trigger',
        label: 'Event-based trigger',
        children: [...integrationChildren, ...comingSoonIntegrations],
        backText: 'Connect an app',
        description: 'Runs when an event occurs',
        icon: createElement(Zap),
      },
    ],
  };
};
