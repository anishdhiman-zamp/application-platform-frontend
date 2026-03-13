import React from 'react';

import { useStreamingText } from '../../hooks/useStreamingText';

interface PlainTextBlockProps {
  payload: {
    text: string;
  };
  isStreaming?: boolean;
}

export const PlainTextBlock: React.FC<PlainTextBlockProps> = ({ payload, isStreaming = false }) => {
  const displayedText = useStreamingText(payload.text, isStreaming);

  return (
    <p className='text-gray-1000 f-13-450 wrap-break-word whitespace-pre-wrap' data-testid='plain-text-block'>
      {displayedText}
    </p>
  );
};
