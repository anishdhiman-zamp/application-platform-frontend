import { useEffect, useState } from 'react';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

const useIsDatasetCreationEnabled = () => {
  const { evaluate, ldClient } = useFeatureFlags();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (!ldClient) return;

    evaluate(FEATURE_FLAGS.DATASET_CREATION)
      .then((res: boolean) => {
        setIsEnabled(res);
      })
      .catch(() => {
        setIsEnabled(false);
      });
  }, [evaluate, ldClient]);

  return isEnabled;
};

export default useIsDatasetCreationEnabled;
