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
import { cn } from '@zamp-platform/ui/lib/utils';
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

  const [visibleTabs, setVisibleTabs] = useState(datasets.slice(0, MAX_VISIBLE_TABS));

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
    <Tabs onValueChange={(value) => setActiveTab(value)} value={activeTab} className='w-full h-full'>
      <div className='w-full overflow-x-auto [scrollbar-width:none]'>
        <TabsList className='mx-4 my-3 gap-2.5 h-full bg-white overflow-x-auto flex-nowrap w-full flex items-center justify-start whitespace-nowrap [scrollbar-width:none]'>
          {visibleTabs?.map((tab) => (
            <TabsTrigger
              key={tab?.dataset_id}
              value={tab?.dataset_id}
              className={cn(
                '!rounded-[4px] !px-2 !py-1 border-none gap-1.5 hover:bg-GRAY_50 data-[state=active]:bg-GRAY_100',
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
                <div className='rounded-[4px] flex items-center justify-center px-1.5 py-1 border-none cursor-pointer hover:bg-GRAY_50 data-[state=open]:bg-GRAY_200 overflow-hidden'>
                  <span className='f-12-500 text-GRAY_900'>+{hiddenTabs?.length} more</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={4} className='p-1 gap-y-[3px]'>
                {hiddenTabs?.map((tab) => (
                  <DropdownMenuItem
                    key={tab?.dataset_id}
                    className='flex justify-start items-center px-2.5 py-1.5 gap-x-1.5 cursor-pointer hover:bg-GRAY_100'
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

      <TabsContent key={activeTab} value={activeTab}>
        <Dataset id={activeTab} isReadOnly />
      </TabsContent>
    </Tabs>
  );
};

export default DatasetArtifact;
