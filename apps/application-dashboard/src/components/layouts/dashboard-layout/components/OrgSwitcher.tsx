'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_REGION } from '@zamp-platform/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Input } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import {
  getFromLocalStorage,
  LOCAL_STORAGE_KEYS,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@zamp-platform/utils';
import { Plus } from 'lucide-react';
import { PROVISIONING_STATUS } from 'modules/setup-workspace/setup-workspace.constants';
import { usePathname } from 'next/navigation';
import { useGetBaseUrlQuery } from '@/apis/auth';
import { useGetOrganizationsQuery } from '@/apis/people';
import { useSSEContext } from '@/app/_providers/sse-provider';
import DropdownToggle from '@/components/common/dropdown/DropdownToggle';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import CreateOrgModal from '@/components/layouts/dashboard-layout/components/CreateOrgModal';
import LogoutButton from '@/components/layouts/dashboard-layout/components/LogoutButton';
import OrgCard from '@/components/layouts/dashboard-layout/components/OrgCard';
import SkeletonLoaderSidebarPages from '@/components/layouts/dashboard-layout/components/SkeletonLoaderSidebarPages';
import SkeletonElement from '@/components/skeletons/SkeletonElement';
import { ORG_COLORS } from '@/constants/common.constants';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import { setIsOrgSwitchIsInProgress } from '@/store/slices/user';
import type { Organization } from '@/types/api/auth.types';
import {
  ACTIVE_ORG_ID_COOKIE,
  clearCookie,
  LAST_VISITED_PRODUCT_MODE_COOKIE,
  setCookie,
  USER_SESSION_COOKIE,
} from '@/utils/cookie';
import {
  getLandingRoute,
  getLastVisitedLandingRoute,
  getProductModeFromPath,
  saveLastVisitedProductMode,
} from '@/utils/route.util';
import { syncOrganizationIdToSW } from '@/utils/serviceWorker';

type OrgSwitcherProps = {
  isSidebarOpen: boolean;
  menuContentClassName?: string;
  menuTriggerClassName?: string;
  macs?: boolean;
};

const OrgSwitcher: FC<OrgSwitcherProps> = ({
  isSidebarOpen,
  menuContentClassName,
  menuTriggerClassName,
  macs = false,
}) => {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [searchInputEl, setSearchInputEl] = useState<HTMLInputElement | null>(null);
  const { isOrgSwitchIsInProgress, user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const { disconnect: disconnectSSE } = useSSEContext();
  const pathname = usePathname();

  const [isOrgSwitcherMenuOpen, setIsOrgSwitcherMenuOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization>();
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [orgToProvision, setOrgToProvision] = useState<Organization | null>(null);

  const { data: baseUrlData } = useGetBaseUrlQuery(
    { email: user?.user_email ?? '' },
    { refetchOnMountOrArgChange: false, skip: !user?.user_email },
  );

  const regionList = baseUrlData?.api_base_urls.filter((item) => item.region !== DEFAULT_REGION);
  const {
    data: organizations,
    isLoading: loading,
    isError: error,
    refetch: refetchOrganizations,
  } = useGetOrganizationsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const defaultOrgName = user?.orgs?.[0]?.name ?? '';

  const performOrgSwitch = useCallback(
    (org: Organization) => {
      // Disconnect SSE gracefully before org switch to prevent readyState 2 errors
      // This avoids spurious errors when the page reloads during org switch
      disconnectSSE();
      dispatch(setIsOrgSwitchIsInProgress(true));

      removeFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_OPEN_DYNAMIC_TABS);
      removeFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILE_TREE_EXPANDED_PATHS);
      setToLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID, org.organization_id);
      setCookie(ACTIVE_ORG_ID_COOKIE, org.organization_id);
      clearCookie(USER_SESSION_COOKIE);
      syncOrganizationIdToSW();
      window.location.href = getLandingRoute(org.product);
    },
    [disconnectSSE, dispatch],
  );

  const handleOrgChange = (org: Organization) => {
    if (org.organization_id === selectedOrg?.organization_id) return;

    if (org.provisioning_status && org.provisioning_status !== PROVISIONING_STATUS.COMPLETED) {
      setOrgToProvision(org);
      setShowCreateOrgModal(true);
      setIsOrgSwitcherMenuOpen(false);

      return;
    }

    performOrgSwitch(org);
    saveLastVisitedProductMode(pathname || '/');
    const currentMode = getProductModeFromPath(pathname || '/');

    setCookie(LAST_VISITED_PRODUCT_MODE_COOKIE, currentMode);

    removeFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_OPEN_DYNAMIC_TABS);
    removeFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILE_TREE_EXPANDED_PATHS);
    setToLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID, org.organization_id);
    setCookie(ACTIVE_ORG_ID_COOKIE, org.organization_id);
    clearCookie(USER_SESSION_COOKIE);
    syncOrganizationIdToSW();
    window.location.href = getLastVisitedLandingRoute();
  };

  const handleCreateOrgModalClose = () => {
    setShowCreateOrgModal(false);
    setOrgToProvision(null);
    refetchOrganizations();
  };

  const handleNewOrgReady = useCallback(
    (org: Organization) => {
      setShowCreateOrgModal(false);
      setOrgToProvision(null);
      performOrgSwitch(org);
    },
    [performOrgSwitch],
  );

  const handleRegionChange = (region: { region: string; url: string }) => {
    window.open(`https://app-${region.region}.zamp.ai`, '_blank');
  };

  const selectedOrgColor =
    ORG_COLORS[
      organizations?.findIndex((org: Organization) => org.organization_id === selectedOrg?.organization_id) ?? 0
    ] ?? 'bg-GRAY_200';

  const filteredOrganizations = !searchQuery.trim()
    ? organizations
    : organizations?.filter((org: Organization) => org.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const showSearchBox = (organizations?.length ?? 0) > 5;

  const handleOpenChange = (open: boolean) => {
    setIsOrgSwitcherMenuOpen(open);
    if (!open) {
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setHighlightedIndex(-1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const itemCount = filteredOrganizations?.length ?? 0;

    switch (e.key) {
      case KEYBOARD_KEYS.ARROW_DOWN:
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : 0));
        break;
      case KEYBOARD_KEYS.ARROW_UP:
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : itemCount - 1));
        break;
      case KEYBOARD_KEYS.ENTER:
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOrganizations?.[highlightedIndex]) {
          handleOrgChange(filteredOrganizations[highlightedIndex]);
        }
        break;
      case KEYBOARD_KEYS.ESCAPE:
        setIsOrgSwitcherMenuOpen(false);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex]);

  const renderOrganizationList = () => {
    if (filteredOrganizations?.length === 0 && searchQuery.trim()) {
      return <div className='f-12-400 text-GRAY_600 px-2 py-3 text-center'>No organizations found</div>;
    }

    return filteredOrganizations?.map((item: Organization, idx) => {
      const originalIdx =
        organizations?.findIndex((org: Organization) => org.organization_id === item.organization_id) ?? 0;
      const isHighlighted = idx === highlightedIndex;

      return (
        <DropdownMenuItem
          ref={(el) => {
            itemRefs.current[idx] = el;
          }}
          className={cn('p-0', isHighlighted && 'bg-GRAY_200')}
          onClick={() => handleOrgChange(item)}
          key={item?.organization_id}
          data-testid={`org-switcher-item-${item?.name?.toLowerCase()}`}
        >
          <OrgCard
            isSelected={item?.organization_id === selectedOrg?.organization_id}
            name={item?.name}
            className={ORG_COLORS[originalIdx]}
          />
        </DropdownMenuItem>
      );
    });
  };

  useEffect(() => {
    if (organizations?.length) {
      const orgId = getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID);
      const isValidOrgId = organizations?.some((org: Organization) => org.organization_id === orgId);

      if (orgId && isValidOrgId) {
        const activeOrg = organizations?.find((org: Organization) => org.organization_id === orgId);

        setSelectedOrg(activeOrg);
        setCookie(ACTIVE_ORG_ID_COOKIE, activeOrg?.organization_id ?? '');
      } else {
        setSelectedOrg(organizations?.[0]);
        setToLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID, organizations?.[0]?.organization_id);
        setCookie(ACTIVE_ORG_ID_COOKIE, organizations?.[0]?.organization_id ?? '');
      }
      syncOrganizationIdToSW();
    }
  }, [organizations]);

  return (
    <div>
      <DropdownMenu onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <div
            className={cn(
              'border-GRAY_400 bg-BG_GRAY_1 flex h-[57px] w-full cursor-pointer items-center gap-2.5 px-4 py-3',
              macs ? 'border-b' : 'border-t',
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
          align={macs ? 'center' : 'end'}
          className={cn(
            'bg-BG_WHITE z-9999 flex flex-col gap-[2px] overflow-y-auto p-1 [scrollbar-width:none]',
            menuContentClassName,
            macs ? 'w-60' : 'mr-1 w-[230px]',
          )}
          sideOffset={macs ? -50 : 5}
          onMouseMove={() => showSearchBox && searchInputEl?.focus()}
        >
          {showSearchBox && (
            <div className='px-1 pb-1'>
              <Input
                ref={setSearchInputEl}
                type='text'
                size='small'
                placeholder='Search organization...'
                className='bg-BG_WHITE mt-1'
                autoFocus
                value={searchQuery}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
          )}
          <div
            className={cn(
              'flex max-h-[150px] flex-col gap-1 overflow-y-auto [scrollbar-width:none]',
              showSearchBox && 'min-h-[150px]',
            )}
          >
            <CommonWrapper
              loader={<SkeletonLoaderSidebarPages />}
              skeletonType={SkeletonTypes.CUSTOM}
              isLoading={loading}
              isError={error}
            >
              {renderOrganizationList()}
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
                        className={ORG_COLORS[(organizations?.length ?? 0) + 1 + idx]}
                      />
                    </DropdownMenuItem>
                  ))
                : null}
            </CommonWrapper>
          </div>
          <DropdownMenuItem
            className='p-0'
            data-testid='org-switcher-new-organization'
            onClick={() => {
              setOrgToProvision(null);
              setShowCreateOrgModal(true);
              setIsOrgSwitcherMenuOpen(false);
            }}
          >
            <div className='hover:bg-GRAY_100 text-GRAY_1000 flex w-full items-center gap-2 rounded-md p-2'>
              <Plus className='text-GRAY_700 h-4 w-4 shrink-0' aria-hidden />
              <span className='f-12-450'>New organization</span>
            </div>
          </DropdownMenuItem>
          {!macs && <LogoutButton />}
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateOrgModal
        open={showCreateOrgModal}
        onClose={handleCreateOrgModalClose}
        orgToProvision={orgToProvision}
        onOrgReady={handleNewOrgReady}
      />
    </div>
  );
};

export default OrgSwitcher;
