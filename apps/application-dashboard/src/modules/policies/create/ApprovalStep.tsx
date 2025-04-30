import { FC } from 'react';
import { StepCard } from '@zamp-platform/ui';
import SequenceStep from 'modules/policies/create/SequenceStep';
import { ApprovalFlowCondition, ApprovalFlowStep, PolicyQuorum } from 'modules/policies/types';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';

type ApprovalStepProps = {
  stepNumber: number;
  step: ApprovalFlowStep;
  onUpdateApprovalStep: (stepNumber: number, step: ApprovalFlowStep) => void;
};

const ApprovalStep: FC<ApprovalStepProps> = ({ stepNumber, step, onUpdateApprovalStep }) => {
  const handleAddApproverSequence = () => {
    onUpdateApprovalStep(stepNumber, {
      ...step,
      conditions: [...step.conditions, { mode: PolicyQuorum.ONE, approver_details: [] }],
    });
  };

  const handleRemoveApproverSequence = (index: number) => {
    onUpdateApprovalStep(stepNumber, {
      ...step,
      conditions: step.conditions.filter((_, i) => i !== index),
    });
  };

  const handleUpdateApproverSequence = (index: number, sequence: ApprovalFlowCondition) => {
    onUpdateApprovalStep(stepNumber, {
      ...step,
      conditions: step.conditions.map((s, i) => (i === index ? sequence : s)),
    });
  };

  return (
    <StepCard stepNumber={stepNumber}>
      {step?.conditions.map((sequence, index) => (
        <SequenceStep
          key={index}
          sequence={sequence}
          onRemove={handleRemoveApproverSequence}
          index={index}
          onUpdateApproverSequence={handleUpdateApproverSequence}
        />
      ))}
      <div className='f-11-500 flex items-center gap-1.5 cursor-pointer mt-4 w-fit' onClick={handleAddApproverSequence}>
        <SvgSpriteLoader id='plus' size={14} />
        Approver sequence
      </div>
    </StepCard>
  );
};

export default ApprovalStep;
