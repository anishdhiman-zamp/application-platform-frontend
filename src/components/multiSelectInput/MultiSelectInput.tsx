import React, { FC, useCallback, useEffect, useState } from 'react';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { CUSTOM_ROLE_SELECT_DATA } from 'modules/people/people.constants';
import { validateEmail } from 'modules/people/people.utils';
import { cn } from 'utils/common';
import { Dropdown } from 'components/common/dropdown';
import Input from 'components/common/input';
import { ArrayListOption, MultiSelectInputPropsType } from 'components/multiSelectInput/multiSelectInput.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const MultiSelectInput: FC<MultiSelectInputPropsType> = ({
  inputArrayList,
  setInputArrayList,
  containerRef,
  inputRef,
  search,
  setSearch,
  selectedRoleRef,
  showValidationError,
  validationErrorText,
  isOpen,
  setShowValidationError,
  placeholderText,
}) => {
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsInputFocused(true);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleClickKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && search.trim()) {
        const value = search.trim();
        const isValid = validateEmail(value);

        setInputArrayList((prevEmails: ArrayListOption[]) => [...prevEmails, { value: value, valid: isValid }]);
        setSearch('');
        setShowValidationError((prevShowValidationError) => prevShowValidationError || !isValid);
      }
    },
    [search],
  );

  const handleRemoveEmail = useCallback((index: number) => {
    setInputArrayList((prevEmails: ArrayListOption[]) => {
      const updatedEmails = prevEmails.filter((_, i) => i !== index);

      setShowValidationError(updatedEmails.some((email) => !email.valid));

      return updatedEmails;
    });

    inputRef.current?.focus();
  }, []);

  const handleClickOutsideContainerRef = (
    event: MouseEvent,
    containerRef: React.RefObject<HTMLDivElement>,
    setIsInputFocused: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsInputFocused(false);
    }
  };

  useEffect(() => {
    const listener = (event: MouseEvent) => handleClickOutsideContainerRef(event, containerRef, setIsInputFocused);

    document.addEventListener('mousedown', listener);

    return () => document.removeEventListener('mousedown', listener);
  }, []);

  useEffect(() => {
    if (isInputFocused) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isInputFocused]);

  return (
    <div className='flex flex-col items-center p-5'>
      <div
        className={cn(
          `flex justify-between items-start w-full mt-5 rounded-md gap-1.5 border ${isInputFocused ? 'border-GRAY_600 shadow-inputOutlineShadow' : 'border-GRAY_400'}`,
        )}
      >
        <div
          className='flex flex-wrap gap-1.5 py-3 pl-3 w-full'
          ref={containerRef}
          onClick={() => setIsInputFocused(true)}
        >
          {inputArrayList.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-1 px-1.5 pr-1 py-0.5 rounded w-fit h-fit border ${item.valid ? 'bg-GRAY_50 border-GRAY_400' : `bg-RED_100 border-RED_200`}`}
            >
              <span className='f-12-500 text-GRAY_1000'>{item.value}</span>
              <SvgSpriteLoader
                id='x-close'
                iconCategory={ICON_SPRITE_TYPES.GENERAL}
                width={10}
                height={10}
                color={item.valid ? COLORS.GRAY_700 : COLORS.GRAY_900}
                onClick={() => handleRemoveEmail(index)}
              />
            </div>
          ))}
          <Input
            placeholder={placeholderText}
            type='email'
            inputRef={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleClickKeyDown}
            className='w-full h-fit mt-[2px]'
            customPaddingClassName='p-0'
            focusClassNames='focus:outline-none focus:border-none focus:shadow-none'
            cursorClassname='cursor-default'
            inputFontClassName='f-12-500 py-0 !rounded-none'
          />
        </div>

        <div className='w-[130px]'>
          <Dropdown
            options={CUSTOM_ROLE_SELECT_DATA}
            id=''
            eventCallback={() => {}}
            onChange={(selectedOption) => {
              selectedRoleRef.current = selectedOption;
              inputRef.current?.focus();
              setIsInputFocused(true);
            }}
            value={selectedRoleRef.current}
            placeholder='Member'
            isSearchable={false}
            customClass={{
              focus: 'none',
              border: 'transparent',
              fontSize: 'f-12-400',
            }}
          />
        </div>
      </div>
      {showValidationError && (
        <span className='f-11-400 text-RED_700 mt-2 w-full flex text-start'>{validationErrorText}</span>
      )}
    </div>
  );
};

export default MultiSelectInput;
