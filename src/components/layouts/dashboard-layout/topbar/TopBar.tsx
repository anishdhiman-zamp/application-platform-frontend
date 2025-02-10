import React, { FC, useMemo, useState } from 'react';
import { ICON_SPRITE_TYPES, ZAMP_ICON } from 'constants/icons';
import { useAppSelector } from 'hooks/toolkit';
import ShareDatasetPopup from 'modules/data/components/ShareDatasetPopup';
import SharePagePopup from 'modules/page/SharePagePopup';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { RootState } from 'store';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { cn } from 'utils/common';
import { Button } from 'components/common/button/Button';
import Input from 'components/common/input';
import BreadCrumb from 'components/layouts/dashboard-layout/components/BreadCrumb';
import { SHARE_BTN_ALLOWED_ROUTES, TopBarPropsType } from 'components/layouts/dashboard-layout/topbar/topbar.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const Topbar: FC<TopBarPropsType> = ({ isSidebarOpen, onSidebarToggle }) => {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const breadcrumbStack = useAppSelector((state: RootState) => state.layoutConfig.breadcrumbStack);
  const currentRoute = router.pathname;

  const renderShareButton = useMemo(() => {
    if (currentRoute.includes(SHARE_BTN_ALLOWED_ROUTES.PAGES)) {
      return <SharePagePopup pageId={router.query.id as string} />;
    } else if (currentRoute.includes(SHARE_BTN_ALLOWED_ROUTES.DATASETS)) {
      return <ShareDatasetPopup datasetId={router.query.id as string} />;
    } else {
      return (
        <Button
          type={BUTTON_TYPES.SECONDARY}
          id='share-page-to-audience'
          size={SIZE_TYPES.SMALL}
          className='!bg-GRAY_100'
          disabled
        >
          Share
        </Button>
      );
    }
  }, [currentRoute, router.query.id]);

  return (
    <div className='h-12 flex items-center justify-between'>
      <div
        className={cn(
          'py-4 h-12 flex items-center justify-between text-GRAY_700 transition-all duration-300',
          isSidebarOpen ? 'w-[240px]' : 'w-[48px]',
        )}
      >
        <div
          className={cn(
            'flex-1 transition-all duration-300 pl-4',
            isSidebarOpen ? 'w-[203px] opacity-100' : 'w-0 opacity-0',
          )}
        >
          <Image
            width={20}
            height={16}
            alt='zamp logo'
            className='w-5 align-middle cursor-pointer'
            src={ZAMP_ICON}
            priority={true}
          />
        </div>
        <div className={cn('border-r', isSidebarOpen ? 'border-BACKGROUND_GRAY_1' : ' border-GRAY_400')}>
          <SvgSpriteLoader
            className='cursor-pointer pr-5'
            onClick={onSidebarToggle}
            iconCategory={ICON_SPRITE_TYPES.LAYOUT}
            id='flex-align-right'
          />
        </div>
      </div>
      <div className='flex items-center gap-2 w-full pl-8 h-full'>
        <SvgSpriteLoader
          id='arrow-left'
          iconCategory={ICON_SPRITE_TYPES.ARROWS}
          height={16}
          width={16}
          onClick={router.back}
          className='cursor-pointer'
        />
        <BreadCrumb breadcrumbStack={breadcrumbStack} />
      </div>
      <Input
        placeholder='Search'
        value={search}
        size={SIZE_TYPES.SMALL}
        className='hidden'
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      <div className='pr-4'>{renderShareButton}</div>
    </div>
  );
};

export default Topbar;
