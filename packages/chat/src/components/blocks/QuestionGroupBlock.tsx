'use client';

import React from 'react';

import { QuestionBlockType } from '../../types/block.types';

interface QuestionGroupBlockProps {
  payload: {
    questions: QuestionBlockType[];
  };
}

export const QuestionGroupBlock: React.FC<QuestionGroupBlockProps> = ({ payload }) => {
  return (
    <div className='f-13-450 space-y-1'>
      {payload?.questions?.map((question, index) => (
        <div key={question?.id} className='flex gap-1'>
          <span>{index + 1}.</span> <span>{question?.payload?.question}</span>
        </div>
      ))}
    </div>
  );
};
