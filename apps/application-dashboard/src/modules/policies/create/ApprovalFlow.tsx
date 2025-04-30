import { useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { DEFAULT_APPROVAL_STEP } from 'modules/policies/constants';
import ApprovalStep from 'modules/policies/create/ApprovalStep';
import { ApprovalFlowStep } from 'modules/policies/types';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';

const ApprovalFlow = () => {
  const [approvalSteps, setApprovalSteps] = useState<ApprovalFlowStep[]>([DEFAULT_APPROVAL_STEP]);

  const handleAddApprovalStep = () => {
    setApprovalSteps((prev) => [...prev, DEFAULT_APPROVAL_STEP]);
  };

  const handleUpdateApprovalStep = (stepNumber: number, step: ApprovalFlowStep) => {
    setApprovalSteps((prev) => prev.map((s, index) => (index === stepNumber - 1 ? step : s)));
  };

  return (
    <div className='bg-BG_GRAY_2 p-4 border-t border-gray-200'>
      <div className='f-11-400 text-GRAY_700 flex items-center gap-1 px-1 pb-2.5'>
        <SvgSpriteLoader id='arrow-down' size={12} />
        Approval steps
      </div>
      <div className='space-y-3'>
        {approvalSteps.map((step, index) => (
          <ApprovalStep
            key={index}
            stepNumber={index + 1}
            step={step}
            onUpdateApprovalStep={handleUpdateApprovalStep}
          />
        ))}
        <Button variant='outline' onClick={handleAddApprovalStep} size='xs' className='flex items-center gap-1.5'>
          <SvgSpriteLoader id='layers-two-02' size={14} />
          Add step
        </Button>
      </div>
    </div>
  );
};

export default ApprovalFlow;
