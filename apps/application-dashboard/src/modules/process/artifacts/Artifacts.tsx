import { useEffect, useMemo, useState } from 'react';
import AllArtifactsSideDrawer from 'modules/process/artifacts/components/AllArtifactsSideDrawer';
import ArtifactLoader from 'modules/process/artifacts/components/ArtifactLoader';
import ArtifactTopbar from 'modules/process/artifacts/components/ArtifactTopbar';
import EmailArtifactWrapper from 'modules/process/artifacts/components/email-artifact/EmailArtifactWrapper';
import {
  ARTIFACT_TYPE,
  type EmitHITLActionPayload,
  type HandleShowArtifactsProps,
} from 'modules/process/process.types';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useGetArtifactsByArtifactIdQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useAppDispatch } from '@/hooks/toolkit';
import DatasetTabView from '@/modules/process/artifacts/components/pdf-dataset-artifact/DatasetTabView';
import { useArtifactContextStore } from '@/modules/process/artifacts/context/artifact.context';
import { CompletedFieldsProvider } from '@/modules/process/artifacts/context/completedFields.context';
import { closeSidebar, openSidebar } from '@/store/slices/layout-configs';
import type {
  BrowserArtifactsResponseType,
  DatasetArtifactsResponseType,
  EmailArtifactsResponseType,
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
  filters: MapAny;
  onArtifactClick: (props: HandleShowArtifactsProps) => void;
  missingFields: MapAny;
  emitHITLActionPayload: EmitHITLActionPayload;
}

const Artifacts = ({
  onClose,
  onExpand,
  isExpanded,
  onArtifactClick,
  filters,
  missingFields,
  emitHITLActionPayload,
}: ArtifactsProps) => {
  const params = useParams();
  const processId = params?.processId as string;
  const activityId = params?.activityId;
  const dispatch = useAppDispatch();
  const [allArtifactsSideDrawerOpen, setAllArtifactsSideDrawerOpen] = useState(false);
  const {
    state: { artifactType, artifactId },
  } = useArtifactContextStore();

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
      skip: !artifactId || !artifactType,
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
              artifactId={artifactId}
              fileId={(artifactData as PdfDatasetArtifactsResponseType)?.pdf_file?.file_id}
              processId={processId}
              isArtifactLoading={isFetching}
              isSearchBarEnabled
              className='w-1/2'
            />
          </div>
        );

      case ARTIFACT_TYPE.EMAIL:
        return (
          <EmailArtifactWrapper
            key={id}
            artifactId={artifactId}
            artifactData={artifactData as EmailArtifactsResponseType}
            processId={processId}
            activityId={activityId as string}
            emitHITLActionPayload={emitHITLActionPayload}
            onClose={onClose}
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
            artifactId={artifactId}
            fileId={(artifactData as PdfDatasetArtifactsResponseType)?.pdf_file?.file_id}
            isArtifactLoading={isFetching}
            isSearchBarEnabled
            key={id}
          />
        );

      case ARTIFACT_TYPE.BROWSER:
        return (
          <BrowserArtifact
            browserArtifact={artifactData as BrowserArtifactsResponseType}
            artifactId={artifactId}
            processId={processId}
            key={id}
          />
        );

      default:
        return null;
    }
  }, [artifactType, artifactData, id, filters]);

  const showArtifactLoader = useMemo(() => {
    return isFetching && artifactType !== ARTIFACT_TYPE.PDF;
  }, [isFetching, artifactType]);

  useEffect(() => {
    dispatch(closeSidebar());

    return () => {
      dispatch(openSidebar());
    };
  }, [dispatch]);

  return (
    <div className='animate-fade-in relative h-full w-full'>
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
    </div>
  );
};

export default Artifacts;
