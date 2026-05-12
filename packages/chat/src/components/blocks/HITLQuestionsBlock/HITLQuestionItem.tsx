'use client';

import { MarkdownBlock } from '../../../..';
import { useHITLQuestionsContext } from './HITLQuestionsContext';
import { SelectQuestionBody } from './SelectQuestionBody';

export const HITLQuestionItem = () => {
  const { state, questions } = useHITLQuestionsContext();
  const { currentQuestion, currentQuestionIndex } = state;

  return (
    <div className='relative w-full shrink-0'>
      <div className='flex w-full items-center justify-center px-4 pt-4.5 pb-2.5'>
        <div className='text-GRAY_1000 f-14-450 flex flex-1 items-baseline gap-2'>
          {questions.length > 1 && <span className='shrink-0'>{currentQuestionIndex + 1}.</span>}
          <div className='min-w-0 flex-1'>
            <MarkdownBlock
              fontClassName='text-GRAY_1000 font-[450]'
              payload={{ text: currentQuestion?.question || currentQuestion?.text || '' }}
            />
          </div>
        </div>
      </div>

      <div className='w-full px-1'>
        <SelectQuestionBody />
      </div>
    </div>
  );
};
