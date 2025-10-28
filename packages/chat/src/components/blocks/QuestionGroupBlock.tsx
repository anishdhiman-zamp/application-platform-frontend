'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

import { QuestionBlockType } from '../../types/block.types';
import { QuestionBlock } from './QuestionBlock';

interface QuestionGroupBlockProps {
  payload: {
    questions: QuestionBlockType[];
  };
}

export const QuestionGroupBlock: React.FC<QuestionGroupBlockProps> = ({ payload }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const totalQuestions = payload.questions.length;

  return (
    <div className='space-y-2'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='flex items-center gap-2 text-gray-700 transition-colors hover:text-gray-900'
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} doubts section`}
      >
        {isExpanded ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
        <span className='f-14-500 font-medium'>Doubts {totalQuestions > 0 ? `1 / ${totalQuestions}` : ''}</span>
      </button>

      {isExpanded && (
        <div className='space-y-2 pl-6'>
          {payload.questions
            .sort((a, b) => a.order - b.order)
            .map((question) => (
              <QuestionBlock key={question.id} payload={question.payload} />
            ))}
        </div>
      )}
    </div>
  );
};
