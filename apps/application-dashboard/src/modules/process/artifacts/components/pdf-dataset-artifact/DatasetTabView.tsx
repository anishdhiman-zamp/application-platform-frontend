import { FC, memo, useEffect, useMemo, useState } from 'react';
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
import { CTA_COMPONENT_TYPE, EmitHITLActionPayload, MissingFieldsConfigType } from 'modules/process/process.types';
import { useParams } from 'next/navigation';
import { useEmitHITLActionMutation } from '@/apis/processes';
import ProgressBar from '@/components/common/RingProgress';
import { COLORS } from '@/constants/colors';
import { useAppSelector } from '@/hooks/toolkit';
import {
  CompletedFieldsActions,
  useCompletedFields,
} from '@/modules/process/artifacts/context/completedFields.context';
import { useFieldCounts } from '@/modules/process/hooks/useFieldsCounts';
import type { DatasetArtifactsResponseType, PdfDatasetArtifactsResponseType } from '@/types/api/processApi.types';
import type { MapAny } from '@/types/commonTypes';

interface DatasetArtifactProps {
  datasetArtifact: DatasetArtifactsResponseType | PdfDatasetArtifactsResponseType;
  filters: MapAny;
  missingFields: MissingFieldsConfigType;
  emitHITLActionPayload: EmitHITLActionPayload;
}

