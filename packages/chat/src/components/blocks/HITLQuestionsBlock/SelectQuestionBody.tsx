'use client';

import React from 'react';

import { CUSTOM_OPTION_ID } from './constants';
import { CustomInputRow } from './CustomInputRow';
import { OptionRow } from './OptionRow';
import type { HITLQuestionWithEntity } from './types';
import { isMultipleChoiceQuestion, optionCountForQuestion } from './utils';

const getSingleSelectBadge = (index: number): string =>
  index < 26 ? String.fromCharCode(65 + index) : String(index + 1);

interface SelectQuestionBodyProps {
  question: HITLQuestionWithEntity;
  isFocused: boolean;
  focusedOptionIndex: number;
  selectedOptionIds: string[];
  customInputValue: string;
  customInputRef: React.RefObject<HTMLInputElement | null>;
  onOptionClick: (optionId: string) => void;
  onCustomInputClick: () => void;
  onCustomInputChange: (value: string) => void;
}

export const SelectQuestionBody = ({
  question,
  isFocused,
  focusedOptionIndex,
  selectedOptionIds,
  customInputValue,
  customInputRef,
  onOptionClick,
  onCustomInputClick,
  onCustomInputChange,
}: SelectQuestionBodyProps) => {
  const isMultiSelect = isMultipleChoiceQuestion(question);
  const options = question.options ?? [];
  const optionCount = optionCountForQuestion(question);

  return (
    <div className='flex w-full flex-col items-start'>
      {options.map((option, optIndex) => (
        <OptionRow
          key={option.id}
          option={option}
          isFocused={isFocused && focusedOptionIndex === optIndex}
          isSelected={selectedOptionIds.includes(option.id)}
          isMultiSelect={isMultiSelect ?? false}
          singleSelectBadge={isMultiSelect ? undefined : getSingleSelectBadge(optIndex)}
          onClick={() => onOptionClick(option.id)}
        />
      ))}

      <CustomInputRow
        isFocused={focusedOptionIndex === optionCount - 1 && isFocused}
        isSelected={selectedOptionIds.includes(CUSTOM_OPTION_ID)}
        isMultiSelect={isMultiSelect ?? false}
        value={customInputValue}
        inputRef={isFocused ? customInputRef : undefined}
        onClick={onCustomInputClick}
        onChange={onCustomInputChange}
      />
    </div>
  );
};
