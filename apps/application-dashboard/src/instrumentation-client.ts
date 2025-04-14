import * as Sentry from '@sentry/nextjs';
import { browserTracingIntegration, replayIntegration } from '@sentry/nextjs';
import { SENTRY_DSN } from 'constants/common.constants';

export const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT;

if (ENVIRONMENT === 'production') {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    release: process.env.NEXT_PUBLIC_ENVIRONMENT,
    allowUrls: ['zamp.ai'],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      browserTracingIntegration(),
      replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
}
