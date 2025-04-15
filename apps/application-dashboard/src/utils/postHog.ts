import posthogJs from 'posthog-js';

export const initializePostHog = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
    // checks that we are client-side
    try {
      posthogJs.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '', {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'always', // or 'identified_only' to create profiles for identified users
        session_recording: {
          maskTextSelector: '.sensitive', // masks all elements with the class "sensitive". This does not apply to input elements.
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

export const identifyPostHogUser = (userId: string, merchantName?: string) => {
  posthogJs.identify(userId);

  posthogJs.people.set({
    id: userId,
    merchant: merchantName,
  });
};

export const resetPostHog = () => {
  posthogJs.stopSessionRecording();
  posthogJs.reset();
};
