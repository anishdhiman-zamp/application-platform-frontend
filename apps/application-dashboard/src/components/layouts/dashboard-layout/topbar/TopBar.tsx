import { useMemo, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES, ZAMP_ICON } from 'constants/icons';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import ShareDatasetPopup from 'modules/data/components/ShareDatasetPopup';
import SharePagePopup from 'modules/page/SharePagePopup';
import PaymentActions from 'modules/payments/components/PaymentActions';
import SharePaymentsPopup from 'modules/payments/share-resource/SharePaymentsPopup';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { RootState } from 'store';
import { removeLastBreadcrumb, toggleSidebar } from 'store/slices/layout-configs';
import { SIZE_TYPES } from 'types/common/components';
import { cn } from 'utils/common';
import ShareActivityPopup from '@/modules/process/common/ShareActivityPopup';
import Input from 'components/common/input';
import BreadCrumb from 'components/layouts/dashboard-layout/components/BreadCrumb';
import { SHARE_BTN_ALLOWED_ROUTES } from 'components/layouts/dashboard-layout/topbar/topbar.types';

const Topbar = () => {
  const { isSidebarOpen } = useAppSelector((state: RootState) => state.layoutConfig);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const breadcrumbStack = useAppSelector((state: RootState) => state.layoutConfig.breadcrumbStack);
  const currentRoute = router.pathname;

  const renderShareButton = useMemo(() => {
    switch (true) {
      case currentRoute.includes(SHARE_BTN_ALLOWED_ROUTES.PAGES):
        return <SharePagePopup pageId={router?.query?.pageId as string} />;
      case currentRoute.includes(SHARE_BTN_ALLOWED_ROUTES.DATASETS):
        return <ShareDatasetPopup datasetId={router?.query?.datasetId as string} />;
      case currentRoute.includes(SHARE_BTN_ALLOWED_ROUTES.PAYMENTS):
        return <SharePaymentsPopup paymentConfigId={router?.query?.paymentConfigId as string} />;
      case currentRoute.includes(SHARE_BTN_ALLOWED_ROUTES.PROCESSES):
        return <ShareActivityPopup activityId={router?.query?.activityId as string} />;
      case currentRoute === SHARE_BTN_ALLOWED_ROUTES.DATASET:
        return null;
      default:
        return null;
    }
  }, [currentRoute, router?.query?.pageId, router?.query?.datasetId, router?.query?.paymentConfigId]);

  const renderRightSideActions = useMemo(() => {
    if (currentRoute.includes(ROUTES_PATH.PAYMENTS)) {
      return (
        <div className='flex items-center gap-3'>
          <PaymentActions />
          {renderShareButton}
        </div>
      );
    }

    return renderShareButton;
  }, [currentRoute, renderShareButton]);

  const handleBackClick = () => {
    dispatch(removeLastBreadcrumb());
    router.back();
  };

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <div className='h-12 flex items-center justify-between'>
      <div
        className={cn(
          'py-4 h-12 flex items-center justify-between text-GRAY_700 transition-all',
          isSidebarOpen ? 'w-[240px]' : 'w-[48px]',
        )}
      >
        <div className={cn('flex-1 transition-all pl-4', isSidebarOpen ? 'w-[203px] opacity-100' : 'w-0 opacity-0')}>
          <Image
            width={16}
            height={16}
            alt='zamp logo'
            className='w-4 align-middle cursor-pointer'
            src={ZAMP_ICON}
            priority={true}
          />
        </div>
        <div className={cn('border-r', isSidebarOpen ? 'border-BACKGROUND_GRAY_1' : ' border-GRAY_400')}>
          <SvgSpriteLoader
            className='cursor-pointer pr-5'
            width={16}
            height={16}
            onClick={handleSidebarToggle}
            iconCategory={ICON_SPRITE_TYPES.LAYOUT}
            id='flex-align-right'
          />
        </div>
      </div>
      <div
        className={cn('flex items-center gap-2 w-full h-full transition-all z-1000 bg-BACKGROUND_GRAY_1', {
          'pl-1': breadcrumbStack?.length <= 1 && isSidebarOpen,
        })}
      >
        {breadcrumbStack?.length > 1 && (
          <SvgSpriteLoader
            id='arrow-left'
            iconCategory={ICON_SPRITE_TYPES.ARROWS}
            height={16}
            width={16}
            onClick={handleBackClick}
            className='cursor-pointer'
          />
        )}
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
      <div className='pr-8'>{renderRightSideActions}</div>
    </div>
  );
};

export default Topbar;
