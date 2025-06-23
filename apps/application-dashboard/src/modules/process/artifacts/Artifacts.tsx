import { useMemo, useState } from 'react';
import { Tabs, TabsContent } from '@zamp-platform/ui';
import AllArtifactsSideDrawer from 'modules/process/artifacts/components/AllArtifactsSideDrawer';
import ArtifactLoader from 'modules/process/artifacts/components/ArtifactLoader';
import ArtifactTopbar from 'modules/process/artifacts/components/ArtifactTopbar';
import EmailArtifactWrapper from 'modules/process/artifacts/components/email-artifact/EmailArtifact';
import DatasetArtifact from 'modules/process/artifacts/components/pdf-dataset-artifact/DatasetArtifact';
import { ARTIFACT_TYPE, type CTA_ACTION, PDF_DATASET_TAB } from 'modules/process/process.types';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useGetArtifactsByArtifactIdQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import type {
  BrowserArtifactsResponseType,
  DatasetArtifactsResponseType,
  EmailArtifactsResponseType,
  PdfArtifactsResponseType,
  PdfDatasetArtifactsResponseType,
} from '@/types/api/processApi.types';
import type { MapAny } from '@/types/commonTypes';

const PdfArtifact = dynamic(() => import('@/modules/process/artifacts/components/pdf-dataset-artifact/PdfArtifact'), {
  ssr: false,
  loading: () => <ArtifactLoader />,
});

const BrowserArtifact = dynamic(
  () => import('@/modules/process/artifacts/components/browser-artifact/BrowserArtifacts'),
  {
    ssr: false,
    loading: () => <ArtifactLoader />,
  },
);

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
  const params = useParams();
  const processId = params?.processId as string;
  const activityId = params?.activityId;

  const [allArtifactsSideDrawerOpen, setAllArtifactsSideDrawerOpen] = useState(false);

  const {
    data: artifacts,
    isFetching,
    isError,
    refetch,
  } = useGetArtifactsByArtifactIdQuery(
    {
      processId,
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

    const artifact = artifacts.artifacts[0];

    return {
      id: artifact?.id ?? '',
      artifactData: artifact?.artifact_data ?? null,
      title: artifact?.artifact_data?.display_name ?? '',
    };
  }, [artifacts]);

  const artifactComponent = useMemo(() => {
    if (!artifactData || !id) return null;

    switch (artifactType) {
      case ARTIFACT_TYPE.PDF_DATASET:
        return (
          <>
            <TabsContent value={PDF_DATASET_TAB.DATASET} className='mt-0 h-full w-full flex-1'>
              <DatasetArtifact
                datasetArtifact={artifactData as PdfDatasetArtifactsResponseType}
                filters={filters}
                key={id}
              />
            </TabsContent>
            <TabsContent value={PDF_DATASET_TAB.PDF} className='mt-0 h-full w-full flex-1'>
              <PdfArtifact pdfArtifact={artifactData as PdfDatasetArtifactsResponseType} artifactId={id} key={id} />
            </TabsContent>
          </>
        );

      case ARTIFACT_TYPE.EMAIL:
        return (
          <EmailArtifactWrapper emailArtifact={artifactData as EmailArtifactsResponseType} artifactId={id} key={id} />
        );

      case ARTIFACT_TYPE.DATASET:
        return (
          <DatasetArtifact datasetArtifact={artifactData as DatasetArtifactsResponseType} filters={filters} key={id} />
        );

      case ARTIFACT_TYPE.PDF:
        return <PdfArtifact pdfArtifact={artifactData as PdfArtifactsResponseType} artifactId={id} key={id} />;

      case ARTIFACT_TYPE.BROWSER:
        return (
          <BrowserArtifact browserArtifact={artifactData as BrowserArtifactsResponseType} artifactId={id} key={id} />
        );

      default:
        return null;
    }
  }, [artifactType, artifactData, id, filters]);

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
          isLoading={isFetching}
          loader={<ArtifactLoader />}
          skeletonType={SkeletonTypes.CUSTOM}
          isError={isError}
          refetchFunction={refetch}
          className='h-full w-full'
        >
          {artifactComponent}
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
