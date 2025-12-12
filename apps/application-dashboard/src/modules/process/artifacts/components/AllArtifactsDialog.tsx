'use client';

import { X } from 'lucide-react';
import { ARTIFACT_TYPE, type HandleShowArtifactsProps } from 'modules/process/process.types';
import { getArtifactPrefixIconSrc } from 'modules/process/process.utils';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useGetActivityArtifactsQuery } from '@/apis/processes';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import SkeletonElement from '@/components/skeletons/SkeletonElement';
import { COLORS } from '@/constants/colors';
import { GMAIL, LINK, VERCEL_BLOB_ICON_URL } from '@/constants/icons';
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
    <div className='absolute inset-0 z-50 flex h-full w-full bg-[rgba(250,250,250,0.8)] backdrop-blur-sm'>
      <div className='animate-opacity flex h-full w-full gap-x-4 overflow-y-auto p-5'>
        {/* Close button */}
        <div onClick={onClose} className='mb-4 cursor-pointer self-start' aria-label='Close'>
          <X size={16} color={COLORS.GRAY_900} strokeWidth={1.8} />
        </div>

        <CommonWrapper
          className='flex flex-1 flex-col items-start justify-start gap-y-2 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
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

  const isExternalLink = artifact_type === ARTIFACT_TYPE.EXTERNAL_LINK;
  const isEmail = artifact_type === ARTIFACT_TYPE.EMAIL;
  const Icon = getArtifactPrefixIconSrc(artifact_type);

  const renderIcon = () => {
    if (isExternalLink) {
      return (
        <ImageWithFallback
          src={`${VERCEL_BLOB_ICON_URL}/${icon_identifier}`}
          fallback={LINK}
          alt={display_name}
          width={14}
          height={14}
          priority
        />
      );
    }

    if (isEmail) {
      return <Image src={GMAIL} alt={display_name} width={14} height={14} priority />;
    }

    return Icon ? <Icon size={14} className='text-GRAY_900 shrink-0' /> : null;
  };

  return (
    <div
      className='border-GRAY_500 hover:bg-BG_GRAY_2 active:bg-GRAY_100 flex w-80 cursor-pointer flex-col items-start justify-start gap-y-2.5 rounded-[10px] border-[0.5px] bg-white p-4.5'
      onClick={onClick}
      aria-label={`${artifact_type} artifact`}
      role='button'
    >
      {renderIcon()}
      <p className='text-GRAY_1000 f-14-500 w-full break-words'>{display_name}</p>
    </div>
  );
};

export default AllArtifactsDialog;