const DatasetTabView: FC<DatasetArtifactProps> = ({
  datasetArtifact,
  filters,
  missingFields,
  emitHITLActionPayload,
}) => {
  const { processId, activityId } = useParams() as { processId: string; activityId: string };
  const userId = useAppSelector((state) => state.user?.user?.user_id);

  const {
    state: { completedFields },
    dispatch: completedFieldsDispatch,
  } = useCompletedFields();

  const {
    completedRequiredFieldsCount,
    completedOptionalFieldsCount,
    missingRequiredFieldsCount,
    missingOptionalFieldsCount,
  } = useFieldCounts(completedFields, missingFields);

  const filterKeys = useMemo(
    () => Object.keys(filters?.dataset_to_filter_map ?? missingFields ?? {}),
    [filters, missingFields],
  );

  const datasets = useMemo(() => {
    return (datasetArtifact?.datasets ?? []).filter(
      (ds) => filterKeys.length === 0 || filterKeys.includes(ds.dataset_id),
    );
  }, [datasetArtifact?.datasets, filterKeys]);

  const [visibleTabs, setVisibleTabs] = useState(() => datasets.slice(0, 3));
  const [activeTab, setActiveTab] = useState<string>('');
  const [emitHITLAction, { isLoading }] = useEmitHITLActionMutation();

  const hiddenTabs = useMemo(
    () => datasets.filter((tab) => !visibleTabs.some((v) => v.dataset_id === tab.dataset_id)),
    [datasets, visibleTabs],
  );

  const currentDatasetHasMissingFields = useMemo(
    () => (missingFields?.[activeTab]?.cells?.filter((cell) => cell.is_required) ?? []).length > 0,
    [missingFields, activeTab],
  );

  const progress = useMemo(() => {
    return (completedRequiredFieldsCount / missingRequiredFieldsCount) * 100;
  }, [completedRequiredFieldsCount, missingRequiredFieldsCount]);

  const handleTabSelect = (datasetId: string) => {
    const selectedTab = datasets.find((tab) => tab.dataset_id === datasetId);

    if (!selectedTab) return;

    const isVisible = visibleTabs.some((tab) => tab.dataset_id === datasetId);

    if (!isVisible) {
      setVisibleTabs([...visibleTabs.slice(0, 2), selectedTab]);
    }

    setActiveTab(datasetId);
  };

  const handleSubmitAndContinue = async () => {
    const { logGroupId, hitlRequestId, ctaActionId, ctaValue } = emitHITLActionPayload;

    if (!logGroupId || !hitlRequestId) return;

    const payload = {
      log_group_id: logGroupId,
      hitl_request_id: hitlRequestId,
      submitted_by: userId ?? '',
      responses: [
        {
          action_id: ctaActionId ?? '',
          values: [ctaValue ?? ''],
          cta_component_type: CTA_COMPONENT_TYPE.REQUIRED_MISSING_FIELDS_BUTTON,
        },
      ],
    };

    try {
      await emitHITLAction({ processId, activityRunId: activityId, payload }).unwrap();
      completedFieldsDispatch({ type: CompletedFieldsActions.RESET_COMPLETED_FIELDS });
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Something went wrong');
    }
  };

  useEffect(() => {
    if (datasets?.length > 0) setActiveTab(datasets[0]?.dataset_id);
  }, [datasets]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className='h-full w-full'>
      <div className='w-full overflow-x-auto [scrollbar-width:none]'>
        {missingRequiredFieldsCount > 0 && (
          <div className='bg-GRAY_100 flex items-center justify-between px-4 py-1.5'>
            <div className='flex items-center gap-x-1.5'>
              <SvgSpriteLoader id='alert-triangle' size={14} />
              <span className='f-11-500 text-GRAY_1000'>Please add all required fields to continue</span>
            </div>
            <div className='flex items-center gap-x-4'>
              <span className='f-11-500 text-GRAY_700'>
                {completedOptionalFieldsCount}/{missingOptionalFieldsCount} Optional
              </span>
              <div className='flex items-center gap-x-1.5'>
                <ProgressBar
                  trackColor={COLORS.GRAY_500}
                  indicatorColor={COLORS.GREEN_300}
                  indicatorWidth={2}
                  trackWidth={2}
                  size={16}
                  progress={progress}
                />
                <span className='f-11-500 text-GRAY_1000'>
                  {completedRequiredFieldsCount}/{missingRequiredFieldsCount} Required
                </span>
              </div>
              <Button
                size='xsmall'
                isLoading={isLoading}
                disabled={missingRequiredFieldsCount !== completedRequiredFieldsCount}
                onClick={handleSubmitAndContinue}
                className={cn('f-11-500', {
                  'bg-GRAY_300 text-GRAY_700': missingRequiredFieldsCount !== completedRequiredFieldsCount,
                })}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        <TabsList className='mx-4 my-3 flex h-full w-full flex-nowrap items-center justify-start gap-2.5 overflow-x-auto bg-white whitespace-nowrap [scrollbar-width:none]'>
          {visibleTabs.map((tab) => {
            const requiredCount = missingFields?.[tab.dataset_id]?.cells?.filter((c) => c.is_required)?.length ?? 0;

            return (
              <TabsTrigger
                key={tab.dataset_id}
                value={tab.dataset_id}
                className='hover:bg-GRAY_50 data-[state=active]:bg-GRAY_100 rounded! border-none px-2! py-1!'
              >
                <SvgSpriteLoader id='coins-stacked-04' color={COLORS.GRAY_900} size={12} />
                <span className={cn('f-12-500 ml-1.5', { 'text-GRAY_1000': activeTab === tab.dataset_id })}>
                  {tab.dataset_name}
                </span>
                {requiredCount > 0 && <span className='f-11-500 text-RED_800 ml-1'>{requiredCount}</span>}
              </TabsTrigger>
            );
          })}

          {hiddenTabs.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className='hover:bg-GRAY_50 data-[state=open]:bg-GRAY_200 flex cursor-pointer items-center justify-center rounded border-none px-1.5 py-1'>
                  <span className='f-12-500 text-GRAY_900'>+{hiddenTabs.length} more</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={4} className='gap-y-[3px] p-1'>
                {hiddenTabs.map((tab) => (
                  <DropdownMenuItem
                    key={tab.dataset_id}
                    onClick={() => handleTabSelect(tab.dataset_id)}
                    className='hover:bg-GRAY_100 flex items-center gap-x-1.5 px-2.5 py-1.5'
                  >
                    <SvgSpriteLoader id='coins-stacked-04' color={COLORS.GRAY_900} size={14} />
                    <span className='f-13-450 text-GRAY_950'>{tab.dataset_name}</span>
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
          requiredMissingFields={missingFields?.[activeTab]?.cells?.filter((cell) => cell.is_required) ?? []}
          missingFields={missingFields?.[activeTab]?.cells ?? []}
          hasMissingFields={currentDatasetHasMissingFields}
        />
      </TabsContent>
    </Tabs>
  );
};

export default memo(DatasetTabView);
