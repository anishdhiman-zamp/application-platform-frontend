import { ChangeEvent, FC, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import Input from '@/components/common/input';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import DescriptionOperatorsDropdown from '@/components/filter/filterMenu/components/DescriptionOperatorsDropdown';
import SearchTags, { DESCRIPTION_TAGS } from '@/components/filter/filterMenu/components/SearchTags';
import { CONDITION_OPERATOR_TYPE, OPERATOR } from '@/components/filter/filters.constants';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { SIZE_TYPES } from '@/types/common/components';
import { MapAny } from '@/types/commonTypes';
import { camelCaseToNormalText, cn, debounce } from '@/utils/common';

export interface MultiSearchFilterProps {
  filterKey: string;
  handleClose?: () => void;
  id?: string;
  isOpen?: boolean;
  forView?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  showColumnLabel?: boolean;
  initialOperator?: MapAny;
  initialSearchTags?: MapAny[];
  initialInputValue?: string;
  onChange: (value: Record<string, any>) => void;
  isDisabled?: boolean;
}

const MultiSearchFilter: FC<MultiSearchFilterProps> = ({
  filterKey,
  isOpen,
  forView = 'table_header',
  className = '',
  label,
  placeholder = 'type here....',
  initialOperator = OPERATOR.ArrayIn,
  initialSearchTags = [],
  initialInputValue = '',
  onChange,
  isDisabled = false,
}) => {
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedOperator, setSelectedOperator] = useState<MapAny>(initialOperator);
  const [searchTags, setSearchTags] = useState<MapAny[]>(initialSearchTags);
  const [inputValue, setInputValue] = useState(initialInputValue);
  const [descriptionPropertySearch, setDescriptionPropertySearch] = useState('');

  const isContainsOperator =
    selectedOperator?.value === CONDITION_OPERATOR_TYPE.ARRAY_IN ||
    selectedOperator?.value === CONDITION_OPERATOR_TYPE.ARRAY_CONTAINS;

  const setFilter = (operator: string, searchValue: string, descriptionTags: MapAny[]) => {
    const value = {
      [filterKey]: searchValue
        ? {
            filterType: FILTER_TYPES.ARRAY_SEARCH,
            type: operator,
            value: searchValue,
            descriptionTags: descriptionTags,
          }
        : {},
    };

    onChange(value);
  };

  const debouncedHandleSetFilters = useCallback(debounce(setFilter, 800), []);

  const updateConditionForValue = (value: string) => {
    const update = {
      operator: selectedOperator ?? OPERATOR.ContainsOperator,
      values: value,
    };

    debouncedHandleSetFilters(
      selectedOperator?.value ?? CONDITION_OPERATOR_TYPE.ARRAY_CONTAINS,
      update.values,
      searchTags,
    );
  };

  const updateCondition = (newDescriptionTags: MapAny[]) => {
    const update = {
      operator: selectedOperator ?? OPERATOR.ContainsOperator,
      values: newDescriptionTags
        ?.filter((tag) => tag?.type === DESCRIPTION_TAGS.DESCRIPTION_VALUE)
        ?.map((tag) => tag?.label)
        ?.join(','),
      descriptionTags: newDescriptionTags,
    };

    debouncedHandleSetFilters(
      selectedOperator?.value ?? CONDITION_OPERATOR_TYPE.ARRAY_CONTAINS,
      update?.values,
      newDescriptionTags,
    );
  };

  const updateOperator = (operator: MapAny) => {
    setSelectedOperator(operator);
    setInputValue('');
    setDescriptionPropertySearch('');
    setSearchTags([]);

    if (!inputValue && !searchTags?.length && forView === 'table_header') {
      return;
    }

    if (initialInputValue?.length) {
      const update = {
        operator,
        values: '',
        descriptionTags: [],
      };

      debouncedHandleSetFilters(operator?.value ?? CONDITION_OPERATOR_TYPE.ARRAY_CONTAINS, update.values, []);
    }
  };

  const handleDescriptionInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();

    if (event.key !== 'Backspace' || !isContainsOperator) {
      return;
    }

    if (inputValue === '' && descriptionPropertySearch === '' && !!searchTags?.length) {
      onDeleteDescriptionInputTag(searchTags?.length - 1);
    }
  };

  const handleDescriptionInputKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    const currentValue = (event?.target as HTMLInputElement)?.value.trim();

    if (
      ![KEYBOARD_KEYS.COMMA, KEYBOARD_KEYS.ENTER].includes(event?.code as KEYBOARD_KEYS) ||
      !isContainsOperator ||
      (!currentValue && searchTags?.length)
    ) {
      return;
    }

    event?.stopPropagation();
    event?.preventDefault();

    if (currentValue) {
      const newDescriptionTags = [...searchTags, { label: currentValue, type: DESCRIPTION_TAGS.DESCRIPTION_VALUE }];

      setSearchTags(newDescriptionTags);
      updateCondition(newDescriptionTags);
    }

    setInputValue('');
    handleResetDescriptionPropertySearch();

    return;
  };

  const descriptionValue: string = inputValue;

  useEffect(() => {
    if (!isOpen) {
      inputRef?.current?.blur();

      return;
    }

    if (!isContainsOperator) {
      setInputValue(initialInputValue ?? '');
    }

    let newDescriptionTags = initialSearchTags ?? [];

    if (initialInputValue && isContainsOperator && !initialSearchTags?.length) {
      newDescriptionTags = [...searchTags, { label: initialInputValue, type: DESCRIPTION_TAGS.DESCRIPTION_VALUE }];

      updateCondition(newDescriptionTags);
    }

    setSearchTags(newDescriptionTags);
    setInputValue('');
    inputRef?.current?.focus();
    if (initialOperator) setSelectedOperator(initialOperator);
  }, [isOpen]);

  const handleResetDescriptionPropertySearch = () => {
    setDescriptionPropertySearch('');
  };

  const handleDescriptionValueSearch = (value: string) => {
    setInputValue(value);
    updateConditionForValue(value);
  };

  const onDescriptionInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    handleDescriptionValueSearch(e?.target?.value);
  };

  const onDeleteDescriptionInputTag = (index: number) => {
    if (!searchTags?.length) return;

    const newTags: MapAny[] = searchTags?.filter((_, i) => i !== index);

    setSearchTags(newTags);
    updateCondition(newTags);
  };

  useEffect(() => {
    if (initialOperator?.value && initialOperator?.value !== selectedOperator?.value) {
      setSelectedOperator(initialOperator);
    }
  }, [initialOperator]);

  useEffect(() => {
    if (initialInputValue !== inputValue) {
      setInputValue(initialInputValue);
    }
  }, [initialInputValue]);

  useEffect(() => {
    if (initialSearchTags && initialSearchTags !== searchTags) {
      setSearchTags(initialSearchTags);
    }
  }, [initialSearchTags]);

  return (
    <div
      className={cn(
        'border-0.5 border-GRAY_400 shadow-table-filter-menu w-[218px] max-w-[360px] min-w-[300px] rounded-md bg-white px-2.5 py-2',
        className,
      )}
    >
      <DescriptionOperatorsDropdown
        operator={selectedOperator}
        updateOperator={updateOperator}
        label={label || camelCaseToNormalText(filterKey)}
        isDisabled={isDisabled}
      />

      <div
        className='border-GRAY_400 shadow-table-filter-menu focus:shadow-input-outline-shadow focus:border-GRAY_600 relative mt-2 w-full overflow-hidden rounded-md border'
        ref={inputWrapperRef}
      >
        <Input
          inputRef={inputRef}
          size={SIZE_TYPES.SMALL}
          name='description'
          placeholder={placeholder}
          customTags={
            searchTags?.length ? <SearchTags tags={searchTags} onDeleteTag={onDeleteDescriptionInputTag} /> : undefined
          }
          id='description-filter-input'
          inputPillsWrapperClasses={cn('px-2 gap-3 py-3')}
          isMulti
          onKeyPress={handleDescriptionInputKeyPress}
          onKeyDown={handleDescriptionInputKeyDown}
          onDeleteTag={onDeleteDescriptionInputTag}
          overrideInputBgClassName='bg-white!'
          value={(descriptionValue ? descriptionValue : descriptionPropertySearch) as string}
          onChange={onDescriptionInputChange}
          inputClassName='w-full min-w-[160px]! flex-1 outline-hidden border-none focus:shadow-none! shadow-none!'
          inputSizeClassName='p-0'
          autoFocus
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};

export default MultiSearchFilter;
