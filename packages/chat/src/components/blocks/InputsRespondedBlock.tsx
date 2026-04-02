'use client';

import { cn } from '@zamp-platform/ui/utils';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useId, useMemo, useState } from 'react';

import {
  HITL_RESPONSE_TYPE,
  type InputsRespondedAnswer,
  type InputsRespondedItemPayload,
} from '../../types/block.types';

const freeTextLooksSkipped = (freeText: string): boolean => {
  const t = freeText.trim().toLowerCase();
  return t === '' || t === 'no preference' || t.includes('no preference');
};

const isSkippedResponse = (response: InputsRespondedAnswer): boolean => {
  return response.type === HITL_RESPONSE_TYPE.FREE_TEXT && freeTextLooksSkipped(response.free_text);
};

const getResponseDisposition = (response: InputsRespondedAnswer): 'answered' | 'skipped' => {
  switch (response.type) {
    case HITL_RESPONSE_TYPE.FREE_TEXT:
      return freeTextLooksSkipped(response.free_text) ? 'skipped' : 'answered';
    case HITL_RESPONSE_TYPE.APPROVAL:
      return 'answered';
    case HITL_RESPONSE_TYPE.SELECT_ONE:
      return response.selected_option?.length ? 'answered' : 'skipped';
    default: {
      const _exhaustive: never = response;
      return _exhaustive;
    }
  }
};

const summarizeResponses = (responses: InputsRespondedItemPayload[]): { answered: number; skipped: number } => {
  let answered = 0;
  let skipped = 0;
  for (const item of responses) {
    switch (getResponseDisposition(item.response)) {
      case 'answered':
        answered += 1;
        break;
      case 'skipped':
        skipped += 1;
        break;
    }
  }
  return { answered, skipped };
};

const formatSummaryLabel = (answered: number, skipped: number): string => {
  const answeredPart = answered === 1 ? '1 answered' : `${answered} answered`;
  const skippedPart = skipped === 1 ? '1 skipped' : `${skipped} skipped`;
  return `${answeredPart} and ${skippedPart}`;
};

const formatAnswerLine = (item: InputsRespondedItemPayload): string => {
  const { response, input_required } = item;

  if (isSkippedResponse(response)) {
    return 'No preference, Question was skipped';
  }

  switch (response.type) {
    case HITL_RESPONSE_TYPE.APPROVAL:
      return response.approved ? 'Approved' : 'Rejected';
    case HITL_RESPONSE_TYPE.SELECT_ONE: {
      const opts = input_required.options ?? [];
      const opt = opts.find((o) => o.id === response.selected_option);
      return opt?.title ?? opt?.label ?? response.selected_option;
    }
    case HITL_RESPONSE_TYPE.FREE_TEXT:
      return response.free_text;
    default: {
      const _exhaustive: never = response;
      return _exhaustive;
    }
  }
};

export interface InputsRespondedBlockProps {
  payload: {
    responses: InputsRespondedItemPayload[];
  };
  showConnectorFromPrevious?: boolean;
  showConnectorToNext?: boolean;
}

const SHELL_CLASS =
  'box-border w-full min-w-0 overflow-hidden rounded-xl bg-GRAY_50 shadow-[1px_2px_10px_0px_rgba(166,166,166,0.1)]';

export const InputsRespondedBlock: React.FC<InputsRespondedBlockProps> = ({
  payload,
  showConnectorFromPrevious = false,
  showConnectorToNext = false,
}) => {
  const { responses } = payload;
  const [isOpen, setIsOpen] = useState(true);
  const panelId = useId();
  const triggerId = `${panelId}-trigger`;
  const regionId = `${panelId}-panel`;

  const { answered, skipped } = useMemo(() => summarizeResponses(responses), [responses]);
  const summaryText = useMemo(() => formatSummaryLabel(answered, skipped), [answered, skipped]);

  if (!responses.length) {
    return null;
  }

  const ChevronIcon = isOpen ? ChevronUp : ChevronDown;

  const card = (
    <div className={SHELL_CLASS}>
      <button
        type='button'
        aria-expanded={isOpen}
        aria-controls={regionId}
        id={triggerId}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          'flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 bg-transparent px-2.5 py-2 text-left select-none',
          'border-0 transition-opacity hover:opacity-90',
          'focus-visible:ring-GRAY_500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        )}
      >
        <div className='flex min-w-0 flex-1 items-center gap-1.5'>
          <CheckCircle2 className='text-GRAY_900 size-3.5 shrink-0' strokeWidth={1.25} aria-hidden />
          <span className='f-12-450 text-GRAY_900 min-w-0 truncate'>{summaryText}</span>
        </div>
        <ChevronIcon className='text-GRAY_900 size-3.5 shrink-0' strokeWidth={1.5} aria-hidden />
      </button>
      {isOpen ? (
        <div
          id={regionId}
          role='region'
          aria-labelledby={triggerId}
          className='bg-BG_WHITE shadow-table-filter-menu w-full min-w-0 rounded-[18px] rounded-b-xl border border-gray-400'
        >
          <div className='divide-GRAY_400 divide-y'>
            {responses.map((item, index) => (
              <div key={`${item.entity_id}-${index}`} className='flex flex-col gap-0.5 px-3.5 py-3.5'>
                <p className='f-13-450 text-GRAY_700 leading-normal whitespace-pre-wrap'>
                  {item?.input_required?.question}
                </p>
                <div className='flex flex-col gap-0.5'>
                  <div className='flex flex-col justify-center py-1.5'>
                    <p className='f-14-500 text-GRAY_1000 leading-[1.4] whitespace-pre-wrap'>
                      {formatAnswerLine(item)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );

  const useTimelineRail = showConnectorFromPrevious || showConnectorToNext;

  if (!useTimelineRail) {
    return card;
  }

  return (
    <div className='relative mt-2 w-full min-w-0 self-stretch'>
      {showConnectorFromPrevious && (
        <div className='bg-border pointer-events-none absolute -top-1 left-[6.5px] z-0 h-2 w-px' />
      )}
      <div className='flex w-full min-w-0 items-start gap-2 pt-2 pb-1'>
        <div className='w-full min-w-0 flex-1'>{card}</div>
      </div>
    </div>
  );
};
