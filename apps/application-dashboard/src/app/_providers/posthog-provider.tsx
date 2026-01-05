'use client';

import { useEffect } from 'react';
import posthogJs from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { initializePostHog } from '@/utils/postHog';

export default function PostHogProviderWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && !(posthogJs as any).__loaded) {
      initializePostHog();
      (posthogJs as any).__loaded = true;
    }
  }, []);

  return <PostHogProvider client={posthogJs}>{children}</PostHogProvider>;
}
