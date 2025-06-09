'use client';

import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ARTIFACT_ICON_MAPPING } from 'modules/process/process.constant';
import { ARTIFACT_TYPE, CTA_ACTION } from 'modules/process/process.types';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetActivityArtifactsQuery } from '@/apis/processes';
import SkeletonElement from '@/components/skeletons/SkeletonElement';
import { COLORS } from '@/constants/colors';
import { ActivityArtifactsItemType } from '@/types/api/processApi.types';
import { defaultFnType } from '@/types/commonTypes';

interface AllArtifactsDialogProps {
  onClose: defaultFnType;
  isOpen: boolean;
  onArtifactClick: (artifactType: ARTIFACT_TYPE, artifactId: string, action?: CTA_ACTION) => void;
}

const AllArtifactsDialog = ({ onClose, isOpen, onArtifactClick }: AllArtifactsDialogProps) => {
  const searchParams = useSearchParams();
  const params = useParams();
  const processId = searchParams?.get('processId') as string;
  const activityId = params?.activityId;

  const {
    data: artifacts,
    isLoading: isLoadingArtifacts,
    isError: isErrorArtifacts,
  } = useGetActivityArtifactsQuery(
    { processId: processId as string, activityRunId: activityId as string },
    {
      skip: !processId || !activityId,
      refetchOnMountOrArgChange: false,
    },
  );

  const handleArtifactClick = (artifactType: ARTIFACT_TYPE, artifactId: string, action?: CTA_ACTION) => {
    onArtifactClick(artifactType, artifactId, action);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key='backdrop'
          className='absolute z-50 flex h-full w-full items-start justify-start bg-[rgba(250,250,250,0.8)] backdrop-blur-sm'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            key='content'
            className='relative h-full w-full overflow-y-auto rounded-xl'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div onClick={onClose} className='absolute top-5 left-5 cursor-pointer' aria-label='Close'>
              <SvgSpriteLoader id='x-close' color={COLORS.GRAY_1000} size={16} />
            </div>

            <div className='absolute left-10 flex h-full flex-col items-start justify-start gap-y-2 overflow-y-auto p-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
              <h2 className='text-GRAY_1000 f-14-500'>All Artifacts</h2>

              {isLoadingArtifacts || isErrorArtifacts
                ? Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonElement className='h-24 w-80 rounded-lg' key={index} />
                  ))
                : artifacts?.artifacts?.map((artifact) => (
                    <ArtifactItem
                      key={artifact?.id}
                      artifact={artifact}
                      onClick={() => handleArtifactClick(artifact?.artifact_type as ARTIFACT_TYPE, artifact?.id)}
                    />
                  ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ArtifactItem = ({ artifact, onClick }: { artifact: ActivityArtifactsItemType; onClick: () => void }) => {
  const {
    artifact_type,
    artifact_data: { display_name },
  } = artifact;

  return (
    <div
      className='border-GRAY_500 hover:bg-BG_GRAY_2 active:bg-GRAY_100 flex w-80 cursor-pointer flex-col items-start justify-start gap-y-2.5 rounded-[10px] border-[0.5px] bg-white p-4.5'
      onClick={onClick}
      aria-label={`${artifact_type} artifact`}
      role='button'
    >
      <Image
        src={
          ARTIFACT_ICON_MAPPING[artifact_type as keyof typeof ARTIFACT_ICON_MAPPING]?.icon_url ??
          ARTIFACT_ICON_MAPPING[ARTIFACT_TYPE.PDF_DATASET]?.icon_url
        }
        alt={display_name}
        width={14}
        height={14}
        priority
      />
      <p className='text-GRAY_1000 f-14-500'>{display_name}</p>
    </div>
  );
};

export default AllArtifactsDialog;
