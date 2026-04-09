'use client';

import { cn } from '@zamp-platform/ui/utils';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useId, useMemo, useState } from 'react';

import {
  HITL_RESPONSE_TYPE,
  type InputsRespondedAnswer,
  type InputsRespondedItemPayload,
} from '../../types/block.types';

const SKIPPED_DISPLAY = 'Prefer to skip';

const freeTextLooksSkipped = (freeText: string): boolean => {
  const t = freeText.trim().toLowerCase();
  return t === '' || t === 'no preference' || t.includes('no preference');
};

const isSkippedResponse = (response: InputsRespondedAnswer): boolean => {
  if (response.type === HITL_RESPONSE_TYPE.FREE_TEXT) {
    return freeTextLooksSkipped(response.free_text);
  }
  if (response.type === HITL_RESPONSE_TYPE.TEXT) {
    return response.is_skipped === true || !response.text?.trim();
  }
  return response.is_skipped === true;
};

const getResponseDisposition = (response: InputsRespondedAnswer): 'answered' | 'skipped' => {
  switch (response.type) {
    case HITL_RESPONSE_TYPE.APPROVAL:
      return response.is_skipped ? 'skipped' : 'answered';
    case HITL_RESPONSE_TYPE.SELECT_ONE: {
      if (response.is_skipped) return 'skipped';
      const hasAnswer =
        (response.selected_option != null && response.selected_option !== '') || Boolean(response.custom_input?.trim());
      return hasAnswer ? 'answered' : 'skipped';
    }
    case HITL_RESPONSE_TYPE.MULTIPLE_CHOICE: {
      if (response.is_skipped) return 'skipped';
      return (response.selected_options?.length ?? 0) > 0 ? 'answered' : 'skipped';
    }
    case HITL_RESPONSE_TYPE.TEXT: {
      if (response.is_skipped) return 'skipped';
      return response.text?.trim() ? 'answered' : 'skipped';
    }
    case HITL_RESPONSE_TYPE.FREE_TEXT:
      return freeTextLooksSkipped(response.free_text) ? 'skipped' : 'answered';
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

/** Short label for the collapsed card header (aggregate of how many prompts were answered vs skipped). */
const formatSummaryLabel = (answered: number, skipped: number): string => {
  const parts: string[] = [];
  if (answered > 0) {
    parts.push(`${answered} answered`);
  }
  if (skipped > 0) {
    parts.push(`${skipped} skipped`);
  }
  if (parts.length === 0) {
    return 'Responses';
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return `${parts[0]} and ${parts[1]}`;
};

const formatAnswerLine = (item: InputsRespondedItemPayload): string => {
  const { response, input_required } = item;

  if (isSkippedResponse(response)) {
    return SKIPPED_DISPLAY;
  }

  switch (response.type) {
    case HITL_RESPONSE_TYPE.APPROVAL:
      return response.approved ? 'Approved' : 'Rejected';
    case HITL_RESPONSE_TYPE.SELECT_ONE: {
      const opts = input_required.options ?? [];
      const custom = response.custom_input?.trim();
      if (custom) {
        return custom;
      }
      if (response.selected_option != null && response.selected_option !== '') {
        const opt = opts.find((o) => o.id === response.selected_option);
        return opt?.title ?? opt?.label ?? response.selected_option;
      }
      return '';
    }
    case HITL_RESPONSE_TYPE.MULTIPLE_CHOICE: {
      const opts = input_required.options ?? [];
      const labels = (response.selected_options ?? []).map((id) => {
        const opt = opts.find((o) => o.id === id);
        return opt?.title ?? opt?.label ?? id;
      });
      const base = labels.join(', ');
      const extra = response.custom_input?.trim();
      if (extra) {
        return base ? `${base} — ${extra}` : extra;
      }
      return base;
    }
    case HITL_RESPONSE_TYPE.TEXT:
      return response.text;
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

const SHELL_CLASS = 'box-border w-full min-w-0 overflow-hidden rounded-xl bg-GRAY_100 ';

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
          className='bg-BG_WHITE shadow-table-filter-menu max-h-[250px] w-full min-w-0 overflow-y-auto rounded-[18px] rounded-b-xl border border-gray-400'
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
    <div className='bg-BG_WHITE relative mt-4 mb-3 w-full min-w-0 self-stretch'>
      <div className='flex w-full min-w-0 items-start gap-2 pt-1 pb-1'>
        <div className='w-full min-w-0 flex-1'>{card}</div>
      </div>
    </div>
  );
};
