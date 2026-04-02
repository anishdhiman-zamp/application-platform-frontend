'use client';

import React from 'react';

import { HITL_QUESTIONS_LAYOUT } from './constants';

export interface HITLQuestionsScrollThumbProps {
  currentQuestionIndex: number;
  questionCount: number;
}

/** Decorative scroll position indicator (content uses native overflow). */
export const HITLQuestionsScrollThumb: React.FC<HITLQuestionsScrollThumbProps> = ({
  currentQuestionIndex,
  questionCount,
}) => {
  const { PANEL_MAX_HEIGHT_PX, BOTTOM_INSET_PX, THUMB_TRACK_TOP_PX, SCROLL_THUMB_HEIGHT_PX, SCROLL_THUMB_WIDTH_PX } =
    HITL_QUESTIONS_LAYOUT;

  const thumbTrackHeightPx = PANEL_MAX_HEIGHT_PX - BOTTOM_INSET_PX - THUMB_TRACK_TOP_PX;
  const thumbTravelPercent = 100 - (SCROLL_THUMB_HEIGHT_PX / thumbTrackHeightPx) * 100;
  const thumbTopPercent = (currentQuestionIndex / Math.max(questionCount - 1, 1)) * thumbTravelPercent;

  return (
    <div
      aria-hidden='true'
      className='pointer-events-none absolute right-1 z-10'
      style={{
        top: THUMB_TRACK_TOP_PX,
        bottom: BOTTOM_INSET_PX,
        width: SCROLL_THUMB_WIDTH_PX,
      }}
    >
      <div
        className='absolute w-full rounded-[9px] bg-gray-300 transition-all duration-300 ease-out'
        style={{
          height: SCROLL_THUMB_HEIGHT_PX,
          top: `${thumbTopPercent}%`,
        }}
      />
    </div>
  );
};
