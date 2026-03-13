import React, { FC, useEffect, useRef } from 'react';
import { COLORS } from '@zamp-platform/ui';
import { CustomTeamsDropdownPropsType } from 'modules/team/people.types';
import { cn } from 'utils/common';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import { ArrayListOption, KEY_CODES } from 'components/multiSelectInput/multiSelectInput.types';
import OptionsListSkeletonLoader from 'components/multiSelectInput/OptionsListSkeletonLoader';

const CustomTeamsDropdown: FC<CustomTeamsDropdownPropsType> = ({
  search,
  optionRefs,
  optionList,
  isLoadingOptionsList,
  hoveredOptionIndex,
  setHoveredOptionIndex,
  onSelectOption,
  onKeyDown,
  transformLabel,
  randomColor,
  onCloseDropdown,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyEvent = e.key;

      if (keyEvent === KEY_CODES.ESCAPE) {
        onCloseDropdown();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onKeyDown]);

  return (
    <div className='f-10-500 text-GRAY_700 border-GRAY_400 shadow-table-filter-menu absolute left-0 z-10 mt-1 w-fit max-w-48 rounded-md border bg-white p-1'>
      <span className='flex px-1.5 pt-2 pb-1.5 whitespace-nowrap'>Select a team or create one</span>
      <div
        className='flex max-h-[200px] w-full flex-col overflow-y-auto outline-hidden [&::-webkit-scrollbar]:hidden'
        ref={dropdownRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        <CommonWrapper
          skeletonType={SkeletonTypes.CUSTOM}
          isLoading={isLoadingOptionsList}
          loader={<OptionsListSkeletonLoader />}
        >
          {optionList?.map((option, index) => (
            <div
              key={index}
              ref={(el) => {
                if (optionRefs?.current) {
                  optionRefs.current[index] = el;
                }
              }}
              onMouseEnter={() => setHoveredOptionIndex(index)}
              onClick={() => {
                const optionWithNew = option as ArrayListOption & { isNew?: boolean };

                if (optionWithNew?.isNew && !search?.trim()) return;
                onSelectOption(option);
              }}
            >
              {(option as ArrayListOption & { isNew?: boolean })?.isNew && !!search?.length ? (
                <div
                  className={cn('hover:bg-GRAY_50 w-full cursor-pointer rounded-md px-1.5 py-1', {
                    'bg-GRAY_50': (hoveredOptionIndex === null && index === 0) || hoveredOptionIndex === index,
                  })}
                >
                  <div className='f-12-400 text-GRAY_1000 flex min-h-5 cursor-pointer flex-wrap items-center gap-1 rounded-md px-1.5'>
                    <span> Create team :</span>
                    {search && (
                      <span
                        className='h-fit w-fit cursor-pointer rounded px-1.5 py-0.5 text-wrap text-black'
                        style={{ backgroundColor: randomColor ?? COLORS.WHITE }}
                      >
                        {option?.label}
                      </span>
                    )}
                  </div>
                </div>
              ) : search?.length === 0 && !(option as ArrayListOption & { isNew?: boolean })?.isNew ? (
                <div
                  className={cn('hover:bg-GRAY_50 w-full cursor-pointer rounded-md px-1.5 py-1', {
                    'bg-GRAY_50': (hoveredOptionIndex === null && index === 0) || hoveredOptionIndex === index,
                  })}
                >
                  <span
                    className='f-12-400 text-GRAY_1000 flex w-fit rounded px-1.5 py-0.5'
                    style={{ backgroundColor: option?.color ?? COLORS.WHITE }}
                  >
                    {transformLabel ? transformLabel(option?.label) : option?.label}
                  </span>
                </div>
              ) : search?.length !== 0 && !(option as ArrayListOption & { isNew?: boolean })?.isNew ? (
                <div
                  className={cn('hover:bg-GRAY_50 w-full cursor-pointer rounded-md px-1.5 py-1', {
                    'bg-GRAY_50': (hoveredOptionIndex === null && index === 0) || hoveredOptionIndex === index,
                  })}
                >
                  <span
                    className='f-12-400 text-GRAY_1000 flex w-fit rounded px-1.5 py-0.5'
                    style={{ backgroundColor: option?.color ?? COLORS.WHITE }}
                  >
                    {transformLabel ? transformLabel(option?.label) : option?.label}
                  </span>
                </div>
              ) : null}
            </div>
          ))}
        </CommonWrapper>
      </div>
    </div>
  );
};

export default CustomTeamsDropdown;
