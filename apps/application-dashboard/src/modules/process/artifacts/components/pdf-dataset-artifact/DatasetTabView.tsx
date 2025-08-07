import { FC, memo, useEffect, useMemo, useState } from 'react';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import DatasetArtifact from 'modules/process/artifacts/components/pdf-dataset-artifact/DatasetArtifact';
import {
  ARTIFACT_TYPE,
  CTA_COMPONENT_TYPE,
  EmitHITLActionPayload,
  MissingFieldsConfigType,
} from 'modules/process/process.types';
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
  processId: string;
  activityId: string;
  className?: string;
  showPdfSearch?: boolean;
  artifactType?: ARTIFACT_TYPE;
}

const DatasetTabView: FC<DatasetArtifactProps> = ({
  datasetArtifact,
  filters,
  missingFields,
  emitHITLActionPayload,
  processId,
  activityId,
  className,
  showPdfSearch = false,
  artifactType = ARTIFACT_TYPE.DATASET,
}) => {
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

  const [activeTab, setActiveTab] = useState<string>('');
  const [emitHITLAction, { isLoading }] = useEmitHITLActionMutation();

  const currentDatasetHasMissingFields = useMemo(
    () => (missingFields?.[activeTab]?.cells?.filter((cell) => cell.is_required) ?? []).length > 0,
    [missingFields, activeTab],
  );

  const progress = useMemo(() => {
    return (completedRequiredFieldsCount / missingRequiredFieldsCount) * 100;
  }, [completedRequiredFieldsCount, missingRequiredFieldsCount]);

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
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className={cn('border-GRAY_400 h-full w-full border-r', className)}
    >
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
                  animate={false}
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
      </div>

      <div className='relative mx-4 my-3'>
        <TabsList className='flex h-full w-full flex-nowrap items-center justify-start gap-1 overflow-x-auto bg-white pr-8 whitespace-nowrap [scrollbar-width:none]'>
          {datasets.map((tab) => {
            const requiredCount = missingFields?.[tab.dataset_id]?.cells?.filter((c) => c.is_required)?.length ?? 0;
            const hasMissingFields = missingFields?.[tab.dataset_id]?.cells?.length > 0;

            return (
              <TabsTrigger
                key={tab.dataset_id}
                value={tab.dataset_id}
                className='hover:bg-GRAY_50 data-[state=active]:bg-GRAY_100 max-w-[120px] items-center rounded! border-none px-2! py-1!'
              >
                <SvgSpriteLoader id='coins-stacked-04' color={COLORS.GRAY_900} size={12} />
                <span
                  className={cn('f-12-500 ml-1.5 truncate', {
                    'text-GRAY_1000': activeTab === tab.dataset_id,
                  })}
                >
                  {tab.dataset_name}
                </span>
                {hasMissingFields && (
                  <span className={cn('f-11-500 text-GRAY_700 ml-1', { 'text-RED_800': requiredCount > 0 })}>
                    {requiredCount}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Gradient stays fixed to right edge */}
        <div className='bg-gradient-to-white pointer-events-none absolute top-0 right-0 h-full w-[80px]' />
      </div>

      <TabsContent key={activeTab} value={activeTab} className='mt-0 h-full w-full'>
        <DatasetArtifact
          id={activeTab}
          drilldownFilters={
            filters?.dataset_to_filter_map?.[activeTab]?.filters ?? missingFields?.[activeTab]?.filters ?? {}
          }
          missingFields={missingFields?.[activeTab]?.cells ?? []}
          hasMissingFields={currentDatasetHasMissingFields}
          showPdfSearch={showPdfSearch}
          artifactType={artifactType}
        />
      </TabsContent>
    </Tabs>
  );
};

export default memo(DatasetTabView);
