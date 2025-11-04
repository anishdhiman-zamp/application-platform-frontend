'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { FLEX_ALIGN_RIGHT, ZAMP_ICON } from 'constants/icons';
import { getKnowledgeBasedRouteByProcessId, ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import { BookOpen } from 'lucide-react';
import ShareDatasetPopup from 'modules/data/components/ShareDatasetPopup';
import SharePagePopup from 'modules/page/SharePagePopup';
import PaymentActions from 'modules/payments/components/PaymentActions';
import SharePaymentsPopup from 'modules/payments/share-resource/SharePaymentsPopup';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { RootState } from 'store';
import { toggleSidebar } from 'store/slices/layout-configs';
import { cn } from 'utils/common';
import TooltipV2 from '@/components/common/TooltipV2';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import ShareProcessPopup from '@/modules/process/common/ShareProcessPopup';
import { SIDE_OPTIONS } from '@/types/commonTypes';
import BreadCrumb from 'components/layouts/dashboard-layout/components/BreadCrumb';
import { SHARE_BTN_ALLOWED_ROUTES } from 'components/layouts/dashboard-layout/topbar/topbar.types';

const ShareButton = () => {
  const params = useParams<{ pageId: string; datasetId: string; paymentConfigId: string; processId: string }>();
  const pathname = usePathname();

  switch (true) {
    case pathname?.includes(SHARE_BTN_ALLOWED_ROUTES.PAGES):
      return <SharePagePopup pageId={params?.pageId || ''} />;
    case pathname?.includes(SHARE_BTN_ALLOWED_ROUTES.DATASETS):
      return <ShareDatasetPopup datasetId={params?.datasetId || ''} />;
    case pathname?.includes(SHARE_BTN_ALLOWED_ROUTES.PAYMENTS):
      return <SharePaymentsPopup paymentConfigId={params?.paymentConfigId || ''} />;
    case pathname?.includes(SHARE_BTN_ALLOWED_ROUTES.PROCESSES):
      return <ShareProcessPopup processId={params?.processId || ''} />;
    case pathname === SHARE_BTN_ALLOWED_ROUTES.DATASET:
      return null;
    default:
      return null;
  }
};

const Topbar = () => {
  const { isSidebarOpen } = useAppSelector((state: RootState) => state.layoutConfig);
  const pathname = usePathname();
  const params = useParams<{ processId: string }>();
  const processId = params?.processId;

  const dispatch = useAppDispatch();

  const [isKnowledgeBaseEnabled, setIsKnowledgeBaseEnabled] = useState<boolean>(false);
  const { evaluate, ldClient } = useFeatureFlags();

  useEffect(() => {
    if (ldClient) {
      evaluate(FEATURE_FLAGS.ENABLE_KNOWLEDGE_BASE)
        .then((res: string[]) => {
          if (res?.includes(processId ?? '')) {
            setIsKnowledgeBaseEnabled(true);
          } else {
            setIsKnowledgeBaseEnabled(false);
          }
        })
        .catch(() => {
          setIsKnowledgeBaseEnabled(false);
        });
    }
  }, [evaluate, ldClient, processId]);

  const renderRightSideActions = useMemo(() => {
    if (pathname?.includes(ROUTES_PATH.PAYMENTS)) {
      return (
        <div className='flex items-center gap-3'>
          <PaymentActions />
          <ShareButton />
        </div>
      );
    }

    if (pathname?.includes(getKnowledgeBasedRouteByProcessId(params?.processId ?? ''))) {
      return null;
    }

    if (pathname?.includes(ROUTES_PATH.PROCESSES)) {
      const processId = params?.processId;

      return (
        <div className='flex items-center gap-3'>
          {isKnowledgeBaseEnabled && (
            <TooltipV2 tooltipBody='Knowledge base' side={SIDE_OPTIONS.BOTTOM} asChildTrigger>
              <Link prefetch href={getKnowledgeBasedRouteByProcessId(processId ?? '')}>
                <Button id='knowledge-base-btn' size='small' variant='secondary'>
                  <BookOpen size={12} className='' />
                </Button>
              </Link>
            </TooltipV2>
          )}
          {/* <FeedbackStatusButton processId={processId} /> */}
          <ShareButton />
        </div>
      );
    }

    return <ShareButton />;
  }, [pathname, isKnowledgeBaseEnabled, processId]);

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <div className='flex h-12 items-center justify-between'>
      <div
        className={cn(
          'text-GRAY_700 flex h-12 items-center justify-between py-4 pr-5 pl-4 transition-all',
          isSidebarOpen ? 'w-60' : 'w-12',
        )}
      >
        <div className={cn('flex-1 transition-all', isSidebarOpen ? 'w-[204px] opacity-100' : 'w-0 opacity-0')}>
          <Image
            width={16}
            height={16}
            alt='zamp logo'
            className='w-4 cursor-pointer align-middle'
            src={ZAMP_ICON}
            priority
          />
        </div>
        <div className='flex-shrink-0'>
          <Image
            className='cursor-pointer'
            width={16}
            height={16}
            onClick={handleSidebarToggle}
            src={FLEX_ALIGN_RIGHT}
            alt='toggle sidebar'
          />
        </div>
      </div>

      <BreadCrumb isSidebarOpen={isSidebarOpen} />
      <div className='pr-8'>{renderRightSideActions}</div>
    </div>
  );
};

export default Topbar;
