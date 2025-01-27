import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
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
  dropdownOptions,
  roleOptions,
}) => {
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const dropdownOptionsRef = useRef<HTMLDivElement>(null);
  const inputPlaceholderText = inputArrayList.length > 0 ? '' : placeholderText;

  const handleSetInputFocus = () => {
    setIsInputFocused(true);
  };

  useEffect(() => {
    if (isOpen) {
      setIsInputFocused(true);
      inputRef.current?.focus();
    }
  }, [isOpen, inputRef]);

  const handleClickKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && search.trim()) {
        const value = search.trim();
        const isValid = validateEmail(value);

        setInputArrayList((prevEmails: ArrayListOption[]) => [
          ...prevEmails,
          { value: value, valid: isValid, role: selectedRoleRef?.current?.value },
        ]);
        setSearch('');
        setShowValidationError((prevShowValidationError) => prevShowValidationError || !isValid);
      }
    },
    [search, setInputArrayList, setSearch, setShowValidationError, selectedRoleRef],
  );

  const handleRemoveEmail = useCallback(
    (index: number) => {
      setInputArrayList((prev) => {
        const updatedEmails = prev.filter((_, i) => i !== index);

        setShowValidationError(updatedEmails.some((email) => !email.valid));

        return updatedEmails;
      });
      inputRef.current?.focus();
    },
    [setInputArrayList, setShowValidationError, inputRef],
  );

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        containerRef.current?.contains(event.target as Node) ||
        dropdownOptionsRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setTimeout(() => setIsInputFocused(false), 0);
    },
    [containerRef, dropdownOptionsRef],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (isInputFocused) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isInputFocused]);

  const filteredDropdownOptions = useMemo(() => {
    if (!search.trim()) {
      return dropdownOptions ?? [];
    }

    return dropdownOptions?.filter((option) => option?.value.toLowerCase().includes(search.toLowerCase()));
  }, [dropdownOptions, search]);

  const openDropdownOptions =
    dropdownOptions && isInputFocused && search.trim().length > 0 && (filteredDropdownOptions?.length ?? 0) > 0;
  const handleSelectDropdownOption = useCallback(
    (option: { value: string; color?: string }) => {
      setInputArrayList((prev) => [...prev, { value: option.value, valid: true, color: option?.color }]);
      setSearch('');
      inputRef.current?.focus();
      setIsInputFocused(true);
    },
    [setInputArrayList, setSearch, inputRef, selectedRoleRef],
  );

  return (
    <div className='flex flex-col items-center'>
      <div
        className={cn(
          `flex justify-between items-start w-full rounded-md gap-1.5 border ${isInputFocused ? 'border-GRAY_600 shadow-inputOutlineShadow' : 'border-GRAY_400'}`,
        )}
      >
        <div className='flex flex-wrap gap-1.5 py-3 pl-3 w-full' ref={containerRef} onClick={handleSetInputFocus}>
          {inputArrayList.map((item, index) => (
            <div
              key={index}
              className='flex items-center gap-1 px-1.5 pr-1 py-0.5 rounded w-fit h-fit'
              style={{
                backgroundColor: item.valid ? (item?.color ? item.color : COLORS.GRAY_50) : COLORS.RED_100,
                border: `1px solid ${item.valid ? (item?.color ? 'transparent' : COLORS.GRAY_400) : COLORS.RED_200}`,
              }}
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
            placeholder={inputPlaceholderText}
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
        {roleOptions && (
          <div className='w-[130px]'>
            <Dropdown
              options={roleOptions}
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
        )}
      </div>
      {openDropdownOptions && (
        <div className='w-full relative'>
          <div
            ref={dropdownOptionsRef}
            onClick={(e) => e.stopPropagation()}
            className='absolute left-0 bg-white w-full p-1 f-10-500 text-GRAY_700 rounded-md border border-GRAY_400 mt-1 z-10'
          >
            <span className='flex pt-2 pb-1.5 px-1.5'>Select a team or person</span>
            <div className='w-full max-h-[200px] overflow-y-scroll'>
              {filteredDropdownOptions?.map((option, index) => (
                <div
                  key={index}
                  className='w-full py-1.5 hover:bg-GRAY_50 px-1.5 rounded-md'
                  onClick={() => handleSelectDropdownOption(option)}
                >
                  <span
                    className='f-12-400 text-GRAY_1000 w-full px-1.5 py-0.5 rounded'
                    style={{ backgroundColor: option?.color }}
                  >
                    {option?.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {validationErrorText && showValidationError && (
        <span className='f-11-400 text-RED_700 mt-2 w-full flex text-start'>{validationErrorText}</span>
      )}
    </div>
  );
};

export default MultiSelectInput;
