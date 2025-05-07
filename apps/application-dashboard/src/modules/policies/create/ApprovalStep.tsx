import { FC } from 'react';
import { StepCard } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import SequenceStep from 'modules/policies/create/SequenceStep';
import { ApprovalFlowCondition, ApprovalFlowStep, PolicyQuorum } from 'modules/policies/types';
import { defaultFnType } from '@/types/commonTypes';

type ApprovalStepProps = {
  stepNumber: number;
  step: ApprovalFlowStep;
  onChange: (stepNumber: number, step: ApprovalFlowStep) => void;
  onRemove?: defaultFnType;
};

const ApprovalStep: FC<ApprovalStepProps> = ({ stepNumber, step, onChange, onRemove }) => {
  const handleAddApproverSequence = () => {
    onChange(stepNumber, {
      ...step,
      conditions: [...step.conditions, { mode: PolicyQuorum.ONE, approver_details: [] }],
    });
  };

  const handleRemoveApproverSequence = (index: number) => {
    onChange(stepNumber, {
      ...step,
      conditions: step.conditions.filter((_, i) => i !== index),
    });
  };

  const handleUpdateApproverSequence = (index: number, sequence: ApprovalFlowCondition) => {
    onChange(stepNumber, {
      ...step,
      conditions: step.conditions.map((s, i) => (i === index ? sequence : s)),
    });
  };

  return (
    <StepCard stepNumber={stepNumber} onRemove={onRemove}>
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
