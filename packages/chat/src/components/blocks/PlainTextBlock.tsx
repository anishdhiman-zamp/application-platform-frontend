import React from 'react';

interface PlainTextBlockProps {
  payload: {
    text: string;
  };
}

export const PlainTextBlock: React.FC<PlainTextBlockProps> = ({ payload }) => {
  return (
    <p className='text-gray-1000 f-13-450 wrap-break-word whitespace-pre-wrap' data-testid='plain-text-block'>
      {payload.text}
    </p>
  );
};
