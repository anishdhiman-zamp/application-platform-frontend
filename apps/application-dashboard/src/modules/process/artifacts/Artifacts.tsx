import { useMemo, useState } from 'react';
import { Tabs, TabsContent } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import AllArtifactsSideDrawer from 'modules/process/artifacts/components/AllArtifactsSideDrawer';
import ArtifactTopbar from 'modules/process/artifacts/components/ArtifactTopbar';
import DatasetArtifact from 'modules/process/artifacts/components/DatasetArtifact';
import EmailArtifact from 'modules/process/artifacts/components/EmailArtifact';
import { ARTIFACT_TYPE, type CTA_ACTION, PDF_DATASET_TAB } from 'modules/process/process.types';
import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetArtifactsByArtifactIdQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { COLORS } from '@/constants/colors';
import type { EmailArtifactsResponseType, PdfArtifactsResponseType } from '@/types/api/processApi.types';

const PdfArtifact = dynamic(() => import('modules/process/artifacts/components/PdfArtifact'), {
  ssr: false,
});

interface ArtifactsProps {
  onClose: () => void;
  onExpand: () => void;
  isExpanded: boolean;
  activeTab: PDF_DATASET_TAB;
  setActiveTab: (tab: PDF_DATASET_TAB) => void;
  artifactType: ARTIFACT_TYPE;
  artifactId: string;
  onArtifactClick: (artifactType: ARTIFACT_TYPE, artifactId: string, action?: CTA_ACTION) => void;
}

const Artifacts = ({
  onClose,
  onExpand,
  isExpanded,
  activeTab,
  setActiveTab,
  artifactType,
  artifactId,
  onArtifactClick,
}: ArtifactsProps) => {
  const searchParams = useSearchParams();
  const params = useParams();
  const processId = searchParams?.get('processId') as string;
  const activityId = params?.activityId;

  const [allArtifactsSideDrawerOpen, setAllArtifactsSideDrawerOpen] = useState(false);

  const {
    data: artifacts,
    isLoading,
    isError,
    refetch,
  } = useGetArtifactsByArtifactIdQuery(
    {
      processId: processId as string,
      activityRunId: activityId as string,
      artifact_ids: artifactId,
    },
    {
      refetchOnMountOrArgChange: false,
      skip: !artifactId,
    },
  );

  const { id, artifactData, title } = useMemo(() => {
    if (!artifacts) {
      return {
        id: '',
        artifactData: null,
        title: '',
      };
    }

    return {
      id: artifacts.artifacts[0]?.id ?? '',
      artifactData: artifacts.artifacts[0]?.artifact_data ?? null,
      title: artifacts.artifacts[0]?.artifact_data?.display_name ?? '',
    };
  }, [artifacts]);

  return (
    <div className='animate-fade-in relative h-full w-full'>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as PDF_DATASET_TAB)}
        className='flex h-full max-w-full flex-col'
      >
        <ArtifactTopbar
          onClose={onClose}
          onExpand={onExpand}
          isExpanded={isExpanded}
          title={title}
          isPdfDataset={artifactType === ARTIFACT_TYPE.PDF_DATASET}
          onOpenAllArtifacts={() => setAllArtifactsSideDrawerOpen(true)}
        />
        <CommonWrapper
          isLoading={isLoading}
          loader={
            <div className='bg-BG_GRAY_2 flex h-full w-full flex-col items-center justify-center gap-y-1'>
              <SvgSpriteLoader id='stand' size={14} color={COLORS.GRAY_600} />
              <span className='f-13-450 text-GRAY_600 animate-pulse'>Loading artifact...</span>
            </div>
          }
          skeletonType={SkeletonTypes.CUSTOM}
          isError={isError}
          refetchFunction={refetch}
          className='h-full w-full'
        >
          {artifactType === ARTIFACT_TYPE.PDF_DATASET && artifactData && id && (
            <>
              <TabsContent value={PDF_DATASET_TAB.DATASET} className='mt-0 h-full w-full flex-1'>
                <DatasetArtifact datasetArtifact={artifactData as PdfArtifactsResponseType} key={id} />
              </TabsContent>
              <TabsContent value={PDF_DATASET_TAB.PDF} className='mt-0 h-full w-full flex-1'>
                <PdfArtifact pdfArtifact={artifactData as PdfArtifactsResponseType} artifactId={id} key={id} />
              </TabsContent>
            </>
          )}
          {artifactType === ARTIFACT_TYPE.EMAIL && artifactData && id && (
            <EmailArtifact emailArtifact={artifactData as EmailArtifactsResponseType} artifactId={id} key={id} />
          )}
        </CommonWrapper>

        <AllArtifactsSideDrawer
          onClose={() => setAllArtifactsSideDrawerOpen(false)}
          isOpen={allArtifactsSideDrawerOpen}
          onArtifactClick={onArtifactClick}
        />
      </Tabs>
    </div>
  );
};

export default Artifacts;
