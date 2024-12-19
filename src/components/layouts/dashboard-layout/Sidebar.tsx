import React from 'react';
import { useInitiateLogoutFlowQuery, useLazyLogoutQuery } from "apis/auth";
import { ICON_SPRITE_TYPES, ZAMP_ICON } from "constants/icons";
import { ROUTES_PATH, SIDEBAR_ITEMS } from "constants/routeConfig";
import Image from "next/image";
import { useRouter } from "next/router";
import SidebarTab from 'components/layouts/dashboard-layout/components/SidebarTab';
import WorkspaceSwitcher from 'components/layouts/dashboard-layout/components/WorkspaceSwitcher';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const Sidebar = () => {
  const router = useRouter();
  const pathname = router.pathname;
  const { data: initiateLogoutFlow, refetch: refetchLogoutFlow } = useInitiateLogoutFlowQuery();
  const [logOut] = useLazyLogoutQuery();

  const handleLogout = async () => {
    logOut(initiateLogoutFlow?.logout_url ?? '').then(() => {
      router.push(ROUTES_PATH.LOGIN)
    }).catch(() => {
      refetchLogoutFlow();
    });
  };

  return (
    <div className="w-60 relative">
      <div className="p-4 h-12 flex items-center justify-between text-GRAY_700">
        <Image
          width={20}
          height={16}
          alt='zamp logo'
          className='w-5 align-middle cursor-pointer'
          src={ZAMP_ICON}
          priority={true}
        />
        <SvgSpriteLoader iconCategory={ICON_SPRITE_TYPES.LAYOUT} id='flex-align-right' />
      </div>
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
      <WorkspaceSwitcher />
      <div className="border-t border-GRAY_400 px-4 py-3 absolute bottom-0 w-full cursor-pointer"
        onClick={handleLogout}>
        <div className="flex items-center gap-2.5 text-GRAY_900" >
          <SvgSpriteLoader iconCategory={ICON_SPRITE_TYPES.GENERAL} id='log-out-02' height={14} width={14} />
          <div className="f-13-500">
            Logout
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
