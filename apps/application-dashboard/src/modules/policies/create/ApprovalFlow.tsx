import { useState } from 'react';
import { Button } from '@zamp-platform/ui';
import ApprovalStep from 'modules/policies/create/ApprovalStep';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';

const ApprovalFlow = () => {
  const [approvalSteps, setApprovalSteps] = useState<number[]>([1]);

  const handleAddApprovalStep = () => {
    setApprovalSteps((prev) => [...prev, prev.length + 1]);
  };

  return (
    <div className='bg-BG_GRAY_2 p-4 border-t border-gray-200'>
      <div className='f-11-400 text-GRAY_700 flex items-center gap-1 px-1 pb-2.5'>
        <SvgSpriteLoader id='arrow-down' size={12} />
        Approval steps
      </div>
      <div className='space-y-3'>
        {approvalSteps.map((step) => (
          <ApprovalStep key={step} stepNumber={step} />
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
