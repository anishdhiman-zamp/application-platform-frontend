'use client';

import { useMemo, useState } from 'react';
import { Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { useRouter } from 'next/navigation';
import { useGetDatasetListingQuery } from '@/apis/dataset';
import { useGetPagesQuery } from '@/apis/pages';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { getChatDatasetRoute, getChatPageSheetRoute } from '@/constants/routeConfig';
import { ARTIFACT_ICON_MAP, ARTIFACTS_PAGE_SIZE, ARTIFACTS_TABS } from '@/modules/pace/artifacts/artifacts.constants';
import { Artifact } from '@/modules/pace/artifacts/artifacts.types';
import { usePaceContext } from '@/modules/pace/pace.context';
import { DynamicTabType } from '@/modules/pace/pace.types';
import { findTimeDifference } from '@/utils/common';

const ArtifactIcon = ({ type }: { type: DynamicTabType }) => {
  const Icon = ARTIFACT_ICON_MAP[type];

  return <Icon size={16} className='text-GRAY_900' />;
};

interface ArtifactItemProps {
  artifact: Artifact;
  onClick: (artifact: Artifact) => void;
}

const ArtifactItem = ({ artifact, onClick }: ArtifactItemProps) => (
  <div
    className='hover:bg-BG_GRAY_2 flex cursor-pointer items-center justify-between rounded-md p-3'
    onClick={() => onClick(artifact)}
    role='button'
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onClick(artifact);
      }
    }}
  >
    <div className='flex items-center gap-x-2.5'>
      <div className='border-GRAY_400 flex h-8 w-8 items-center justify-center rounded-md border p-2'>
        <ArtifactIcon type={artifact.type} />
      </div>
      <div className='flex flex-col'>
        <span className='f-13-500 text-GRAY_1000'>{artifact.name}</span>
        <span className='f-10-400 text-GRAY_700'>{artifact.updatedAt}</span>
      </div>
    </div>
  </div>
);

const ArtifactsPage = () => {
  const router = useRouter();
  const { openDynamicTab } = usePaceContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const {
    data: pagesData,
    isFetching: isFetchingPages,
    isError: isErrorPages,
    refetch: refetchPages,
  } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const {
    data: datasetsData,
    isFetching: isFetchingDatasets,
    isError: isErrorDatasets,
    refetch: refetchDatasets,
  } = useGetDatasetListingQuery(
    { page: 1, pageSize: ARTIFACTS_PAGE_SIZE },
    {
      refetchOnMountOrArgChange: false,
    },
  );

  const isFetching = isFetchingPages || isFetchingDatasets;
  const isError = isErrorPages || isErrorDatasets;

  const pages: Artifact[] = useMemo(() => {
    if (!pagesData) return [];

    return pagesData
      .filter((page) => page.sheets.length > 0)
      .map((page) => ({
        id: page.page_id,
        name: page.name,
        type: DynamicTabType.PAGE,
        updatedAt: findTimeDifference(page.updated_at),
        sheetId: page.sheets[0].sheet_id,
      }));
  }, [pagesData]);

  const datasets: Artifact[] = useMemo(() => {
    if (!datasetsData?.datasets) return [];

    return datasetsData.datasets.map((dataset) => ({
      id: dataset.id,
      name: dataset.title,
      type: DynamicTabType.DATASET,
      updatedAt: findTimeDifference(dataset.updatedAt),
    }));
  }, [datasetsData]);

  const filteredPages = useMemo(() => {
    if (!searchQuery) return pages;

    return pages.filter((page) => page.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [pages, searchQuery]);

  const filteredDatasets = useMemo(() => {
    if (!searchQuery) return datasets;

    return datasets.filter((dataset) => dataset.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [datasets, searchQuery]);

  const handleArtifactClick = (artifact: Artifact) => {
    const path =
      artifact.type === DynamicTabType.PAGE && artifact.sheetId
        ? getChatPageSheetRoute(artifact.id, artifact.sheetId)
        : getChatDatasetRoute(artifact.id);

    openDynamicTab({
      id: artifact.id,
      name: artifact.name,
      type: artifact.type,
      path,
    });

    router.push(path);
  };

  return (
    <div className='mx-auto flex h-full w-full max-w-[700px] flex-col gap-y-8 overflow-hidden px-6 pt-15'>
      <h1 className='f-20-500 text-GRAY_1000 shrink-0'>Artifacts</h1>
      <Input
        placeholder='Search'
        value={searchQuery}
        autoFocus
        disabled={isFetching}
        onChange={(e) => setSearchQuery(e.target.value)}
        className='f-12-450 placeholder:text-GRAY_500 h-8 p-3'
      />

      <CommonWrapper
        isLoading={isFetching}
        loader={
          <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='h-[calc(100vh-250px)]' />
        }
        skeletonType={SkeletonTypes.CUSTOM}
        errorCardStyle='h-[calc(100vh-250px)]'
        isError={isError}
        refetchFunction={isErrorPages ? refetchPages : refetchDatasets}
        disableAnimation
        className='flex min-h-0 flex-1 flex-col'
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className='flex min-h-0 w-full flex-1 flex-col'>
          <TabsList className='mb-4 flex h-auto shrink-0 items-center justify-start gap-x-3 bg-transparent p-0'>
            {ARTIFACTS_TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'f-12-500 flex h-6 items-center gap-x-1.5 rounded border-none px-2 py-1 data-[state=active]:border-none data-[state=active]:shadow-none',
                  'text-GRAY_700 hover:text-GRAY_900 data-[state=active]:bg-GRAY_100 data-[state=active]:text-GRAY_1000',
                )}
              >
                {tab.icon && <tab.icon size={12} />}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value='all' className='flex-1 overflow-y-auto [scrollbar-width:thin]'>
            {filteredPages.map((artifact) => (
              <ArtifactItem key={artifact.id} artifact={artifact} onClick={handleArtifactClick} />
            ))}
            {filteredDatasets.map((artifact) => (
              <ArtifactItem key={artifact.id} artifact={artifact} onClick={handleArtifactClick} />
            ))}
          </TabsContent>

          <TabsContent value='pages' className='flex-1 overflow-y-auto [scrollbar-width:thin]'>
            {filteredPages.map((artifact) => (
              <ArtifactItem key={artifact.id} artifact={artifact} onClick={handleArtifactClick} />
            ))}
          </TabsContent>

          <TabsContent value='datasets' className='flex-1 overflow-y-auto [scrollbar-width:thin]'>
            {filteredDatasets.map((artifact) => (
              <ArtifactItem key={artifact.id} artifact={artifact} onClick={handleArtifactClick} />
            ))}
          </TabsContent>
        </Tabs>
      </CommonWrapper>
    </div>
  );
};

export default ArtifactsPage;
