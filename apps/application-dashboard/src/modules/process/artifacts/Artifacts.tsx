import { useMemo, useState } from 'react';
import { Tabs } from '@zamp-platform/ui';
import AllArtifactsSideDrawer from 'modules/process/artifacts/components/AllArtifactsSideDrawer';
import ArtifactLoader from 'modules/process/artifacts/components/ArtifactLoader';
import ArtifactTopbar from 'modules/process/artifacts/components/ArtifactTopbar';
import EmailArtifactWrapper from 'modules/process/artifacts/components/email-artifact/EmailArtifactWrapper';
import { withArtifactContext } from 'modules/process/artifacts/context/artifact.context';
import {
  ARTIFACT_TYPE,
  type EmitHITLActionPayload,
  type HandleShowArtifactsProps,
  PDF_DATASET_TAB,
} from 'modules/process/process.types';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useGetArtifactsByArtifactIdQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import DatasetTabView from '@/modules/process/artifacts/components/pdf-dataset-artifact/DatasetTabView';
import { CompletedFieldsProvider } from '@/modules/process/artifacts/context/completedFields.context';
import type {
  BrowserArtifactsResponseType,
  DatasetArtifactsResponseType,
  EmailArtifactsResponseType,
  PdfArtifactsResponseType,
  PdfDatasetArtifactsResponseType,
} from '@/types/api/processApi.types';
import type { MapAny } from '@/types/commonTypes';

const BrowserArtifact = dynamic(
  () => import('@/modules/process/artifacts/components/browser-artifact/BrowserArtifacts'),
  {
    ssr: false,
    loading: () => <ArtifactLoader />,
  },
);

const PdfArtifact = dynamic(() => import('@/modules/process/artifacts/components/pdf-dataset-artifact/PdfArtifact'), {
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
  filters: MapAny;
  onArtifactClick: (props: HandleShowArtifactsProps) => void;
  missingFields: MapAny;
  emitHITLActionPayload: EmitHITLActionPayload;
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
  missingFields,
  emitHITLActionPayload,
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
      refetchOnMountOrArgChange: artifactType === ARTIFACT_TYPE.EMAIL,
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
          <div className='flex h-full w-full flex-1'>
            <CompletedFieldsProvider>
              <DatasetTabView
                key={id}
                datasetArtifact={artifactData as PdfDatasetArtifactsResponseType}
                filters={filters}
                missingFields={missingFields}
                emitHITLActionPayload={emitHITLActionPayload}
                processId={processId}
                activityId={activityId as string}
                showPdfSearch
                className='w-1/2'
              />
            </CompletedFieldsProvider>

            <PdfArtifact
              key={id}
              pdfArtifact={artifactData as PdfDatasetArtifactsResponseType}
              artifactId={id}
              processId={processId}
              isArtifactLoading={isFetching}
              className='w-1/2'
            />
          </div>
        );

      case ARTIFACT_TYPE.EMAIL:
        return (
          <EmailArtifactWrapper
            artifactData={artifactData as EmailArtifactsResponseType}
            artifactId={id}
            processId={processId}
            activityId={activityId as string}
            emitHITLActionPayload={emitHITLActionPayload}
            onClose={onClose}
            key={id}
          />
        );

      case ARTIFACT_TYPE.DATASET:
        return (
          <CompletedFieldsProvider>
            <DatasetTabView
              datasetArtifact={artifactData as DatasetArtifactsResponseType}
              filters={filters}
              missingFields={missingFields}
              emitHITLActionPayload={emitHITLActionPayload}
              processId={processId}
              activityId={activityId as string}
              key={id}
            />
          </CompletedFieldsProvider>
        );

      case ARTIFACT_TYPE.PDF:
        return (
          <PdfArtifact
            processId={processId}
            artifactId={id}
            pdfArtifact={artifactData as PdfArtifactsResponseType}
            isArtifactLoading={isFetching}
            key={id}
          />
        );

      case ARTIFACT_TYPE.BROWSER:
        return (
          <BrowserArtifact
            browserArtifact={artifactData as BrowserArtifactsResponseType}
            artifactId={id}
            processId={processId}
            key={id}
          />
        );

      default:
        return null;
    }
  }, [artifactType, artifactData, id, filters]);

  const showArtifactLoader = useMemo(() => {
    return isFetching && artifactType !== ARTIFACT_TYPE.PDF && activeTab !== PDF_DATASET_TAB.PDF;
  }, [isFetching, artifactType, activeTab]);

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
          onOpenAllArtifacts={() => setAllArtifactsSideDrawerOpen(true)}
        />
        <CommonWrapper
          isLoading={showArtifactLoader}
          loader={<ArtifactLoader />}
          skeletonType={SkeletonTypes.CUSTOM}
          isError={isError}
          refetchFunction={refetch}
          className='h-full w-full'
        >
          {artifactComponent}
        </CommonWrapper>

        {allArtifactsSideDrawerOpen && (
          <AllArtifactsSideDrawer
            onClose={() => setAllArtifactsSideDrawerOpen(false)}
            onArtifactClick={onArtifactClick}
          />
        )}
      </Tabs>
    </div>
  );
};

export default withArtifactContext(Artifacts);
