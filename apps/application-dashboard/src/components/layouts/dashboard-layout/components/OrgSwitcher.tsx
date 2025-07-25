'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@zamp-platform/utils';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWhoAmIQuery } from '@/apis/auth';
import { useGetOrganizationsQuery } from '@/apis/people';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ORG_COLORS } from '@/constants/common.constants';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import { useLogout } from '@/hooks/useLogout';
import DropdownToggle from '@/modules/payments/move-money/components/DropdownToggle';
import { setIsOrgSwitchIsInProgress } from '@/store/slices/user';
import type { Organization } from '@/types/api/auth.types';
import OrgCard from 'components/layouts/dashboard-layout/components/OrgCard';
import SkeletonLoaderSidebarPages from 'components/layouts/dashboard-layout/components/SkeletonLoaderSidebarPages';

type OrgSwitcherProps = {
  isSidebarOpen: boolean;
};

export const OrgSwitcher: FC<OrgSwitcherProps> = ({ isSidebarOpen }) => {
  const { isOrgSwitchIsInProgress } = useAppSelector((state) => state.user);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isOrgSwitcherMenuOpen, setIsOrgSwitcherMenuOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization>();
  const { data: session } = useWhoAmIQuery(undefined, { refetchOnMountOrArgChange: false });

  const { logout, isLoggingOut } = useLogout();
  const {
    data: organizations,
    isLoading: loading,
    isError: error,
  } = useGetOrganizationsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const defaultOrgName = useMemo(() => session?.orgs?.[0]?.name ?? '', [session]);

  const handleOrgChange = (org: Organization) => {
    if (org.organization_id === selectedOrg?.organization_id) return;

    dispatch(setIsOrgSwitchIsInProgress(true));

    setSelectedOrg(org);
    setToLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID, org.organization_id);
    router.push(ROUTES_PATH.PROCESSES);
  };

  const selectedOrgColor = useMemo(
    () =>
      ORG_COLORS[
        organizations?.findIndex((org: Organization) => org.organization_id === selectedOrg?.organization_id) ?? 0
      ] ?? 'bg-GRAY_200',
    [organizations, selectedOrg],
  );

  useEffect(() => {
    if (organizations?.length) {
      const orgId = getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID);
      const isValidOrgId = organizations?.some((org: Organization) => org.organization_id === orgId);

      if (orgId && isValidOrgId) {
        setSelectedOrg(organizations?.find((org: Organization) => org.organization_id === orgId));
      } else {
        setSelectedOrg(organizations?.[0]);
        setToLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID, organizations?.[0]?.organization_id);
      }
    }
  }, [organizations]);

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
                {selectedOrg?.name?.[0] || defaultOrgName[0]}
              </div>
              <div className='f-12-450 flex-1 overflow-hidden text-ellipsis whitespace-nowrap'>
                {selectedOrg?.name || defaultOrgName}
              </div>
              {isSidebarOpen && (
                <DropdownToggle
                  isLoading={isOrgSwitchIsInProgress}
                  isShowMenu={isOrgSwitcherMenuOpen}
                  setIsShowMenu={setIsOrgSwitcherMenuOpen}
                />
              )}
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='z-9999 mr-1 flex w-[229px] flex-col gap-[2px] overflow-y-auto p-1'
          sideOffset={5}
        >
          <div className='flex max-h-[300px] flex-col gap-1 overflow-y-auto'>
            <CommonWrapper
              loader={<SkeletonLoaderSidebarPages />}
              skeletonType={SkeletonTypes.CUSTOM}
              isLoading={loading}
              isError={error}
            >
              {organizations?.map((item: Organization, idx) => (
                <DropdownMenuItem className='p-0' onClick={() => handleOrgChange(item)} key={idx}>
                  <OrgCard
                    isSelected={item?.organization_id === selectedOrg?.organization_id}
                    name={item?.name}
                    className={ORG_COLORS[idx]}
                  />
                </DropdownMenuItem>
              ))}
            </CommonWrapper>
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
