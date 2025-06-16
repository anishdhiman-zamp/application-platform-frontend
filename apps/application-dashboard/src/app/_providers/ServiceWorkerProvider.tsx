'use client';

import { ReactNode } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

interface ServiceWorkerProviderProps {
  children: ReactNode;
}

export const ServiceWorkerProvider = ({ children }: ServiceWorkerProviderProps) => {
  useServiceWorker();

  return <>{children}</>;
};

export default ServiceWorkerProvider;
