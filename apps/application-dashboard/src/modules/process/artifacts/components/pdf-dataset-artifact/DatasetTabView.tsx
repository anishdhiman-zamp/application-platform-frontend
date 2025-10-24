import { FC, memo, useEffect, useMemo, useState } from 'react';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import DatasetArtifact from 'modules/process/artifacts/components/pdf-dataset-artifact/DatasetArtifact';
import { CTA_COMPONENT_TYPE, EmitHITLActionPayload, MissingFieldsConfigType } from 'modules/process/process.types';
import { useEmitHITLActionMutation } from '@/apis/processes';
import ProgressBar from '@/components/common/RingProgress';
import TooltipV2 from '@/components/common/TooltipV2';
import { COLORS } from '@/constants/colors';
import { useAppSelector } from '@/hooks/toolkit';
import {
  CompletedFieldsActions,
  useCompletedFields,
} from '@/modules/process/artifacts/context/completedFields.context';
import { useFieldCounts } from '@/modules/process/hooks/useFieldsCounts';
import type { DatasetArtifactsResponseType, PdfDatasetArtifactsResponseType } from '@/types/api/processApi.types';
import { defaultFnType, type MapAny, SIDE_OPTIONS } from '@/types/commonTypes';

interface DatasetArtifactProps {
  datasetArtifact: DatasetArtifactsResponseType | PdfDatasetArtifactsResponseType;
  filters: MapAny;
  missingFields: MissingFieldsConfigType;
  emitHITLActionPayload: EmitHITLActionPayload;
  processId: string;
  activityId: string;
  onCloseArtifacts: defaultFnType;
  className?: string;
  showPdfSearch?: boolean;
}

const DatasetTabView: FC<DatasetArtifactProps> = ({
  datasetArtifact,
  filters,
  missingFields,
  emitHITLActionPayload,
  processId,
  activityId,
  onCloseArtifacts,
  className,
  showPdfSearch = false,
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
  } = useFieldCounts(completedFields, missingFields, activityId);

  const [activeTab, setActiveTab] = useState<string>('');
  const [emitHITLAction, { isLoading }] = useEmitHITLActionMutation();

  const filterKeys = useMemo(
    () => Object.keys(filters?.dataset_to_filter_map ?? missingFields ?? {}),
    [filters, missingFields],
  );

  const datasets = useMemo(() => {
    return (datasetArtifact?.datasets ?? []).filter(
      (ds) => filterKeys.length === 0 || filterKeys.includes(ds.dataset_id),
    );
  }, [datasetArtifact?.datasets, filterKeys]);

  const progress = useMemo(() => {
    return (completedRequiredFieldsCount / missingRequiredFieldsCount) * 100;
  }, [completedRequiredFieldsCount, missingRequiredFieldsCount]);

  const isContinueButtonDisabled = useMemo(
    () =>
      (missingRequiredFieldsCount > 0 && missingRequiredFieldsCount !== completedRequiredFieldsCount) ||
      (missingOptionalFieldsCount > 0 && completedOptionalFieldsCount === 0),
    [
      missingRequiredFieldsCount,
      completedRequiredFieldsCount,
      completedOptionalFieldsCount,
      missingOptionalFieldsCount,
    ],
  );

  const showMissingFieldsBar = useMemo(
    () => missingRequiredFieldsCount > 0 || missingOptionalFieldsCount > 0,
    [missingRequiredFieldsCount, missingOptionalFieldsCount],
  );

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
      onCloseArtifacts();
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
        {showMissingFieldsBar && (
          <div className='bg-GRAY_100 flex items-center justify-between px-4 py-1.5'>
            <div className='flex items-center gap-x-1.5'>
              <SvgSpriteLoader id='alert-triangle' size={14} />
              <span className='f-11-500 text-GRAY_1000'>Please add all required fields to continue</span>
            </div>
            <div className='flex items-center gap-x-4'>
              {missingOptionalFieldsCount > 0 && (
                <span className='f-11-500 text-GRAY_700'>
                  {completedOptionalFieldsCount}/{missingOptionalFieldsCount} Optional
                </span>
              )}
              {missingRequiredFieldsCount > 0 && (
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
              )}

              <Button
                size='xsmall'
                isLoading={isLoading}
                disabled={isContinueButtonDisabled}
                onClick={handleSubmitAndContinue}
                className={cn('f-11-500', {
                  'bg-GRAY_300 text-GRAY_700': isContinueButtonDisabled,
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

            return (
              <TabsTrigger
                value={tab.dataset_id}
                key={tab.dataset_id}
                className='hover:bg-GRAY_50 data-[state=active]:bg-GRAY_100 max-w-[120px] items-center rounded! border-none px-2! py-1!'
              >
                <SvgSpriteLoader id='coins-stacked-04' color={COLORS.GRAY_900} size={12} />
                <TooltipV2 tooltipBody={tab.dataset_name} side={SIDE_OPTIONS.TOP} showOnlyWhenTruncated asChildTrigger>
                  <p
                    className={cn('f-12-500 ml-1.5 truncate', {
                      'text-GRAY_1000': activeTab === tab.dataset_id,
                    })}
                  >
                    {tab.dataset_name}
                  </p>
                </TooltipV2>
                {requiredCount > 0 && (
                  <span className={cn('f-11-500 text-GRAY_700 ml-1', 'text-RED_800')}>{requiredCount}</span>
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
          showPdfSearch={showPdfSearch}
          isMissingFieldsBarVisible={showMissingFieldsBar}
        />
      </TabsContent>
    </Tabs>
  );
};

export default memo(DatasetTabView);
