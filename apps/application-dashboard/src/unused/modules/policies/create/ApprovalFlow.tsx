import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { DEFAULT_APPROVAL_STEP } from '@/unused/modules/policies/constants';
import ApprovalStep from '@/unused/modules/policies/create/ApprovalStep';
import { ApprovalFlowStep } from '@/unused/modules/policies/types';

type ApprovalFlowProps = {
  onChange?: (steps: ApprovalFlowStep[]) => void;
};

const ApprovalFlow: FC<ApprovalFlowProps> = ({ onChange }) => {
  const { setValue, watch } = useFormContext();
  const formApprovalSteps = watch('approvalSteps') || [DEFAULT_APPROVAL_STEP];

  const handleAddApprovalStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const newSteps = [...formApprovalSteps, DEFAULT_APPROVAL_STEP];

    setValue('approvalSteps', newSteps);
    onChange?.(newSteps);
  };

  const handleApprovalStepChange = (stepNumber: number, step: ApprovalFlowStep) => {
    const newSteps = formApprovalSteps.map((s: ApprovalFlowStep, index: number) =>
      index === stepNumber - 1 ? step : s,
    );

    setValue('approvalSteps', newSteps);
    onChange?.(newSteps);
  };

  const handleRemoveApprovalStep = (index: number) => {
    const newSteps = formApprovalSteps.filter((_: ApprovalFlowStep, i: number) => i !== index);

    setValue('approvalSteps', newSteps);
    onChange?.(newSteps);
  };

  return (
    <div className='bg-BG_GRAY_2 border-t border-gray-200 p-4'>
      <div className='f-11-400 text-GRAY_700 flex items-center gap-1 px-1 pb-2.5'>
        <SvgSpriteLoader id='arrow-down' size={12} />
        Approval steps
      </div>
      <div className='space-y-3'>
        {formApprovalSteps.map((step: ApprovalFlowStep, index: number) => (
          <ApprovalStep
            key={index}
            stepNumber={index + 1}
            step={step}
            onChange={handleApprovalStepChange}
            onRemove={formApprovalSteps.length > 1 ? () => handleRemoveApprovalStep(index) : undefined}
          />
        ))}
        <Button variant='outline' onClick={handleAddApprovalStep} size='xsmall' className='flex items-center gap-1.5'>
          <SvgSpriteLoader id='layers-two-02' size={14} />
          Add step
        </Button>
      </div>
    </div>
  );
};

export default ApprovalFlow;
