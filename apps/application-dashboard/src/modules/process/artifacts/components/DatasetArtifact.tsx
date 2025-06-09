import { type FC, useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import { COLORS } from '@/constants/colors';
import Dataset from '@/modules/data/Dataset';
import type { PdfArtifactsResponseType } from '@/types/api/processApi.types';

interface DatasetArtifactProps {
  datasetArtifact: PdfArtifactsResponseType;
}

const MAX_VISIBLE_TABS = 3;

const DatasetArtifact: FC<DatasetArtifactProps> = ({ datasetArtifact }) => {
  const datasets = datasetArtifact?.datasets ?? [];
  const [activeTab, setActiveTab] = useState<string>('');

  const [visibleTabs, setVisibleTabs] = useState(datasets?.slice(0, MAX_VISIBLE_TABS));

  useEffect(() => {
    if (datasets.length > 0) {
      setActiveTab(datasets[0].dataset_id);
    }
  }, [datasets]);

  const hiddenTabs = datasets.filter((tab) => !visibleTabs.some((visible) => visible?.dataset_id === tab?.dataset_id));

  const handleTabSelect = (dataset_id: string) => {
    const selectedTab = datasets.find((tab) => tab?.dataset_id === dataset_id);

    if (!selectedTab) return;

    const alreadyVisible = visibleTabs.some((tab) => tab?.dataset_id === dataset_id);

    if (!alreadyVisible) {
      const newVisibleTabs = [...visibleTabs.slice(0, MAX_VISIBLE_TABS - 1), selectedTab];

      setVisibleTabs(newVisibleTabs);
    }

    setActiveTab(dataset_id);
  };

  return (
    <Tabs onValueChange={(value) => setActiveTab(value)} value={activeTab} className='h-full w-full'>
      <div className='w-full overflow-x-auto [scrollbar-width:none]'>
        <TabsList className='mx-4 my-3 flex h-full w-full flex-nowrap items-center justify-start gap-2.5 overflow-x-auto bg-white whitespace-nowrap [scrollbar-width:none]'>
          {visibleTabs?.map((tab) => (
            <TabsTrigger
              key={tab?.dataset_id}
              value={tab?.dataset_id}
              className={cn(
                'hover:bg-GRAY_50 data-[state=active]:bg-GRAY_100 gap-1.5 rounded! border-none px-2! py-1!',
              )}
            >
              <SvgSpriteLoader id='coins-stacked-04' color={COLORS.GRAY_900} size={12} />
              <span className={cn('f-12-500 text-GRAY_900', { 'text-GRAY_1000': activeTab === tab?.dataset_id })}>
                {tab?.dataset_name}
              </span>
            </TabsTrigger>
          ))}
          {hiddenTabs?.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className='hover:bg-GRAY_50 data-[state=open]:bg-GRAY_200 flex cursor-pointer items-center justify-center overflow-hidden rounded border-none px-1.5 py-1'>
                  <span className='f-12-500 text-GRAY_900'>+{hiddenTabs?.length} more</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={4} className='gap-y-[3px] p-1'>
                {hiddenTabs?.map((tab) => (
                  <DropdownMenuItem
                    key={tab?.dataset_id}
                    className='hover:bg-GRAY_100 flex cursor-pointer items-center justify-start gap-x-1.5 px-2.5 py-1.5'
                    onClick={() => handleTabSelect(tab?.dataset_id)}
                  >
                    <SvgSpriteLoader id='coins-stacked-04' color={COLORS.GRAY_900} size={14} />
                    <span className='f-13-450 text-GRAY_950'>{tab?.dataset_name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TabsList>
      </div>

      <TabsContent key={activeTab} value={activeTab} className='mt-0 h-full w-full'>
        <Dataset
          id={activeTab}
          updateBreadcrumb={false}
          headerClassName='px-4 py-3 flex-wrap'
          filterWrapperClassName='pl-0'
          showCurrencyFilter={false}
          showDatasetHistory={false}
          isDatasetArtifact
        />
      </TabsContent>
    </Tabs>
  );
};

export default DatasetArtifact;
