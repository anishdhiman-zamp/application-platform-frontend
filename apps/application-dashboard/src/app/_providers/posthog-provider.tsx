'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { initializePostHog } from '@/utils/postHog';

export default function PostHogProviderWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && !(posthog as any).__loaded) {
      initializePostHog();
      (posthog as any).__loaded = true;
    }
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
