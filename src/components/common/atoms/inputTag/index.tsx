import React, { ChangeEvent, FC, HTMLInputTypeAttribute, memo } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { KEYBOARD_KEYS } from 'constants/shortcuts';
import { InputTagProps } from 'types/common/components/input/input.types';
import { defaultFn } from 'types/commonTypes';
import { debounce, stopPropagationAction } from 'utils/common';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const InputTag: FC<InputTagProps> = ({
  id = '',
  name = '',
  value = '',
  type = 'text',
  placeholder = '',
  maxLength = undefined,
  disabled = false,
  readOnly = false,
  error = false,
  style = {},
  autocomplete = 'off',
  inputTagBorderClassName = '',
  inputTagWrapperClassName = 'tw-w-full',
  inputClassName = `placeholder:tw-tracking-[0.03em] tw-w-full tw-box-border tw-text-GRAY_700 placeholder:tw-text-GRAY_500 placeholder:tw-font-light focus:tw-outline-0 `,
  inputRoundedClassName = '',
  inputSizeClassName = 'tw-p-6',
  errorClass = '!tw-border-b-ERROR_500',
  onChange = defaultFn,
  onKeyPress = defaultFn,
  onKeyDown = defaultFn,
  onBlur = defaultFn,
  onFocus = defaultFn,
  eventId = '',
  eventCallback,
  eventCallbackDelay = 1000,
  inputRef,
  inputFontClassName = 'f-16-300',
  overrideInputBgClassName = '',
  autoFocus = false,
  tabIndex = 0,
  noBorders = false,
  isMulti = false,
  onDeleteTag = defaultFn,
  onKeyUp = defaultFn,
  onEnterKey = defaultFn,
  tags = [],
  customTags = null,
  inputPillsWrapperClasses = '',
}) => {
  let readOnlyInputClasses = ' read-only:tw-text-GRAY_700 read-only:tw-bg-GRAY_100 read-only:tw-pointer-events-none';
  let disabledInputClasses =
    ' disabled:tw-text-GRAY_500 disabled:tw-cursor-not-allowed disabled:tw-placeholder-GRAY_400 disabled:tw-bg-GRAY_100';

  if (overrideInputBgClassName) {
    readOnlyInputClasses += ' disabled:tw-bg-BASE_PRIMARY';
    disabledInputClasses += ' read-only:tw-bg-BASE_PRIMARY';
  }

  let borderClasses = `${noBorders
    ? ''
    : `${error ? '' : 'read-only:!tw-border-b-DIVIDER_SAIL_2 focus:!tw-border-b-GRAY_700'
    } disabled:!tw-border-b-DIVIDER_SAIL_2 tw-border tw-border-b-GRAY_400 tw-border-DIVIDER_SAIL_2`
    }`;

  borderClasses += !readOnly && !error && !noBorders ? ' hover:!tw-border-b-GRAY_700' : '';

  const inputStateClassName = `${overrideInputBgClassName} ${inputFontClassName} ${inputClassName} ${inputSizeClassName} ${error ? errorClass : ''
    } ${readOnlyInputClasses} ${disabledInputClasses} `;

  const inputTagWrapperClasses = `${inputTagBorderClassName ? inputTagBorderClassName : borderClasses
    } ${inputRoundedClassName} ${inputTagWrapperClassName} ${error ? errorClass : ''}`;

  const handleEvent = (inputValue: HTMLInputTypeAttribute) => {
    eventCallback?.('INPUT_CHANGE', {
      id: eventId,
      inputValue,
    });
  };

  const executeEventCallback = debounce(handleEvent, eventCallbackDelay);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);

    if (e?.target) executeEventCallback(e?.target?.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER) {
      onEnterKey?.(e);
    }
    onKeyDown?.(e);
  };

  return (
    <div className={`tw-flex ${inputTagWrapperClasses}`}>
      {isMulti ? (
        <div
          className={`tw-flex tw-p-1 tw-bg-white tw-gap-1 tw-flex-wrap tw-w-inherit tw-overflow-y-auto  ${inputPillsWrapperClasses}`}
        >
          {tags.map((tag, index) => (
            <div
              key={index}
              onClick={stopPropagationAction}
              className='tw-whitespace-nowrap tw-w-auto tw-p-2 f-12-400 tw-flex tw-items-center tw-justify-between tw-bg-BLUE_50 tw-gap-2'
            >
              {tag}
              <SvgSpriteLoader
                id='x-close'
                onClick={() => onDeleteTag(index)}
                className='tw-cursor-pointer'
                iconCategory={ICON_SPRITE_TYPES.GENERAL}
                height={18}
                width={18}
              />
            </div>
          ))}
          {customTags}
          <input
            tabIndex={tabIndex}
            id={id}
            data-testid={id}
            type={type}
            name={name}
            style={style}
            maxLength={maxLength}
            placeholder={placeholder}
            min={0}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            className={`${inputStateClassName}`}
            autoComplete={autocomplete}
            autoFocus={autoFocus}
            onChange={handleChange}
            onBlur={onBlur}
            onKeyPress={onKeyPress}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            ref={inputRef}
            inputMode='none'
            onKeyUp={onKeyUp}
          />
        </div>
      ) : (
        <input
          tabIndex={tabIndex}
          id={id}
          data-testid={id}
          type={type}
          name={name}
          style={style}
          maxLength={maxLength}
          placeholder={placeholder}
          min={0}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          className={`${inputStateClassName}`}
          autoComplete={autocomplete}
          autoFocus={autoFocus}
          onChange={handleChange}
          onBlur={onBlur}
          onKeyPress={onKeyPress}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          ref={inputRef}
          inputMode='none'
          onKeyUp={onKeyUp}
        />
      )}
    </div>
  );
};

export default memo(InputTag);
