import { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import {
  ACCESS_MESSAGES_ADMIN_ROLE,
  ACCESS_MESSAGES_CUSTOMISE_ACCESS,
} from 'modules/shareResource/shareResource.constants';
import TooltipV2 from '@/components/common/TooltipV2';
import FiltersWrapper from '@/components/filter/filterMenu/FiltersWrapper';
import { defaultFnType } from '@/types/commonTypes';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';
import { checkIsObjectEmpty } from '@/utils/common';
import { useFiltersContextStore } from 'components/filter/filters.context';

type AccessFiltersProps = {
  onClick: defaultFnType;
  currentUserHasAdminAccess: boolean;
  selectedRole: string;
  emptyFiltersTitle: string;
};

const AccessFilters: FC<AccessFiltersProps> = ({
  onClick,
  currentUserHasAdminAccess,
  selectedRole,
  emptyFiltersTitle,
}) => {
  const {
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();

  const tooltipText = !currentUserHasAdminAccess
    ? ACCESS_MESSAGES_CUSTOMISE_ACCESS
    : selectedRole === PERMISSION_ROLES.ADMIN
      ? ACCESS_MESSAGES_ADMIN_ROLE
      : '';

  const disabled = !currentUserHasAdminAccess || selectedRole === PERMISSION_ROLES.ADMIN;

  return (
    <div className='space-y-2'>
      <div className='text-GRAY_700 f-12-500'>has access to</div>
      <div className='border-GRAY_400 f-12-400 flex items-center justify-between rounded-md border px-3 py-2.5'>
        <div className='w-[260px]'>
          {checkIsObjectEmpty(selectedFilters) ? (
            <span className='border-GRAY_400 rounded-sm border px-1.5 py-0.5'>{emptyFiltersTitle}</span>
          ) : (
            <FiltersWrapper
              label='Filter'
              filterConfig={filtersConfig ?? []}
              allowActions={false}
              className=''
              controlClassName='bg-gray-80 max-w-[250px]'
            />
          )}
        </div>
        <TooltipV2 tooltipBody={tooltipText} asChildTrigger>
          <Button
            variant='ghost'
            className='text-GRAY_900 flex items-center gap-1'
            onClick={disabled ? undefined : onClick}
            size='xxsmall'
          >
            <span>Customise</span>
            <SvgSpriteLoader id='arrow-right' size={12} />
          </Button>
        </TooltipV2>
      </div>
    </div>
  );
};

export default AccessFilters;
