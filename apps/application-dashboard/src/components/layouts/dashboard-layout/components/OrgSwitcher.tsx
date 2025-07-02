'use client';

import { useEffect, useMemo, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import { LOCAL_STORAGE_KEYS, setToLocalStorage } from '@zamp-platform/utils';
import { useAppSelector } from 'hooks/toolkit';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RootState } from 'store';
import useGetAllOrganizations from '@/hooks/useGetAllOrganizations';
import { useLogout } from '@/hooks/useLogout';
import DropdownToggle from '@/modules/payments/move-money/components/DropdownToggle';
import type { Organization } from '@/types/api/auth.types';
import { MapAny } from '@/types/commonTypes';
import OrgCard from 'components/layouts/dashboard-layout/components/OrgCard';

const OrgData = ['BG_ORANGE_200', 'BG_GREEN_300', 'BG_RED_200', 'BG_BLUE_300', 'BG_BLUE_200'];

const OrgSwitcher = () => {
  const router = useRouter();
  const { user } = useAppSelector((state: RootState) => state.user);
  const { logout, isLoggingOut } = useLogout();

  const [isOrgSwitcherMenuOpen, setIsOrgSwitcherMenuOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<MapAny>();

  const organizations = useGetAllOrganizations();

  const handleOrgChange = (org: MapAny) => {
    if (org.organization_id === selectedOrg?.organization_id) return;

    setSelectedOrg(org);
    setToLocalStorage(LOCAL_STORAGE_KEYS.ORG_REGION, org.region);
    setToLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID, org.organization_id);

    router.push('/');

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const selectedOrgColor = useMemo(
    () =>
      OrgData[organizations?.findIndex((org) => org.organization_id === selectedOrg?.organization_id) ?? 0] ??
      'bg-GRAY_200',
    [organizations, selectedOrg],
  );

  useEffect(() => {
    setSelectedOrg(organizations?.find((org) => org.organization_id === user?.orgs?.[0]?.organization_id));
  }, [organizations, user]);

  return (
    <div>
      <DropdownMenu onOpenChange={setIsOrgSwitcherMenuOpen}>
        <DropdownMenuTrigger asChild>
          <div className='border-GRAY_400 absolute bottom-0 flex h-[57px] w-full cursor-pointer items-center gap-2.5 border-t px-4 py-3'>
            <div className='flex w-full items-center justify-between gap-2 select-none'>
              <div
                className={cn(
                  selectedOrgColor,
                  'f-10-500 flex h-6 w-6 items-center justify-center rounded-sm border-white',
                )}
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
            {organizations?.map((item: Organization, idx) => (
              <DropdownMenuItem className='p-0' onClick={() => handleOrgChange(item)} key={idx}>
                <OrgCard
                  isSelected={item?.organization_id === selectedOrg?.organization_id}
                  name={item?.name}
                  className={OrgData[idx]}
                />
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
