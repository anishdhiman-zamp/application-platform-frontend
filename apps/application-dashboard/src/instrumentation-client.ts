// Vue feature flags required by @milkdown/crepe (must be set before Vue loads)
// These flags enable tree-shaking in production builds
declare global {
  var __VUE_OPTIONS_API__: boolean;
  var __VUE_PROD_DEVTOOLS__: boolean;
  var __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: boolean;
}
globalThis.__VUE_OPTIONS_API__ = true;
globalThis.__VUE_PROD_DEVTOOLS__ = false;
globalThis.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;

// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { SENTRY_DSN } from 'constants/common.constants';

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

if (environment === 'production') {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Add optional integrations for additional features
    integrations: [Sentry.replayIntegration(), Sentry.browserTracingIntegration()],

    allowUrls: ['zamp.ai'],

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Define how likely Replay events are sampled.
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // Define how likely Replay events are sampled when an error occurs.
    replaysOnErrorSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    dist: process.env.NEXT_PUBLIC_DEPLOY_TARGET,

    environment,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
