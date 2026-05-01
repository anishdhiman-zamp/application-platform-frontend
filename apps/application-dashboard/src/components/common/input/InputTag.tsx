import React, { ChangeEvent, FC, HTMLInputTypeAttribute, KeyboardEvent, memo } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { KEYBOARD_KEYS } from 'constants/shortcuts';
import { InputTagProps } from 'types/common/components/input/input.types';
import { defaultFn } from 'types/commonTypes';
import { cn, debounce, stopPropagationAction } from 'utils/common';

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
  inputClassName = ' w-full box-border rounded-md text-GRAY_1000 placeholder:text-GRAY_500 placeholder:font-normal outline-hidden',
  focusClassNames = 'border border-GRAY_400 focus:shadow-input-outline-shadow focus:border-GRAY_600',
  cursorClassname = 'cursor-text',
  inputRoundedClassName = 'rounded-md',
  inputSizeClassName = 'p-6',
  customPaddingClassName,
  errorClass = '!border-RED_700 focus:shadow-input-error-outline-shadow',
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
  inputMode,
}) => {
  let readOnlyInputClasses = ' read-only:text-GRAY_700 read-only:bg-GRAY_100 read-only:pointer-events-none';
  let disabledInputClasses =
    ' disabled:text-GRAY_700 disabled:placeholder:text-GRAY_700 disabled:cursor-not-allowed disabled:placeholder-GRAY_400 disabled:bg-GRAY_100';

  if (overrideInputBgClassName) {
    readOnlyInputClasses += ' disabled:bg-BASE_PRIMARY';
    disabledInputClasses += ' read-only:bg-BASE_PRIMARY';
  }

  let borderClasses = cn(
    `${
      noBorders
        ? ''
        : `${
            error ? '' : 'read-only:!border-b-DIVIDER_SAIL_2 focus:!border-b-GRAY_700'
          } disabled:!border-b-DIVIDER_SAIL_2`
    }`,
  );

  borderClasses += !readOnly && !error && !noBorders ? ' hover:!border-b-GRAY_700' : '';

  inputSizeClassName = customPaddingClassName ? customPaddingClassName : inputSizeClassName;
  const inputStateClassName = cn(
    overrideInputBgClassName,
    inputFontClassName,
    inputClassName,
    focusClassNames,
    cursorClassname,
    inputSizeClassName,
    error && errorClass,
    readOnlyInputClasses,
    disabledInputClasses,
  );

  const inputTagWrapperClasses = cn(
    `${
      inputTagBorderClassName ? inputTagBorderClassName : borderClasses
    } ${inputRoundedClassName} ${inputTagWrapperClassName} ${error ? errorClass : ''}`,
  );

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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER) {
      onEnterKey?.(e);
    }
    onKeyDown?.(e);
  };

  return (
    <div className={cn(`flex flex-col ${inputTagWrapperClasses}`)}>
      {isMulti ? (
        <div className={cn(`w-inherit flex flex-wrap gap-1 overflow-y-auto bg-white p-1 ${inputPillsWrapperClasses}`)}>
          {tags.map((tag, index) => (
            <div
              key={index}
              onClick={stopPropagationAction}
              className='f-12-400 bg-BLUE_100 flex w-auto items-center justify-between gap-2 p-2 whitespace-nowrap'
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
            inputMode={inputMode}
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
          inputMode={inputMode}
          onKeyUp={onKeyUp}
          onDrop={(e) => e.preventDefault()}
        />
      )}
      {error && <span className='f-11-400 text-RED_700 mt-2'>{error}</span>}
    </div>
  );
};

export default memo(InputTag);
