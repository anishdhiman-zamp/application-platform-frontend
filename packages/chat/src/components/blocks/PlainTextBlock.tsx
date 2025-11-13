import React from 'react';

interface PlainTextBlockProps {
  payload: {
    text: string;
  };
}

export const PlainTextBlock: React.FC<PlainTextBlockProps> = ({ payload }) => {
  return (
    <div className='text-gray-1000 f-13-450 text-sm' data-testid='plain-text-block'>
      {payload.text}
    </div>
  );
};
