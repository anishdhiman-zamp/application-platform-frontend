'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useCheckDatasetCreationEnabled } from '@zamp-platform/dataset-create-edit';
import { Button } from '@zamp-platform/ui';
import {
  getCreateKnowledgeBaseRouteByProcessId,
  getKnowledgeBasedRouteByProcessId,
  ROUTES_PATH,
} from 'constants/routeConfig';
import { motion } from 'framer-motion';
import { useAppSelector } from 'hooks/toolkit';
import { BookOpen, PlusIcon } from 'lucide-react';
import ShareDatasetPopup from 'modules/data/components/ShareDatasetPopup';
import SharePagePopup from 'modules/page/SharePagePopup';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { RootState } from 'store';
import TooltipV2 from '@/components/common/TooltipV2';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { usePendingDatasetContext } from '@/context/pendingDataset.context';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { usePagesAndProcessesData } from '@/hooks/usePagesAndProcessesData';
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

  // Hide share button when creating a new dataset (source=creation)
  const isCreationMode = useCheckDatasetCreationEnabled();

  switch (true) {
    case pathname?.includes(SHARE_BTN_ALLOWED_ROUTES.PAGES):
      return <SharePagePopup pageId={params?.pageId || ''} />;
    case pathname?.includes(SHARE_BTN_ALLOWED_ROUTES.DATASETS):
      return <ShareDatasetPopup datasetId={params?.datasetId || ''} disable={isCreationMode} />;
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
  const { isEnabled: isZampInternalEnabled } = useFeatureFlag(FEATURE_FLAGS.ZAMP_INTERNAL);

  const { processes } = usePagesAndProcessesData();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams<{ processId: string }>();
  const processId = params?.processId;
  const { isProcessLive, isProcessDraft } = useMemo(() => {
    return {
      isProcessLive: processes?.find((process) => process?.process_id === processId)?.status === ProcessStatus.LIVE,
      isProcessDraft: processes?.find((process) => process?.process_id === processId)?.status === ProcessStatus.DRAFT,
    };
  }, [processes, processId]);

  const [isKnowledgeBaseEnabled, setIsKnowledgeBaseEnabled] = useState<boolean>(false);
  const { evaluate, ldClient } = useFeatureFlags();
  const isFeedbackEnabled = useIsFeedbackEnabled();
  const isCreateDatasetEnabled = useIsDatasetCreationEnabled();
  const { clearPendingData, setShouldAutoFocusTitle } = usePendingDatasetContext() || {};

  const handleCreateDataset = useCallback(() => {
    const datasetId = crypto.randomUUID();

    // Clear any previous pending data and set flag to auto-focus title
    clearPendingData?.();
    setShouldAutoFocusTitle?.(true);

    router.push(`/datasets/${datasetId}?tab=${DatasetTabsTypes.BLUEPRINT}&source=creation`);
  }, [router, clearPendingData, setShouldAutoFocusTitle]);

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
          {!isProcessDraft && (
            <TooltipV2 tooltipBody='Knowledge Base' side={SIDE_OPTIONS.BOTTOM} asChildTrigger>
              <Link
                prefetch
                href={
                  isProcessLive || !isZampInternalEnabled
                    ? getKnowledgeBasedRouteByProcessId(processId ?? '')
                    : getCreateKnowledgeBaseRouteByProcessId(processId ?? '')
                }
              >
                <Button id='knowledge-base-btn' size='small' variant='secondary' aria-label='Knowledge base'>
                  <BookOpen size={16} className='' />
                </Button>
              </Link>
            </TooltipV2>
          )}
          {isFeedbackEnabled && isProcessLive && <DraftFeedbackButton processId={processId} />}
          {isFeedbackEnabled && isProcessLive && (
            <Suspense>
              <FeedbackStatusButton processId={processId} />
            </Suspense>
          )}

          <ShareButton />
        </div>
      );
    }

    if (pathname === ROUTES_PATH.DATA && isCreateDatasetEnabled) {
      return (
        <Button
          id='create-dataset-btn'
          size='small'
          variant='default'
          onClick={handleCreateDataset}
          className='flex gap-1'
        >
          <PlusIcon className='h-3.5 w-3.5' />
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
    handleCreateDataset,
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
          <BreadCrumb isDraftProcess={!isProcessLive} />
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
