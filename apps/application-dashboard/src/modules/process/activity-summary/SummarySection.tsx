import { type FC } from 'react';
import Summary from 'modules/process/activity-summary/components/Summary';
import ArtifactsSkeleton from 'modules/process/activity-summary/loaders/ArtifactsSkeleton';
import type { ARTIFACT_TYPE, CTA_ACTION } from 'modules/process/process.types';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetActivityArtifactsQuery, useGetActivitySummaryQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import ArtifactTag from '@/modules/process/common/ArtifactTag';
import NoWidgetData from '@/modules/widgets/components/NoWidgetData';

type SummarySectionProps = {
  handleShowArtifacts: (artifactType: ARTIFACT_TYPE, artifactId: string, action?: CTA_ACTION) => void;
};

const SummarySection: FC<SummarySectionProps> = ({ handleShowArtifacts }) => {
  const searchParams = useSearchParams();
  const params = useParams();
  const processId = searchParams.get('processId') as string;
  const activityId = params?.activityId;

  const {
    data: summary,
    isLoading: isLoadingSummary,
    isError: isErrorSummary,
    refetch: refetchSummary,
  } = useGetActivitySummaryQuery(
    {
      processId: processId as string,
      activityRunId: activityId as string,
    },
    {
      skip: !processId || !activityId,
      refetchOnMountOrArgChange: false,
    },
  );

  const {
    data: artifacts,
    isLoading: isLoadingArtifacts,
    isError: isErrorArtifacts,
    refetch: refetchArtifacts,
  } = useGetActivityArtifactsQuery(
    {
      processId: processId as string,
      activityRunId: activityId as string,
    },
    {
      skip: !processId || !activityId,
      refetchOnMountOrArgChange: false,
    },
  );

  return (
    <div className='flex flex-col items-start justify-start h-full w-full overflow-y-auto animate-fade-in'>
      <CommonWrapper
        isLoading={isLoadingSummary}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ArtifactsSkeleton />}
        isError={isErrorSummary}
        refetchFunction={refetchSummary}
        isNoData={!summary?.summary?.summary_items?.length}
        noDataBanner={<NoWidgetData className='h-[400px]' text='No key details found' />}
        errorCardStyle='w-full h-1/2'
        className='px-6 pt-5 pb-6 flex flex-col justify-start items-start w-full gap-y-3'
      >
        <p className='f-13-550'>Key Details</p>
        {summary?.summary?.summary_items?.map((section) => <Summary key={section?.title} data={section} />)}
      </CommonWrapper>
      <div className='h-px w-full bg-GRAY_400' />
      <CommonWrapper
        isLoading={isLoadingArtifacts}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ArtifactsSkeleton />}
        isError={isErrorArtifacts}
        refetchFunction={refetchArtifacts}
        isNoData={!artifacts?.artifacts?.length}
        noDataBanner={<NoWidgetData className='h-[400px]' text='No artifacts found' />}
        errorCardStyle='w-full h-1/2'
        className='px-6 py-5 flex flex-col justify-start items-start w-full gap-y-3'
      >
        <p className='f-13-550'>Artifacts</p>
        {artifacts?.artifacts?.map((artifact) => (
          <ArtifactTag
            key={artifact?.id}
            displayName={artifact?.artifact_data?.display_name}
            type={artifact?.artifact_type}
            onClick={() => handleShowArtifacts(artifact?.artifact_type as ARTIFACT_TYPE, artifact?.id ?? '')}
            displayClassName='max-w-80'
          />
        ))}
      </CommonWrapper>
    </div>
  );
};

export default SummarySection;
