'use client';

import { Button, toast } from '@zamp-platform/ui';
import { StopCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useStopProcessBuildingMutation } from '@/apis/processes';
import { PROCESS_BUILDING_ANIMATION } from '@/assets/lotties/process-building-animation';
import DynamicLottiePlayer from '@/components/common/DynamicLottiePlayer';
import { getCreateKnowledgeBaseRouteByProcessId } from '@/constants/routeConfig';
import { cn } from '@/utils/common';

interface ProcessInProcessBannerProps {
  shouldRedirect?: boolean;
  className?: string;
}

const ProcessInProcessBanner = ({ shouldRedirect = true, className = '' }: ProcessInProcessBannerProps) => {
  const params = useParams();
  const router = useRouter();
  const processId = params?.processId as string;

  const [stopProcessBuilding, { isLoading: isStopProcessBuildingLoading }] = useStopProcessBuildingMutation();

  const handleStopProcessBuilding = () => {
    stopProcessBuilding({ processId })
      .unwrap()
      .then(() => {
        if (shouldRedirect) {
          router.push(getCreateKnowledgeBaseRouteByProcessId(processId));
        }
      })
      .catch(() => {
        toast.error('Failed to stop process building');
      });
  };

  return (
    <div className={cn('flex h-full w-full flex-col items-center justify-center gap-2.5', className)}>
      <div className='h-[200px] w-[300px] overflow-hidden'>
        <DynamicLottiePlayer
          animationData={PROCESS_BUILDING_ANIMATION}
          style={{
            width: '100%',
            height: '100%',
            transform: 'scale(1.7)',
          }}
        />
      </div>
      <div className='flex flex-col items-center justify-center gap-1.5'>
        <div className='f-14-500'>We'll notify you when it's ready!</div>
        <div className='text-GRAY_700 f-13-450'>This may take some time, so sit back and relax.</div>
        <Button
          variant='secondary'
          size='medium'
          className='f-12-500 mt-2 h-7 gap-1.5 rounded-md px-3 py-1.5'
          onClick={handleStopProcessBuilding}
          disabled={isStopProcessBuildingLoading || !processId}
          isLoading={isStopProcessBuildingLoading}
        >
          <StopCircle size={14} className='p-px' />
          Stop and continue editing
        </Button>
      </div>
    </div>
  );
};

export default ProcessInProcessBanner;
