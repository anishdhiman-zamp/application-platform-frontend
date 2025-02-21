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
  selectOnlyFromList = false,
  transformLabel,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownOptionsRef = useRef<HTMLDivElement>(null);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(search);
  const [openDropdownOptions, setOpenDropdownOptions] = useState<boolean>(false);
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState<number>(0);
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
    const keyEvent = e.key;

    if (selectOnlyFromList) {
      if (keyEvent === KEY_CODES.ENTER || keyEvent === KEY_CODES.COMMA || keyEvent === KEY_CODES.SPACE) {
        e.preventDefault();

        const selectedOption = filteredDropdownOptions[hoveredOptionIndex ?? 0];

        if (selectedOption) {
          onValidateAndAdd(selectedOption.value);
          setSearch('');
        }
      } else if (keyEvent === 'ArrowDown' || keyEvent === 'ArrowUp') {
        handleKeyDown(e);
      }
    } else {
      const trimmedSearch = search.trim();

      if (
        (keyEvent === KEY_CODES.ENTER || keyEvent === KEY_CODES.COMMA || keyEvent === KEY_CODES.SPACE) &&
        trimmedSearch
      ) {
        e.preventDefault();
        onValidateAndAdd(trimmedSearch);
        setSearch('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!filteredDropdownOptions.length) return;

    if (e.key === KEY_CODES.ARROW_DOWN) {
      e.preventDefault();
      setHoveredOptionIndex((prevIndex) =>
        prevIndex === null || prevIndex === filteredDropdownOptions.length - 1 ? 0 : prevIndex + 1,
      );
    } else if (e.key === KEY_CODES.ARROW_UP) {
      e.preventDefault();
      setHoveredOptionIndex((prevIndex) =>
        prevIndex === null || prevIndex === 0 ? filteredDropdownOptions.length - 1 : prevIndex - 1,
      );
    } else if (e.key === 'Enter' && hoveredOptionIndex !== null) {
      e.preventDefault();
      handleSelectDropdownOption(filteredDropdownOptions[hoveredOptionIndex]);
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
      option?.value.toLowerCase().startsWith(debouncedSearch.toLowerCase()),
    );

    setOpenDropdownOptions(filteredOptions?.length > 0);

    return filteredOptions;
  }, [combinedOptions, debouncedSearch]);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      setOpenDropdownOptions((prev) =>
        prev !== filteredDropdownOptions.length > 0 ? filteredDropdownOptions.length > 0 : prev,
      );
    }
    setHoveredOptionIndex(0);
  }, [filteredDropdownOptions, debouncedSearch]);

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
      >
        <div className='flex flex-wrap gap-1.5 py-3 pl-3 w-full' ref={containerRef} onClick={handleSetInputFocus}>
          {inputArrayList.map((item, index) => (
            <div
              key={index}
              className='flex items-center gap-1 px-1.5 pr-1 py-0.5 rounded w-fit h-fit cursor-default'
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
                onClick={() => handleRemoveItem(index)}
                color={item?.valid ? COLORS.GRAY_700 : COLORS.GRAY_900}
                className='cursor-pointer'
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
            inputFontClassName='f-13-400 py-0 !rounded-none'
          />
        </div>
        {roleOptions && (
          <div className='flex min-w-max h-fit !cursor-pointer'>
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
              customDropdownIndicatorSize={14}
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
            <div
              className='flex flex-col w-full max-h-[200px] overflow-y-auto'
              style={{ scrollbarWidth: 'none' }}
              tabIndex={0}
            >
              {filteredDropdownOptions?.map((option, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-full px-1.5 py-1 hover:bg-GRAY_50 rounded-md cursor-pointer',
                    hoveredOptionIndex === null && index === 0 ? 'bg-GRAY_50' : '',
                    hoveredOptionIndex === index ? 'bg-GRAY_50' : '',
                  )}
                  onMouseEnter={() => setHoveredOptionIndex(index)}
                  onClick={() => handleSelectDropdownOption(option)}
                >
                  <span
                    className='f-12-400 text-GRAY_1000 flex px-1.5 py-0.5 w-fit rounded capitalize'
                    style={{
                      backgroundColor: option?.color ?? COLORS.WHITE,
                      border: `1px solid ${COLORS.GRAY_400}`,
                    }}
                  >
                    {transformLabel ? transformLabel(option?.label) : option?.label}
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
