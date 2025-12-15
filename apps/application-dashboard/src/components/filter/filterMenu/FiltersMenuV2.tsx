import React, { FC, useState } from 'react';
import { Button, Popover, PopoverTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import TooltipV2 from '@/components/common/TooltipV2';
import { SIDE_OPTIONS } from '@/types/commonTypes';
import SelectFilterMenuItem from 'components/filter/filterMenu/SelectFilterMenuItem';
import { useFiltersContextStore } from 'components/filter/filters.context';

interface FiltersMenuV2Props {
  onAddFilter: (filterKey: string) => void;
  currentPageFilters?: string[];
}

const FiltersMenuV2: FC<FiltersMenuV2Props> = ({ onAddFilter, currentPageFilters }) => {
  const {
    state: { filtersConfig },
  } = useFiltersContextStore();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onAddfilter = (filterKey: string) => {
    onAddFilter(filterKey);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className='relative'>
      <div className='mb-2 flex w-full flex-1 items-center justify-between'>
        <label className='block text-sm font-medium'>Filter</label>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <TooltipV2
            tooltipBody={!filtersConfig?.length ? 'Please select a dataset first' : 'Add Filter'}
            side={SIDE_OPTIONS.BOTTOM}
            asChildTrigger
          >
            <PopoverTrigger asChild>
              <Button variant='ghost' size='xxsmall' disabled={!filtersConfig?.length} className='[&_svg]:size-3.5'>
                <SvgSpriteLoader id='plus' size={14} className='text-gray-700' />
              </Button>
            </PopoverTrigger>
          </TooltipV2>
          <SelectFilterMenuItem
            filtersConfig={filtersConfig ?? []}
            onAddFilter={onAddfilter}
            currentPageFilters={currentPageFilters ?? []}
            openClassName='max-h-[300px]'
            onClose={handleClose}
            position='end'
          />
        </Popover>
      </div>
    </div>
  );
};

export default FiltersMenuV2;
