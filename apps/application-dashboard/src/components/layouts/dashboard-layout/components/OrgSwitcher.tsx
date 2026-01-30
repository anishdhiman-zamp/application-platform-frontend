'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import { DEFAULT_REGION } from '@zamp-platform/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import {
  getFromLocalStorage,
  LOCAL_STORAGE_KEYS,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@zamp-platform/utils';
import { usePathname, useRouter } from 'next/navigation';
import { useGetBaseUrlQuery } from '@/apis/auth';
import { useGetOrganizationsQuery } from '@/apis/people';
import { useSSEContext } from '@/app/_providers/sse-provider';
import DropdownToggle from '@/components/common/dropdown/DropdownToggle';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import LogoutButton from '@/components/layouts/dashboard-layout/components/LogoutButton';
import OrgCard from '@/components/layouts/dashboard-layout/components/OrgCard';
import SkeletonLoaderSidebarPages from '@/components/layouts/dashboard-layout/components/SkeletonLoaderSidebarPages';
import SkeletonElement from '@/components/skeletons/SkeletonElement';
import { ORG_COLORS } from '@/constants/common.constants';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import { setIsOrgSwitchIsInProgress } from '@/store/slices/user';
import type { Organization } from '@/types/api/auth.types';

type OrgSwitcherProps = {
  isSidebarOpen: boolean;
  menuContentClassName?: string;
  menuTriggerClassName?: string;
};

const OrgSwitcher: FC<OrgSwitcherProps> = ({ isSidebarOpen, menuContentClassName, menuTriggerClassName }) => {
  const { isOrgSwitchIsInProgress, user } = useAppSelector((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { disconnect: disconnectSSE } = useSSEContext();

  const [isOrgSwitcherMenuOpen, setIsOrgSwitcherMenuOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization>();

  const { data: baseUrlData } = useGetBaseUrlQuery(
    { email: user?.user_email ?? '' },
    { refetchOnMountOrArgChange: false, skip: !user?.user_email },
  );

  const regionList = useMemo(() => {
    return baseUrlData?.api_base_urls.filter((item) => item.region !== DEFAULT_REGION);
  }, [baseUrlData]);
  const {
    data: organizations,
    isLoading: loading,
    isError: error,
  } = useGetOrganizationsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const defaultOrgName = useMemo(() => user?.orgs?.[0]?.name ?? '', [user]);

  const handleOrgChange = (org: Organization) => {
    if (org.organization_id === selectedOrg?.organization_id) return;

    // Disconnect SSE gracefully before org switch to prevent readyState 2 errors
    // This avoids spurious errors when the page reloads during org switch
    disconnectSSE();

    dispatch(setIsOrgSwitchIsInProgress(true));

    setSelectedOrg(org);
    removeFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_OPEN_DYNAMIC_TABS);
    setToLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID, org.organization_id);
    if (pathname?.includes(ROUTES_PATH.CHAT)) {
      router.push(ROUTES_PATH.CHAT_SETTINGS_PEOPLE);
    } else {
      router.push(ROUTES_PATH.PROCESSES);
    }
  };

  const handleRegionChange = (region: { region: string; url: string }) => {
    window.open(`https://app-${region.region}.zamp.ai`, '_blank');
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
          <div
            className={cn(
              'border-GRAY_400 bg-BG_GRAY_1 flex h-[57px] w-full cursor-pointer items-center gap-2.5 border-t px-4 py-3',
              menuTriggerClassName,
            )}
            data-testid='org-switcher-trigger'
            role='button'
            aria-label='Switch organization'
          >
            <CommonWrapper
              isLoading={loading}
              skeletonType={SkeletonTypes.CUSTOM}
              loader={<SkeletonElement className='bg-GRAY_400 h-6 w-full rounded' />}
              className='flex w-full items-center justify-between gap-2 select-none'
            >
              <div
                className={cn(
                  selectedOrgColor,
                  'f-10-500 flex h-6 w-6 items-center justify-center rounded-sm border-white',
                )}
                data-testid='dummy'
              >
                {selectedOrg?.name?.[0] || defaultOrgName[0]}
              </div>
              <div
                className='f-12-450 flex-1 overflow-hidden text-ellipsis whitespace-nowrap'
                data-testid={`select-org-${selectedOrg?.name?.toLowerCase()}`}
              >
                {selectedOrg?.name || defaultOrgName}
              </div>
              {isSidebarOpen && (
                <DropdownToggle
                  isLoading={isOrgSwitchIsInProgress}
                  isShowMenu={isOrgSwitcherMenuOpen}
                  setIsShowMenu={setIsOrgSwitcherMenuOpen}
                />
              )}
            </CommonWrapper>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className={cn(
            'z-9999 mr-1 flex w-[229px] flex-col gap-[2px] overflow-y-auto p-1 [scrollbar-width:none]',
            menuContentClassName,
          )}
          sideOffset={5}
        >
          <div className='flex max-h-[150px] flex-col gap-1 overflow-y-auto [scrollbar-width:none]'>
            <CommonWrapper
              loader={<SkeletonLoaderSidebarPages />}
              skeletonType={SkeletonTypes.CUSTOM}
              isLoading={loading}
              isError={error}
            >
              {organizations?.map((item: Organization, idx) => (
                <DropdownMenuItem
                  className='p-0'
                  onClick={() => handleOrgChange(item)}
                  key={idx}
                  data-testid={`org-switcher-item-${item?.name?.toLowerCase()}`}
                >
                  <OrgCard
                    isSelected={item?.organization_id === selectedOrg?.organization_id}
                    name={item?.name}
                    className={ORG_COLORS[idx]}
                  />
                </DropdownMenuItem>
              ))}
              {regionList?.length
                ? regionList?.map((item, idx) => (
                    <DropdownMenuItem
                      className='p-0'
                      data-testid={`region-switcher-item-${item?.region?.toLowerCase()}`}
                      key={item.region}
                      onClick={() => handleRegionChange(item)}
                    >
                      <OrgCard
                        isSelected={false}
                        name={`${item.region.toUpperCase()} - Region`}
                        className={ORG_COLORS[organizations?.length ?? 0 + 1 + idx]}
                      />
                    </DropdownMenuItem>
                  ))
                : null}
            </CommonWrapper>
          </div>
          <LogoutButton />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default OrgSwitcher;
