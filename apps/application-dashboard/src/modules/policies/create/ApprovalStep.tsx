import { FC, useState } from 'react';
import { StepCard } from '@zamp-platform/ui';
import SequenceStep from 'modules/policies/create/SequenceStep';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';

type ApprovalStepProps = {
  stepNumber: number;
};

const ApprovalStep: FC<ApprovalStepProps> = ({ stepNumber }) => {
  const [approverSequences, setApproverSequences] = useState<number[]>([1]);

  const handleAddApproverSequence = () => {
    setApproverSequences((prev) => [...prev, prev.length + 1]);
  };

  const handleRemoveApproverSequence = (sequence: number) => {
    setApproverSequences((prev) => prev.filter((s) => s !== sequence));
  };

  return (
    <StepCard stepNumber={stepNumber}>
      {approverSequences.map((sequence) => (
        <SequenceStep key={sequence} sequence={sequence} onRemove={handleRemoveApproverSequence} />
      ))}
      <div className='f-11-500 flex items-center gap-1.5 cursor-pointer mt-4 w-fit' onClick={handleAddApproverSequence}>
        <SvgSpriteLoader id='plus' size={14} />
        Approver sequence
      </div>
    </StepCard>
  );
};

export default ApprovalStep;
