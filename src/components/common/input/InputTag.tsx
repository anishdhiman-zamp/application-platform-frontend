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
  inputTagWrapperClassName = 'w-full',
  inputClassName = `placeholder:tracking-[0.03em] w-full box-border border border-BORDER_GRAY_400 rounded-md text-GRAY_1000 placeholder:text-GRAY_500 placeholder:font-light outline-none focus:shadow-inputOutlineShadow focus:border-GRAY_600`,
  inputRoundedClassName = 'rounded-md',
  inputSizeClassName = 'p-6',
  errorClass = '!border-RED_700 !focus:shadow-inputErrorOutlineShadow',
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
  let readOnlyInputClasses = ' read-only:text-GRAY_700 read-only:bg-GRAY_100 read-only:pointer-events-none';
  let disabledInputClasses =
    ' disabled:text-GRAY_700 disabled:placeholder:text-GRAY_700 disabled:cursor-not-allowed disabled:placeholder-GRAY_400 disabled:bg-GRAY_100';

  if (overrideInputBgClassName) {
    readOnlyInputClasses += ' disabled:bg-BASE_PRIMARY';
    disabledInputClasses += ' read-only:bg-BASE_PRIMARY';
  }

  let borderClasses = `${
    noBorders
      ? ''
      : `${
          error ? '' : 'read-only:!border-b-DIVIDER_SAIL_2 focus:!border-b-GRAY_700'
        } disabled:!border-b-DIVIDER_SAIL_2`
  }`;

  borderClasses += !readOnly && !error && !noBorders ? ' hover:!border-b-GRAY_700' : '';

  const inputStateClassName = `${overrideInputBgClassName} ${inputFontClassName} ${inputClassName} ${inputSizeClassName} ${
    error ? errorClass : ''
  } ${readOnlyInputClasses} ${disabledInputClasses} `;

  const inputTagWrapperClasses = `${
    inputTagBorderClassName ? inputTagBorderClassName : borderClasses
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
    <div className={`flex ${inputTagWrapperClasses}`}>
      {isMulti ? (
        <div className={`flex p-1 bg-white gap-1 flex-wrap w-inherit overflow-y-auto  ${inputPillsWrapperClasses}`}>
          {tags.map((tag, index) => (
            <div
              key={index}
              onClick={stopPropagationAction}
              className='whitespace-nowrap w-auto p-2 f-12-400 flex items-center justify-between bg-BLUE_50 gap-2'
            >
              {tag}
              <SvgSpriteLoader
                id='x-close'
                onClick={() => onDeleteTag(index)}
                className='cursor-pointer'
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
