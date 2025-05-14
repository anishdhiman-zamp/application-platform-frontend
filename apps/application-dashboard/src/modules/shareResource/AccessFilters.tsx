import { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import FiltersWrapper from '@/components/filter/filterMenu/FiltersWrapper';
import { defaultFnType } from '@/types/commonTypes';
import { checkIsObjectEmpty } from '@/utils/common';
import { useFiltersContextStore } from 'components/filter/filters.context';

type AccessFiltersProps = {
  onClick: defaultFnType;
  currentUserHasAdminAccess: boolean;
};

const AccessFilters: FC<AccessFiltersProps> = ({ onClick, currentUserHasAdminAccess }) => {
  const {
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();

  return (
    <div className='space-y-2'>
      <div className='text-GRAY_700 f-12-500'>has access to</div>
      <div className='border border-GRAY_400 rounded-md px-3 py-2.5 f-12-400 flex items-center justify-between'>
        <div className='w-[260px]'>
          {checkIsObjectEmpty(selectedFilters) ? (
            <span className='border border-GRAY_400 py-0.5 px-1.5 rounded-sm'>All Data</span>
          ) : (
            <FiltersWrapper
              label='Filter'
              filterConfig={filtersConfig ?? []}
              allowActions={false}
              className=''
              titleClassName='max-w-[130px]'
              controlClassName='bg-[#F7F7F7]'
            />
          )}
        </div>
        <Button
          variant='ghost'
          className='flex items-center gap-1 text-GRAY_900 cursor-pointer'
          onClick={onClick}
          size='xxsmall'
          disabled={!currentUserHasAdminAccess}
        >
          <span>Customise</span>
          <SvgSpriteLoader id='arrow-right' size={12} />
        </Button>
      </div>
    </div>
  );
};

export default AccessFilters;
