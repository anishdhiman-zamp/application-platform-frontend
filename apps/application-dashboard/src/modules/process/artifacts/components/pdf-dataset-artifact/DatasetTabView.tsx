import { type FC, memo, useEffect, useMemo, useState } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import DatasetArtifact from 'modules/process/artifacts/components/pdf-dataset-artifact/DatasetArtifact';
import { CTA_COMPONENT_TYPE, EmitHITLActionPayload } from 'modules/process/process.types';
import { useParams } from 'next/navigation';
import { useEmitHITLActionMutation } from '@/apis/processes';
import { COLORS } from '@/constants/colors';
import { useAppSelector } from '@/hooks/toolkit';
import {
  CompletedFieldsActions,
  useCompletedFields,
} from '@/modules/process/artifacts/context/completedFields.context';
import type { DatasetArtifactsResponseType, PdfDatasetArtifactsResponseType } from '@/types/api/processApi.types';
import type { MapAny } from '@/types/commonTypes';

interface DatasetArtifactProps {
  datasetArtifact: DatasetArtifactsResponseType | PdfDatasetArtifactsResponseType;
  filters: MapAny;
  missingFields: MapAny;
  emitHITLActionPayload: EmitHITLActionPayload;
}

const DatasetTabView: FC<DatasetArtifactProps> = ({
  datasetArtifact,
  filters,
  missingFields,
  emitHITLActionPayload,
}) => {
  const params = useParams();
  const processId = params?.processId as string;
  const activityId = params?.activityId;

  const {
    state: { completedFields },
    dispatch: completedFieldsDispatch,
  } = useCompletedFields();
  const userId = useAppSelector((state) => state?.user?.user?.user_id);

  const MAX_VISIBLE_TABS = 3;

  const filterDatasets = useMemo(() => Object.keys(filters?.dataset_to_filter_map ?? missingFields ?? {}), [filters]);
  const datasets = useMemo(() => {
    return (datasetArtifact?.datasets ?? []).filter((dataset) => {
      if (filterDatasets?.length === 0) return true;

      return filterDatasets?.includes(dataset?.dataset_id);
    });
  }, [datasetArtifact?.datasets, filterDatasets]);

  const [visibleTabs, setVisibleTabs] = useState(datasets?.slice(0, MAX_VISIBLE_TABS));
  const [activeTab, setActiveTab] = useState<string>('');

  const [emitHITLAction, { isLoading }] = useEmitHITLActionMutation();

  const currentDatasetHasMissingFields = useMemo(() => {
    const datasetMissingFields = missingFields?.[activeTab]?.cells ?? [];

    return datasetMissingFields.length > 0;
  }, [missingFields, activeTab]);

  const completedFieldsCount = useMemo(() => {
    return Object.values(completedFields).reduce((acc, curr) => acc + curr.length, 0);
  }, [completedFields]);

  const missingFieldsCount = useMemo(() => {
    return Object.values(missingFields).reduce((acc, curr) => acc + (curr?.cells?.length ?? 0), 0);
  }, [missingFields]);

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

  const handleSubmitAndContinue = () => {
    if (!emitHITLActionPayload?.logGroupId || !emitHITLActionPayload?.hitlRequestId) {
      return;
    }

    const payload = {
      log_group_id: emitHITLActionPayload?.logGroupId,
      hitl_request_id: emitHITLActionPayload?.hitlRequestId,
      submitted_by: userId ?? '',
      responses: [
        {
          action_id: emitHITLActionPayload?.ctaActionId ?? '',
          values: [emitHITLActionPayload?.ctaValue ?? ''],
          cta_component_type: CTA_COMPONENT_TYPE.REQUIRED_MISSING_FIELDS_BUTTON,
        },
      ],
    };

    emitHITLAction({
      processId: processId,
      activityRunId: activityId as string,
      payload,
    })
      .unwrap()
      .then(() => {
        completedFieldsDispatch({
          type: CompletedFieldsActions.RESET_COMPLETED_FIELDS,
        });
      })
      .catch((error) => {
        toast.error(error.data.message ?? 'Something went wrong');
      });
  };

  useEffect(() => {
    if (datasets?.length > 0) {
      setActiveTab(datasets[0]?.dataset_id);
    }
  }, [datasets]);

  return (
    <Tabs onValueChange={(value) => setActiveTab(value)} value={activeTab} className='h-full w-full'>
      <div className='w-full overflow-x-auto [scrollbar-width:none]'>
        {missingFieldsCount > 0 && (
          <div className='bg-GRAY_100 flex items-center justify-between px-4 py-1.5'>
            <span className='f-11-500 text-RED_800'>
              {missingFieldsCount} Missing Fields in {datasets?.length} datasets
            </span>
            <div className='flex items-center gap-2.5'>
              <span className='f-11-500 text-GRAY_1000'>{completedFieldsCount} New Entries</span>
              <Button
                disabled={missingFieldsCount !== completedFieldsCount}
                size='xsmall'
                onClick={handleSubmitAndContinue}
                isLoading={isLoading}
              >
                Submit & Continue
              </Button>
            </div>
          </div>
        )}
        <TabsList className='mx-4 my-3 flex h-full w-full flex-nowrap items-center justify-start gap-2.5 overflow-x-auto bg-white whitespace-nowrap [scrollbar-width:none]'>
          {visibleTabs?.map((tab) => (
            <TabsTrigger
              key={tab?.dataset_id}
              value={tab?.dataset_id}
              className='hover:bg-GRAY_50 data-[state=active]:bg-GRAY_100 gap-1.5 rounded! border-none px-2! py-1!'
            >
              <SvgSpriteLoader id='coins-stacked-04' color={COLORS.GRAY_900} size={12} />
              <span className={cn('f-12-500 text-GRAY_900', { 'text-GRAY_1000': activeTab === tab?.dataset_id })}>
                {tab?.dataset_name}
              </span>
              {!!missingFields?.[tab?.dataset_id]?.cells?.length && (
                <span className='f-11-500 text-RED_800'>{missingFields?.[tab?.dataset_id]?.cells?.length}</span>
              )}
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
        <DatasetArtifact
          id={activeTab}
          updateBreadcrumb={false}
          drilldownFilters={
            filters?.dataset_to_filter_map?.[activeTab]?.filters ?? missingFields?.[activeTab]?.filters ?? {}
          }
          missingFields={missingFields?.[activeTab]?.cells ?? []}
          hasMissingFields={currentDatasetHasMissingFields}
        />
      </TabsContent>
    </Tabs>
  );
};

export default memo(DatasetTabView);
