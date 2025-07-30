'use client';

import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ARTIFACT_TYPE, type HandleShowArtifactsProps } from 'modules/process/process.types';
import { getArtifactPrefixIconSrc } from 'modules/process/process.utils';
import { useParams } from 'next/navigation';
import { useGetActivityArtifactsQuery } from '@/apis/processes';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import SkeletonElement from '@/components/skeletons/SkeletonElement';
import { COLORS } from '@/constants/colors';
import { DATASET, LINK } from '@/constants/icons';
import { ActivityArtifactsItemType } from '@/types/api/processApi.types';
import { defaultFnType } from '@/types/commonTypes';

interface AllArtifactsDialogProps {
  onClose: defaultFnType;
  onArtifactClick: (props: HandleShowArtifactsProps) => void;
}

const AllArtifactsDialog = ({ onClose, onArtifactClick }: AllArtifactsDialogProps) => {
  const params = useParams();
  const processId = params?.processId as string;
  const activityId = params?.activityId;

  const {
    data: artifacts,
    isLoading: isLoadingArtifacts,
    isError: isErrorArtifacts,
    refetch: refetchArtifacts,
  } = useGetActivityArtifactsQuery(
    { processId: processId as string, activityRunId: activityId as string },
    {
      skip: !processId || !activityId,
      refetchOnMountOrArgChange: false,
    },
  );

  const handleArtifactClick = (props: HandleShowArtifactsProps) => {
    onArtifactClick(props);
    onClose();
  };

  return (
    <div className='absolute z-50 flex h-full w-full items-start justify-start bg-[rgba(250,250,250,0.8)] backdrop-blur-sm'>
      <div className='animate-opacity relative h-full w-full overflow-y-auto rounded-xl'>
        <div onClick={onClose} className='absolute top-5 left-4 cursor-pointer' aria-label='Close'>
          <SvgSpriteLoader id='x-close' color={COLORS.GRAY_1000} size={16} />
        </div>

        <CommonWrapper
          className='absolute left-8 flex h-full flex-col items-start justify-start gap-y-2 overflow-y-auto p-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          isLoading={isLoadingArtifacts}
          isError={isErrorArtifacts}
          skeletonType={SkeletonTypes.CUSTOM}
          loader={
            <>
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonElement className='h-24 w-80 rounded-lg' key={index} />
              ))}
            </>
          }
          refetchFunction={refetchArtifacts}
          errorCardStyle='w-full h-full'
        >
          <h2 className='text-GRAY_1000 f-14-500'>All Artifacts</h2>
          {artifacts?.artifacts?.map((artifact) => (
            <ArtifactItem
              key={artifact?.id}
              artifact={artifact}
              onClick={() =>
                handleArtifactClick({
                  artifactType: artifact?.artifact_type,
                  artifactId: artifact?.id ?? '',
                })
              }
            />
          ))}
        </CommonWrapper>
      </div>
    </div>
  );
};

const ArtifactItem = ({ artifact, onClick }: { artifact: ActivityArtifactsItemType; onClick: () => void }) => {
  const {
    artifact_type,
    artifact_data: { display_name, icon_identifier },
  } = artifact;

  const iconSrc = getArtifactPrefixIconSrc(artifact_type, icon_identifier);

  return (
    <div
      className='border-GRAY_500 hover:bg-BG_GRAY_2 active:bg-GRAY_100 flex w-80 cursor-pointer flex-col items-start justify-start gap-y-2.5 rounded-[10px] border-[0.5px] bg-white p-4.5'
      onClick={onClick}
      aria-label={`${artifact_type} artifact`}
      role='button'
    >
      <ImageWithFallback
        fallback={artifact_type === ARTIFACT_TYPE.EXTERNAL_LINK ? LINK : DATASET}
        src={iconSrc}
        alt={display_name}
        width={14}
        height={14}
        priority
      />
      <p className='text-GRAY_1000 f-14-500 w-full break-words'>{display_name}</p>
    </div>
  );
};

export default AllArtifactsDialog;
