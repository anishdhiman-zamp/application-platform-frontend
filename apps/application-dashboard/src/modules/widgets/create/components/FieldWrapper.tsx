import { useMemo } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { useWidgetCreationContext } from 'modules/widgets/create/context/WidgetCreationContext';
import TooltipV2 from '@/components/common/TooltipV2';

const FieldWrapper = ({ children }: { children: React.ReactNode }) => {
  const { formData } = useWidgetCreationContext();
  const isDatasetSelected = useMemo(() => !!formData.datasetId, [formData.datasetId]);

  return (
    <TooltipV2 tooltipBody='Please select a dataset first' disabled={isDatasetSelected} className='w-full text-left'>
      <div className={cn({ 'pointer-events-none': !isDatasetSelected })}>{children}</div>
    </TooltipV2>
  );
};

export default FieldWrapper;
