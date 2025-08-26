import React, { FC, useCallback, useRef, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useOnClickOutside } from 'hooks';
import { POSITION_TYPES } from 'types/common/components';
import TooltipV2 from '@/components/common/TooltipV2';
import { SIDE_OPTIONS } from '@/types/commonTypes';
import SelectFilterMenuItem from 'components/filter/filterMenu/SelectFilterMenuItem';
import { useFiltersContextStore } from 'components/filter/filters.context';

interface FiltersMenuV2Props {
  onAddFilter: (filterKey: string) => void;
  currentPageFilters?: string[];
}

const FiltersMenuV2: FC<FiltersMenuV2Props> = ({ onAddFilter, currentPageFilters }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);

  const {
    state: { filtersConfig },
  } = useFiltersContextStore();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useOnClickOutside(menuRef, () => {
    setIsOpen(false);
  }, [controlRef]);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const getMenuPlacement = useCallback(() => POSITION_TYPES.RIGHT, []);

  const onAddfilter = (filterKey: string) => {
    onAddFilter(filterKey);
    toggleMenu();
  };

  return (
    <div className='relative'>
      <div ref={controlRef}>
        <div className='mb-2 flex w-full flex-1 items-center justify-between'>
          <label className='block text-sm font-medium'>Filter</label>
          <TooltipV2
            tooltipBody={!filtersConfig?.length ? 'Please select a dataset first' : 'Add Filter'}
            side={SIDE_OPTIONS.BOTTOM}
            asChildTrigger
          >
            <Button variant='ghost' size='xxsmall' onClick={toggleMenu} className='[&_svg]:size-3.5'>
              <SvgSpriteLoader id='plus' size={14} className='text-gray-700' />
            </Button>
          </TooltipV2>
        </div>
      </div>
      <SelectFilterMenuItem
        menuRef={menuRef}
        isOpen={isOpen}
        getMenuPlacement={getMenuPlacement}
        filtersConfig={filtersConfig ?? []}
        onAddFilter={onAddfilter}
        currentPageFilters={currentPageFilters ?? []}
        className='right-0 bottom-full'
        openClassName='max-h-[300px]'
      />
    </div>
  );
};

export default FiltersMenuV2;
