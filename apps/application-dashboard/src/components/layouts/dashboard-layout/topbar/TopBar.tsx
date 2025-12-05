'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { KNOWLEDGE_BASED, ZAMP_ICON } from 'constants/icons';
import { getKnowledgeBasedRouteByProcessId, ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import { BookOpen } from 'lucide-react';
import ShareDatasetPopup from 'modules/data/components/ShareDatasetPopup';
import SharePagePopup from 'modules/page/SharePagePopup';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { RootState } from 'store';
import { toggleSidebar } from 'store/slices/layout-configs';
import { cn } from 'utils/common';
import FlexAlignRight from '@/assets/Icons/FlexAlignRight';
import TooltipV2 from '@/components/common/TooltipV2';
import { COLORS } from '@/constants/colors';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import WorkWithPace from '@/modules/chatbot/WorkWithPace';
import FeedbackStatusButton from '@/modules/feedback/feedback-status/FeedbackStatusButton';
import useIsFeedbackEnabled from '@/modules/feedback/useIsFeedbackEnabled';
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
  const isFeedbackEnabled = useIsFeedbackEnabled();

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
    if (pathname?.includes(getKnowledgeBasedRouteByProcessId(params?.processId ?? ''))) {
      return null;
    }

    if (pathname?.includes(ROUTES_PATH.PROCESSES)) {
      const processId = params?.processId;

      return (
        <div className='flex items-center gap-3'>
          {isFeedbackEnabled ? (
            <TooltipV2 tooltipBody='Knowledge base' side={SIDE_OPTIONS.BOTTOM} asChildTrigger>
              <Link prefetch href={getKnowledgeBasedRouteByProcessId(processId ?? '')}>
                <Button id='knowledge-base-btn' size='small' variant='secondary'>
                  <BookOpen size={12} className='' />
                </Button>
              </Link>
            </TooltipV2>
          ) : isKnowledgeBaseEnabled ? (
            <Link prefetch href={getKnowledgeBasedRouteByProcessId(processId ?? '')}>
              <Button id='knowledge-base-btn' size='small' variant='secondary' className='w-[146px]'>
                <div className='flex gap-1'>
                  <Image src={KNOWLEDGE_BASED} height={16} width={16} alt='' />
                  Knowledge Base
                </div>
              </Button>
            </Link>
          ) : null}
          {isFeedbackEnabled && <FeedbackStatusButton processId={processId} />}
          <ShareButton />
        </div>
      );
    }

    return <ShareButton />;
  }, [pathname, isKnowledgeBaseEnabled, processId, isFeedbackEnabled]);

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <div className='flex h-12 items-center'>
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
          <FlexAlignRight
            height={16}
            width={16}
            color={COLORS.GRAY_700}
            className='cursor-pointer'
            onClick={handleSidebarToggle}
          />
        </div>
      </div>
      <div className='flex w-full items-center'>
        <div className='min-w-0 flex-1'>
          <BreadCrumb isSidebarOpen={isSidebarOpen} />
        </div>
        <div className='flex-shrink-0'>
          <WorkWithPace />
        </div>
        <div className='flex flex-1 justify-end pr-8'>{renderRightSideActions}</div>
      </div>
    </div>
  );
};

export default Topbar;
