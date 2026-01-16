'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { KNOWLEDGE_BASED } from 'constants/icons';
import {
  getCreateKnowledgeBaseRouteByProcessId,
  getKnowledgeBasedRouteByProcessId,
  ROUTES_PATH,
} from 'constants/routeConfig';
import { motion } from 'framer-motion';
import { useAppSelector } from 'hooks/toolkit';
import { BookOpen } from 'lucide-react';
import ShareDatasetPopup from 'modules/data/components/ShareDatasetPopup';
import SharePagePopup from 'modules/page/SharePagePopup';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { RootState } from 'store';
import { useGetProcessesQuery } from '@/apis/pages';
import TooltipV2 from '@/components/common/TooltipV2';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import WorkWithPace from '@/modules/chatbot/WorkWithPace';
import DraftFeedbackButton from '@/modules/feedback/components/DraftFeedbackButton';
import FeedbackStatusButton from '@/modules/feedback/feedback-status/FeedbackStatusButton';
import useIsFeedbackEnabled from '@/modules/feedback/useIsFeedbackEnabled';
import ShareProcessPopup from '@/modules/process/common/ShareProcessPopup';
import useIsDatasetCreationEnabled from '@/modules/process/hooks/useIsDatasetCreationEnabled';
import { DatasetTabsTypes } from '@/modules/process/process.types';
import { ProcessStatus } from '@/types/api/processApi.types';
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
  const openFeedbackConversations = useAppSelector((state: RootState) => state?.feedbacks?.openFeedbackConversations);
  const { data: processes } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const pathname = usePathname();
  const router = useRouter();
  const params = useParams<{ processId: string }>();
  const processId = params?.processId;
  const { isProcessLive } = useMemo(() => {
    return {
      isProcessLive: processes?.find((process) => process?.id === processId)?.status === ProcessStatus.LIVE,
    };
  }, [processes, processId]);

  const [isKnowledgeBaseEnabled, setIsKnowledgeBaseEnabled] = useState<boolean>(false);
  const { evaluate, ldClient } = useFeatureFlags();
  const isFeedbackEnabled = useIsFeedbackEnabled();
  const isCreateDatasetEnabled = useIsDatasetCreationEnabled();

  useEffect(() => {
    if (!ldClient) return;

    evaluate(FEATURE_FLAGS.ENABLE_KNOWLEDGE_BASE)
      .then((res: string[]) => {
        setIsKnowledgeBaseEnabled(res?.includes(processId ?? '') ?? false);
      })
      .catch(() => {
        setIsKnowledgeBaseEnabled(false);
      });
  }, [evaluate, ldClient, processId]);

  const renderRightSideActions = useMemo(() => {
    if (pathname?.includes(ROUTES_PATH.PROCESSES)) {
      const processId = params?.processId;

      return (
        <div className='flex items-center gap-3'>
          {isFeedbackEnabled ? (
            <TooltipV2 tooltipBody='Knowledge Base' side={SIDE_OPTIONS.BOTTOM} asChildTrigger>
              <Link
                prefetch
                href={
                  isProcessLive
                    ? getKnowledgeBasedRouteByProcessId(processId ?? '')
                    : getCreateKnowledgeBaseRouteByProcessId(processId ?? '')
                }
              >
                <Button id='knowledge-base-btn' size='small' variant='secondary' aria-label='Knowledge base'>
                  <BookOpen size={16} className='' />
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
          {isFeedbackEnabled && <DraftFeedbackButton processId={processId} />}
          {isFeedbackEnabled && (
            <Suspense>
              <FeedbackStatusButton processId={processId} />
            </Suspense>
          )}

          <ShareButton />
        </div>
      );
    }

    if (pathname === ROUTES_PATH.DATA && isCreateDatasetEnabled) {
      const handleCreateDataset = () => {
        router.push(`${ROUTES_PATH.DATA}?tab=${DatasetTabsTypes.BLUEPRINT}`);
      };

      return (
        <Button id='create-dataset-btn' size='small' variant='default' onClick={handleCreateDataset}>
          Create dataset
        </Button>
      );
    }

    return <ShareButton />;
  }, [
    pathname,
    isKnowledgeBaseEnabled,
    isCreateDatasetEnabled,
    processId,
    isFeedbackEnabled,
    openFeedbackConversations,
  ]);

  return (
    <motion.div
      initial={false}
      animate={{
        paddingLeft: isSidebarOpen ? 0 : 48,
      }}
      transition={{
        duration: 0.15,
        ease: [0.4, 0, 0.2, 1],
      }}
      className='flex h-12 w-full items-center'
    >
      <div className='min-w-0 flex-1'>
        <Suspense>
          <BreadCrumb />
        </Suspense>
      </div>
      <div className='-mi-6 flex-shrink-0'>
        <Suspense>
          <WorkWithPace isProcessLive={isProcessLive} />
        </Suspense>
      </div>
      <div className='flex flex-1 justify-end pr-8'>{renderRightSideActions}</div>
    </motion.div>
  );
};

export default Topbar;
