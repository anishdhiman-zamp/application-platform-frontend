import { useMemo, useState } from 'react';
import { Tabs, TabsContent } from '@zamp-platform/ui';
import AllArtifactsSideDrawer from 'modules/process/artifacts/components/AllArtifactsSideDrawer';
import ArtifactLoader from 'modules/process/artifacts/components/ArtifactLoader';
import ArtifactTopbar from 'modules/process/artifacts/components/ArtifactTopbar';
import DatasetArtifact from 'modules/process/artifacts/components/DatasetArtifact';
import EmailArtifactWrapper from 'modules/process/artifacts/components/EmailArtifactWrapper';
import { ARTIFACT_TYPE, type CTA_ACTION, PDF_DATASET_TAB } from 'modules/process/process.types';
import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetArtifactsByArtifactIdQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import type { EmailArtifactsResponseType, PdfArtifactsResponseType } from '@/types/api/processApi.types';
import type { MapAny } from '@/types/commonTypes';

const PdfArtifact = dynamic(() => import('modules/process/artifacts/components/PdfArtifact'), {
  ssr: false,
  loading: () => <ArtifactLoader />,
});

interface ArtifactsProps {
  onClose: () => void;
  onExpand: () => void;
  isExpanded: boolean;
  activeTab: PDF_DATASET_TAB;
  setActiveTab: (tab: PDF_DATASET_TAB) => void;
  artifactType: ARTIFACT_TYPE;
  artifactId: string;
  filters: MapAny;
  onArtifactClick: (artifactType: ARTIFACT_TYPE, artifactId: string, action?: CTA_ACTION, filters?: MapAny) => void;
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
  filters,
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
          loader={<ArtifactLoader />}
          skeletonType={SkeletonTypes.CUSTOM}
          isError={isError}
          refetchFunction={refetch}
          className='h-full w-full'
        >
          {artifactType === ARTIFACT_TYPE.PDF_DATASET && artifactData && id && (
            <>
              <TabsContent value={PDF_DATASET_TAB.DATASET} className='mt-0 h-full w-full flex-1'>
                <DatasetArtifact
                  datasetArtifact={artifactData as PdfArtifactsResponseType}
                  filters={filters}
                  key={id}
                />
              </TabsContent>
              <TabsContent value={PDF_DATASET_TAB.PDF} className='mt-0 h-full w-full flex-1'>
                <PdfArtifact pdfArtifact={artifactData as PdfArtifactsResponseType} artifactId={id} key={id} />
              </TabsContent>
            </>
          )}
          {artifactType === ARTIFACT_TYPE.EMAIL && artifactData && id && (
            <EmailArtifactWrapper artifactData={artifactData as EmailArtifactsResponseType} id={id} key={id} />
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
