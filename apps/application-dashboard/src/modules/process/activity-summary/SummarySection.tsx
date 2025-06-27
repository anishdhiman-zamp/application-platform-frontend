import { type FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import Summary from 'modules/process/activity-summary/components/Summary';
import ArtifactsSkeleton from 'modules/process/activity-summary/loaders/ArtifactsSkeleton';
import type { HandleShowArtifactsProps } from 'modules/process/process.types';
import { useParams } from 'next/navigation';
import { useGetActivityArtifactsQuery, useGetActivitySummaryQuery } from '@/apis/processes';
import TooltipV2 from '@/components/common/TooltipV2';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { COLORS } from '@/constants/colors';
import ArtifactTag from '@/modules/process/common/ArtifactTag';
import NoWidgetData from '@/modules/widgets/components/NoWidgetData';
import { defaultFnType } from '@/types/commonTypes';

type SummarySectionProps = {
  handleShowArtifacts: (props: HandleShowArtifactsProps) => void;
  isExpanded: boolean;
  onExpand: defaultFnType;
};

const SummarySection: FC<SummarySectionProps> = ({ handleShowArtifacts, isExpanded, onExpand }) => {
  const params = useParams();
  const processId = params?.processId as string;
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
    <div className='animate-fade-in flex h-full w-full flex-col items-start justify-start overflow-y-auto'>
      <CommonWrapper
        isLoading={isLoadingSummary}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ArtifactsSkeleton />}
        isError={isErrorSummary}
        refetchFunction={refetchSummary}
        isNoData={!summary?.summary?.summary_items?.length}
        noDataBanner={<NoWidgetData text='No key details found' className='h-[400px]' />}
        errorCardStyle='w-full h-1/2'
        className='flex w-full flex-col items-start justify-start gap-y-3 px-6 pt-5 pb-6'
      >
        <div className='flex w-full items-center justify-between'>
          <p className='f-13-550'>Key Details</p>
          <TooltipV2 tooltipBody={isExpanded ? 'Collapse' : 'Expand'}>
            <SvgSpriteLoader
              id={isExpanded ? 'minimize-01' : 'expand-01'}
              size={12}
              color={COLORS.GRAY_1000}
              onClick={onExpand}
              className='animate-opacity cursor-pointer transition-all duration-300'
              key={isExpanded ? 'minimize-01' : 'expand-01'}
            />
          </TooltipV2>
        </div>
        {summary?.summary?.summary_items?.map((section) => <Summary key={section?.title} data={section} />)}
      </CommonWrapper>
      <div className='bg-GRAY_400 h-px w-full' />
      <CommonWrapper
        isLoading={isLoadingArtifacts}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ArtifactsSkeleton />}
        isError={isErrorArtifacts}
        refetchFunction={refetchArtifacts}
        isNoData={!artifacts?.artifacts?.length}
        noDataBanner={<NoWidgetData className='h-[400px]' text='No artifacts found' />}
        errorCardStyle='w-full h-1/2'
        className='flex w-full flex-col items-start justify-start gap-y-3 px-6 py-5'
      >
        <p className='f-13-550'>Artifacts</p>
        {artifacts?.artifacts?.map((artifact) => (
          <ArtifactTag
            key={artifact?.id}
            displayName={artifact?.artifact_data?.display_name}
            artifactType={artifact?.artifact_type}
            iconIdentifier={artifact?.artifact_data?.icon_identifier}
            onClick={() =>
              handleShowArtifacts({
                artifactType: artifact?.artifact_type,
                artifactId: artifact?.id ?? '',
              })
            }
            displayClassName='max-w-[200px]'
          />
        ))}
      </CommonWrapper>
    </div>
  );
};

export default SummarySection;
