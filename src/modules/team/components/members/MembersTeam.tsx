import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TEAMS_COLORS } from 'constants/colors';
import CustomTeamsDropdown from 'modules/team/components/members/CustomTeamsDropdown';
import { TEAMS_LIST_DUMMY_DATA } from 'modules/team/people.constants';
import { CustomTeamsDropdownPropsType } from 'modules/team/people.types';
import { cn, cyclicIterator } from 'utils/common';
import MultiSelectInput from 'components/multiSelectInput/MultiSelectInput';
import { ArrayListOption } from 'components/multiSelectInput/multiSelectInput.types';

const MembersTeam = () => {
  const combinedOptionListsData = TEAMS_LIST_DUMMY_DATA;
  const teamsRandomColorRef = useRef(cyclicIterator(TEAMS_COLORS));

  const [search, setSearch] = useState('');
  const [randomColor, setRandomColor] = useState(() => teamsRandomColorRef.current());

  const [isCustomInputFocused, setIsCustomInputFocused] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ArrayListOption[]>([]);

  const handleValidateAndAdd = ({
    value,
    label,
    color,
  }: {
    value: string;
    label: string;
    color?: string;
    isNew?: boolean;
  }) => {
    if (!value) return;

    setSelectedItems((prev) => {
      const updatedItems = [
        ...prev,
        {
          value,
          label,
          color: color ?? randomColor,
          valid: true,
          isNew: false,
        },
      ];

      return updatedItems;
    });
  };

  const handleOptionSelection = (option: { value: string; label: string; color?: string; isNew?: boolean }) => {
    setSelectedItems((prev) => {
      const updatedItems = [
        ...prev,
        {
          label: option?.label,
          value: option?.value,
          valid: true,
          color: option?.color,
          isNew: false,
        },
      ];

      return updatedItems;
    });
  };

  const filteredOptionListsData = [
    ...(combinedOptionListsData
      ?.filter((item) => !selectedItems.some((selected) => selected?.value === item?.value))
      .map((member) => ({
        label: member?.label ?? '',
        value: member?.value ?? '',
        color: member?.color ?? randomColor,
        isNew: false,
      })) || []),
    ...[
      {
        label: search,
        value: search,
        color: randomColor,
        isNew: true,
      },
    ],
  ];

  useEffect(() => {
    if (!search) {
      const newColor = teamsRandomColorRef.current();

      setRandomColor(newColor);
    }
  }, [search]);

  const memoizedDropdown = useMemo(() => {
    const MemoizedDropdownComponent = (props: CustomTeamsDropdownPropsType) => (
      <CustomTeamsDropdown {...props} randomColor={randomColor} />
    );

    MemoizedDropdownComponent.displayName = 'MemoizedDropdownComponent';

    return MemoizedDropdownComponent;
  }, [randomColor]);

  return (
    <div className='f-12-400 text-GRAY_1000 h-full flex items-center justify-start text-left py-2 px-2'>
      <MultiSelectInput
        id='select-team'
        search={search}
        setSearch={setSearch}
        inputArrayList={selectedItems}
        setInputArrayList={setSelectedItems}
        optionsList={filteredOptionListsData}
        customOptionsListDropdown={memoizedDropdown}
        onValidateAndAdd={handleValidateAndAdd}
        onSelectOption={handleOptionSelection}
        placeholderText='Add team'
        isOpen={false}
        wrapperClassName='border-none rounded-none shadow-none f-12-400'
        inputWrapperClassName={cn(isCustomInputFocused ? 'flex-wrap' : 'flex-nowrap', 'p-0')}
        multiSelectInputClassName='f-12-400 !rounded-none'
        setIsCustomInputFocused={setIsCustomInputFocused}
        selectOnlyFromList
      />

      <span className='border-none rounded-none shadow-none cursor-text flex-nowrap whitespace-pre-wrap'></span>
    </div>
  );
};

export default MembersTeam;
