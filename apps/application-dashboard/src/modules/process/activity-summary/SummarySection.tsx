import { type FC } from 'react';
import Summary from 'modules/process/activity-summary/components/Summary';
import ArtifactsSkeleton from 'modules/process/activity-summary/loaders/ArtifactsSkeleton';
import { ACTIVITY_LOGS_SUMMARY_MOCK_DATA } from 'modules/process/mock.data';
import { useGetActivityArtifactsQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import ArtifactTag from '@/modules/process/common/ArtifactTag';

type SummarySectionProps = {
  processId: string;
  activityId: string;
};

const SummarySection: FC<SummarySectionProps> = ({ processId, activityId }) => {
  const {
    data: artifacts,
    isLoading: isLoadingArtifacts,
    isError: isErrorArtifacts,
    refetch: refetchArtifacts,
  } = useGetActivityArtifactsQuery(
    {
      processId,
      activityRunId: activityId,
    },
    {
      skip: !processId || !activityId,
      refetchOnMountOrArgChange: false,
    },
  );

  return (
    <div className='flex flex-col items-start justify-start h-full min-w-max overflow-x-auto'>
      <div className='px-6 pt-5 pb-6 flex flex-col justify-start items-start w-full gap-y-3'>
        <p className='f-13-550'>Key Details</p>
        {ACTIVITY_LOGS_SUMMARY_MOCK_DATA?.summary?.map((section) => <Summary key={section.id} data={section} />)}
      </div>
      <div className='h-px w-full bg-GRAY_400' />
      <CommonWrapper
        isLoading={isLoadingArtifacts}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ArtifactsSkeleton />}
        isError={isErrorArtifacts}
        refetchFunction={refetchArtifacts}
        className='px-6 py-5 flex flex-col justify-start items-start w-full gap-y-3'
      >
        <p className='f-13-550'>Artifacts</p>
        {artifacts?.artifacts?.map((artifact) => (
          <ArtifactTag
            key={artifact?.id}
            displayName={artifact?.artifact_data?.display_name}
            type={artifact?.artifact_type}
          />
        ))}
      </CommonWrapper>
    </div>
  );
};

export default SummarySection;
