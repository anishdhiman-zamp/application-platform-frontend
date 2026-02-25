import { ENVIRONMENT, ENVIRONMENT_TYPES } from '@/constants/common.constants';
import type { IntegrationType } from '@/modules/integrations/types/integrations.types';

const INTEGRATIONS_PRODUCTION: IntegrationType[] = [
  {
    id: 'internal_email_forwarding',
    display_name: 'Email Forwarding',
    logo: '/integrations/logos/mail.svg',
    what_possible: [],
    guide: '',
    auth: '/integrations/auth/cloudflare.json',
    events: [{ id: 'enable_email_routing_rule', display_name: 'Email Forwarding' }],
  },
  {
    id: 'oracle',
    display_name: 'Oracle',
    logo: '/integrations/logos/oracle.svg',
    what_possible: [],
    guide: '',
  },
  {
    id: 'coupa',
    display_name: 'Coupa',
    logo: '/integrations/logos/coupa.svg',
    what_possible: [],
    guide: '',
  },
  {
    id: 'slack',
    display_name: 'Slack',
    logo: '/integrations/logos/slack.svg',
    what_possible: [
      'Send message',
      'Send alert',
      'Get channels',
      'Create channel',
      'Get users',
      'Upload file',
      'Add reaction',
      'Post to thread',
      'Schedule message',
      'Update message',
    ],
    guide: '/integrations/guides/slack.md',
  },
];

const INTEGRATIONS_DEVELOPMENT: IntegrationType[] = [
  {
    id: 'internal_email_forwarding',
    display_name: 'Email Forwarding',
    logo: '/integrations/logos/mail.svg',
    what_possible: [],
    guide: '',
    auth: '/integrations/auth/cloudflare-dev.json',
    events: [{ id: 'enable_email_routing_rule', display_name: 'Email Forwarding' }],
  },
  {
    id: 'oracle',
    display_name: 'Oracle',
    logo: '/integrations/logos/oracle.svg',
    what_possible: [],
    guide: '',
  },
  {
    id: 'coupa',
    display_name: 'Coupa',
    logo: '/integrations/logos/coupa.svg',
    what_possible: [],
    guide: '',
  },
  {
    id: 'slack',
    display_name: 'Slack',
    logo: '/integrations/logos/slack.svg',
    what_possible: [
      'Send message',
      'Send alert',
      'Get channels',
      'Create channel',
      'Get users',
      'Upload file',
      'Add reaction',
      'Post to thread',
      'Schedule message',
      'Update message',
    ],
    guide: '/integrations/guides/slack.md',
  },
];

/**
 * Returns integrations data based on current environment.
 * Uses constants instead of fetch for faster, deterministic loading.
 */
export function getIntegrations(): IntegrationType[] {
  return ENVIRONMENT === ENVIRONMENT_TYPES.DEVELOPMENT ? INTEGRATIONS_DEVELOPMENT : INTEGRATIONS_PRODUCTION;
}
