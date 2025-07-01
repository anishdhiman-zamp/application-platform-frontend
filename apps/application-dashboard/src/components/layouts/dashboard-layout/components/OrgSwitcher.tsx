'use client';

import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import { LOCAL_STORAGE_KEYS, setToLocalStorage } from '@zamp-platform/utils';
import { Loader2 } from 'lucide-react';
import { useGetOrganizationsQuery } from '@/apis/auth';
import { useLogout } from '@/hooks/useLogout';
import DropdownToggle from '@/modules/payments/move-money/components/DropdownToggle';
import { MapAny } from '@/types/commonTypes';
import OrgCard from 'components/layouts/dashboard-layout/components/OrgCard';

const OrgData = [
  {
    name: 'Zamp',
    className: 'bg-ORANGE_200',
    value: '-dev',
  },
  {
    name: 'Doordash',
    className: 'bg-GREEN_300',
    value: '-sg',
  },
  {
    name: 'Uber',
    className: 'bg-RED_200',
    value: '-me',
  },
];

const OrgSwitcher = () => {
  const [isOrgSwitcherMenuOpen, setIsOrgSwitcherMenuOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<MapAny>(OrgData[0]);
  const { logout, isLoggingOut } = useLogout();

  const { data: organizations } = useGetOrganizationsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  console.log('organizations', organizations);

  const handleOrgChange = (org: MapAny) => {
    setSelectedOrg(org);
    setToLocalStorage(LOCAL_STORAGE_KEYS.ORG_REGION, org.value);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div>
      <DropdownMenu onOpenChange={setIsOrgSwitcherMenuOpen}>
        <DropdownMenuTrigger asChild>
          <div className='border-GRAY_400 absolute bottom-0 flex h-[57px] w-full cursor-pointer items-center gap-2.5 border-t px-4 py-3'>
            <div className='flex w-full items-center justify-between gap-2 select-none'>
              <div
                className={`${selectedOrg?.className} f-10-500 flex h-6 w-6 items-center justify-center rounded-sm border-white`}
              >
                {selectedOrg?.name[0]}
              </div>
              <div className='f-12-450 flex-1'>{selectedOrg?.name}</div>
              <DropdownToggle isShowMenu={isOrgSwitcherMenuOpen} setIsShowMenu={setIsOrgSwitcherMenuOpen} />
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='z-9999 mr-1 flex w-[229px] flex-col gap-[2px] overflow-y-auto p-1'
          sideOffset={5}
        >
          <div className='flex max-h-[300px] flex-col gap-1 overflow-y-auto'>
            {OrgData.map((item: MapAny, idx) => (
              <DropdownMenuItem className='p-0' onClick={() => handleOrgChange(item)} key={idx}>
                <OrgCard isSelected={idx === 0} name={item?.name} className={item?.className} />
              </DropdownMenuItem>
            ))}
          </div>
          <div className='border-GRAY_400 mt-0.5 border-t pt-0.5' onClick={logout}>
            <div
              className={cn('text-GRAY_700 hover:bg-GRAY_100 flex cursor-pointer items-center gap-2 rounded-md p-1', {
                'cursor-not-allowed': isLoggingOut,
              })}
            >
              <div className='flex h-6 w-6 items-center justify-center'>
                <SvgSpriteLoader id='log-out-02' size={14} />
              </div>
              <div className='f-12-450 flex-1'>Logout</div>
              {isLoggingOut && <Loader2 className='w-4 animate-spin' />}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default OrgSwitcher;
