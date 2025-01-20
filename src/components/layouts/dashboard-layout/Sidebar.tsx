import React from 'react';
import { useInitiateLogoutFlowQuery, useLazyLogoutQuery } from "apis/auth";
import { useGetPagesQuery } from 'apis/pages';
import { ICON_SPRITE_TYPES } from "constants/icons";
import { ROUTES_PATH, SIDEBAR_ITEMS } from "constants/routeConfig";
import { useRouter } from "next/router";
import { cn } from 'utils/common';
import PageNavTab from 'components/layouts/dashboard-layout/components/PageNavTab';
import SidebarTab from 'components/layouts/dashboard-layout/components/SidebarTab';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

interface SidebarProps {
  isSidebarOpen: boolean;
}

const Sidebar = ({ isSidebarOpen }: SidebarProps) => {
  const router = useRouter();
  const pathname = router.pathname;
  const pageId = router.query.id as string ?? '';
  const { data: initiateLogoutFlow, refetch: refetchLogoutFlow } = useInitiateLogoutFlowQuery();
  const [logOut] = useLazyLogoutQuery();

  const { data: pages } = useGetPagesQuery();

  const handleLogout = async () => {
    logOut(initiateLogoutFlow?.logout_url ?? '').then(() => {
      router.push(ROUTES_PATH.LOGIN)
    }).catch(() => {
      refetchLogoutFlow();
    });
  };

  return (
    <div className={cn('relative transition-all duration-300', isSidebarOpen ? 'w-60' : 'w-0')}>
      <div className='w-60'>
        <div className='px-2 border-b border-GRAY_400 pb-4'>
          {SIDEBAR_ITEMS.map((item) => (
            <SidebarTab
              key={item.label}
              name={item.label}
              path={item.path}
              iconId={item.iconId}
              iconCategory={item.iconCategory}
              isSelected={pathname === item?.path}
            />
          ))}
        </div>
        <div className='px-1 py-2.5'>
          <div className='f-11-600 text-GRAY_700 px-1.5 py-2'>Pages</div>
          {pages?.map((item) => (
            <PageNavTab key={item?.page_id} isSelected={pageId === item?.page_id} label={item?.name} pageId={item?.page_id} />
          ))}
        </div>
        <div className="border-t border-GRAY_400 px-4 py-3 absolute bottom-0 w-full cursor-pointer h-[57px]"
          onClick={handleLogout}>
          <div className="flex items-center gap-2.5 text-GRAY_900" >
            <SvgSpriteLoader iconCategory={ICON_SPRITE_TYPES.GENERAL} id='log-out-02' height={14} width={14} />
            <div className="f-13-500">
              Logout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
