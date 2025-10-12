import * as Sentry from '@sentry/nextjs';
import { SENTRY_DSN } from 'constants/common.constants';

if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development')
  Sentry.init({
    dsn: SENTRY_DSN,

    integrations: [Sentry.browserTracingIntegration()],

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
