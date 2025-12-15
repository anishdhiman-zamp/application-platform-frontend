import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

const useIsFeedbackEnabled = () => {
  const params = useParams<{ processId: string }>();
  const processId = params?.processId;

  const { evaluate, ldClient } = useFeatureFlags();
  const [isFeedbackEnabled, setIsFeedbackEnabled] = useState(false);

  useEffect(() => {
    if (ldClient) {
      evaluate(FEATURE_FLAGS.DISABLE_FEEDBACK)
        .then((res: string[]) => {
          setIsFeedbackEnabled(Boolean(res?.length && !res.includes(processId ?? '')));
        })
        .catch(() => {
          setIsFeedbackEnabled(false);
        });
    }
  }, [evaluate, ldClient, processId]);

  return isFeedbackEnabled;
};

export default useIsFeedbackEnabled;
