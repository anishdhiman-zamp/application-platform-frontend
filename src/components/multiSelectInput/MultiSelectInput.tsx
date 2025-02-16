import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { defaultFn } from 'types/commonTypes';
import { cn } from 'utils/common';
import { Dropdown } from 'components/common/dropdown';
import Input from 'components/common/input';
import { KEY_CODES, MultiSelectInputPropsType } from 'components/multiSelectInput/multiSelectInput.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const MultiSelectInput: FC<MultiSelectInputPropsType> = ({
  id,
  search,
  setSearch,
  selectedRoleRef,
  isOpen,
  placeholderText,
  roleOptions,
  inputArrayList,
  setInputArrayList,
  showValidationError,
  setShowValidationError,
  validationErrorText,
  onValidateAndAdd,
  optionsList,
  onSelectOption,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownOptionsRef = useRef<HTMLDivElement>(null);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(search);
  const [openDropdownOptions, setOpenDropdownOptions] = useState<boolean>(false);
  const inputPlaceholderText = inputArrayList.length > 0 ? '' : placeholderText;

  const handleSetInputFocus = () => {
    setIsInputFocused(true);
    inputRef.current?.focus();
    setOpenDropdownOptions(true);
  };

  useEffect(() => {
    if (isOpen) {
      setIsInputFocused(true);
    }
  }, [isOpen, inputRef]);

  const handleClickKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const trimmedSearch = search.trim();
    const keyEvent = e.key;

    if (
      (keyEvent === KEY_CODES.ENTER || keyEvent === KEY_CODES.COMMA || keyEvent === KEY_CODES.SPACE) &&
      trimmedSearch
    ) {
      e.preventDefault();
      onValidateAndAdd(trimmedSearch);
      setSearch('');
    }
  };

  const handleRemoveItem = useCallback(
    (index: number) => {
      setInputArrayList((prev) => {
        const updatedItems = prev.filter((_, i) => i !== index);

        setShowValidationError(updatedItems.some((item) => !item?.valid));

        return updatedItems;
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
      setTimeout(() => {
        setIsInputFocused(false);
        setOpenDropdownOptions(false);
      }, 0);
    },
    [containerRef, dropdownOptionsRef],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    const debounceHandler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      if (debounceHandler) clearTimeout(debounceHandler);
    };
  }, [search]);

  const combinedOptions = useMemo(() => optionsList ?? [], [optionsList]);

  const filteredDropdownOptions = useMemo(() => {
    if (!combinedOptions) return [];
    if (!debouncedSearch.trim()) return combinedOptions;

    const filteredOptions = combinedOptions.filter((option) =>
      option?.value.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );

    setOpenDropdownOptions(filteredOptions?.length > 0);

    return filteredOptions;
  }, [combinedOptions, debouncedSearch]);

  const handleSelectDropdownOption = useCallback(
    (option: { value: string; label: string; color?: string }) => {
      onSelectOption?.(option);
      setSearch('');
      setIsInputFocused(true);
      inputRef.current?.focus();
    },
    [onSelectOption, setSearch, inputRef, showValidationError],
  );

  return (
    <div className='flex flex-col items-center'>
      <div
        className={cn(
          `flex justify-between items-start w-full rounded-md gap-1.5 border ${isInputFocused ? 'border-GRAY_600 shadow-inputOutlineShadow' : 'border-GRAY_400'}`,
        )}
        ref={containerRef}
        onClick={handleSetInputFocus}
      >
        <div className='flex flex-wrap gap-1.5 py-3 pl-3 w-full'>
          {inputArrayList.map((item, index) => (
            <div
              key={index}
              className='flex items-center gap-1 px-1.5 pr-1 py-0.5 rounded w-fit h-fit'
              style={{
                backgroundColor: item?.valid ? (item?.color ? item?.color : COLORS.GRAY_50) : COLORS.RED_100,
                border: `1px solid ${item?.valid ? (item?.color !== COLORS.WHITE ? 'transparent' : COLORS.GRAY_400) : COLORS.RED_200}`,
              }}
            >
              <span className='f-12-500 text-GRAY_1000'>{item?.value}</span>
              <SvgSpriteLoader
                id='x-close'
                iconCategory={ICON_SPRITE_TYPES.GENERAL}
                width={10}
                height={10}
                color={item?.valid ? COLORS.GRAY_700 : COLORS.GRAY_900}
                onClick={() => handleRemoveItem(index)}
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
          <div className='flex min-w-max h-fit'>
            <Dropdown
              options={roleOptions}
              id={`${id}-multi-select-input-dropdown`}
              eventCallback={defaultFn}
              onChange={(selectedOption) => {
                selectedRoleRef.current = selectedOption;
                inputRef.current?.focus();
                setIsInputFocused(true);
              }}
              defaultValue={roleOptions[0]}
              value={selectedRoleRef.current}
              placeholder='Member'
              isSearchable={false}
              customClass={{
                focus: 'none',
                border: 'transparent',
                fontSize: 'f-12-400',
              }}
              customClassNames={{
                placeholder: 'f-12-300',
              }}
              menuOptionClasses={{
                contentWrapper: 'py-2',
              }}
            />
          </div>
        )}
      </div>
      {!!combinedOptions?.length && openDropdownOptions && (
        <div className='w-full relative'>
          <div
            ref={dropdownOptionsRef}
            onClick={(e) => e.stopPropagation()}
            className='absolute left-0 bg-white w-full p-1 f-10-500 text-GRAY_700 rounded-md border border-GRAY_400 mt-1 z-10'
          >
            <span className='flex pt-2 pb-1.5 px-1.5'>Select a team or person</span>
            <div className='w-full max-h-[200px] overflow-y-auto ag-body-vertical-scroll'>
              {filteredDropdownOptions?.map((option, index) => (
                <div
                  key={index}
                  className='w-full py-1.5 hover:bg-GRAY_50 px-1.5 rounded-md'
                  onClick={() => handleSelectDropdownOption(option)}
                >
                  <span
                    className='f-12-400 text-GRAY_1000 w-full px-1.5 py-0.5 rounded'
                    style={{
                      backgroundColor: option?.color ?? COLORS.WHITE,
                      border: `1px solid ${COLORS.GRAY_400}`,
                    }}
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
