import type { ReactNode } from 'react';
import { IntegrationsProvider } from '@/modules/integrations/AllIntegrations/Integrations.context';

interface IntegrationsLayoutProps {
  children: ReactNode;
}

export default function IntegrationsLayout({ children }: IntegrationsLayoutProps) {
  return <IntegrationsProvider>{children}</IntegrationsProvider>;
}
