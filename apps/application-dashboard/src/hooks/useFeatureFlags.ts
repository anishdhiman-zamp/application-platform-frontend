import { FEATURE_FLAGS } from 'constants/featureFlags';
import { useLDClient } from 'launchdarkly-react-client-sdk';

export const useFeatureFlags = () => {
  const ldClient = useLDClient();

  return {
    evaluate: async (flag: FEATURE_FLAGS) => {
      try {
        const isEnabled = ldClient?.variation(flag, false);

        return isEnabled;
      } catch (error) {
        console.error('Error evaluating feature flag', error);

        return false;
      }
    },
    ldClient,
  };
};
