import posthogJs from 'posthog-js';

export const initializePostHog = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
    // checks that we are client-side
    try {
      posthogJs.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '', {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'always', // or 'identified_only' to create profiles for identified users
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: '*',
        },
      });
    } catch (error) {
      console.error('Error initializing PostHog:', error);
    }
    window.addEventListener('beforeunload', function () {
      // Stop the session recording before the user leaves the page
      posthogJs.stopSessionRecording();
    });
  }
};

export const identifyPostHogUser = (
  userId: string,
  merchantName: string,
  organizationId?: string,
  organizationName?: string,
) => {
  const personProperties = {
    id: userId,
    merchant: merchantName, // Email domain only (no PII)
  };

  // Identify user with UUID and merchant (email domain)
  // Note: identify() already sets person properties via $set, so people.set() below is redundant
  // but we maintain the existing codebase pattern for consistency
  posthogJs.identify(userId, personProperties);

  // Set person properties explicitly (redundant but matches existing pattern)
  posthogJs.people.set(personProperties);

  // Set organization group if provided
  if (organizationId && organizationName) {
    posthogJs.group('company', organizationId, {
      name: organizationName,
    });
  }
};

export const resetPostHog = () => {
  posthogJs.stopSessionRecording();
  posthogJs.reset();
};
