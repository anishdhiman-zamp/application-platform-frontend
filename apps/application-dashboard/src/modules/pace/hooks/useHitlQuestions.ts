import { useMemo } from 'react';
import type { ConversationInputRequiredItem } from '@zamp-platform/chat';
import { KEYS_DELIMITER } from '@/constants/shortcuts';
import { mapInputsRequiredToHitlQuestions } from '@/modules/pace/components/tasks/task.utils';

export const useHitlQuestions = (inputsRequired: ConversationInputRequiredItem[] | undefined) => {
  const hitlQuestions = useMemo(() => mapInputsRequiredToHitlQuestions(inputsRequired ?? []), [inputsRequired]);

  const hitlQuestionsKey = useMemo(
    () => inputsRequired?.map((i) => i.entity_id).join(KEYS_DELIMITER) ?? '',
    [inputsRequired],
  );

  return { hitlQuestions, hitlQuestionsKey };
};
