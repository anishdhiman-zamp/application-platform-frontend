import { FC, useState } from 'react';
import { POLICY_APPROVAL_STEP_MODIFIERS } from 'modules/policies/constants';
import ApproverList from 'modules/policies/create/ApproverList';
import PolicyQuorumDropdown from 'modules/policies/create/PolicyQuorumDropdown';
import { PolicyQuorumOption } from 'modules/policies/types';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';

type SequenceStepProps = {
  sequence: number;
  onRemove: (sequence: number) => void;
};
const SequenceStep: FC<SequenceStepProps> = ({ sequence, onRemove }) => {
  const [approvalStepModifier, setApprovalStepModifier] = useState<PolicyQuorumOption>(
    POLICY_APPROVAL_STEP_MODIFIERS[0],
  );
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);

  const handleApprovalStepModifierChange = (modifier: PolicyQuorumOption) => {
    setApprovalStepModifier(modifier);
  };

  const handleRemoveSequence = () => {
    onRemove(sequence);
  };

  return (
    <>
      {sequence > 1 && (
        <div className='my-4 flex items-center gap-1.5'>
          <span className='f-11-600'>OR</span>
          <div className='h-0 border-t border-GRAY_400 w-full border-dashed' />
        </div>
      )}
      <div className='flex gap-2.5 items-center'>
        <PolicyQuorumDropdown modifier={approvalStepModifier} onChange={handleApprovalStepModifierChange} />
        <ApproverList selectedApprovers={selectedApprovers} setSelectedApprovers={setSelectedApprovers} />
        {sequence > 1 && (
          <SvgSpriteLoader id='x-close' size={14} onClick={handleRemoveSequence} className='cursor-pointer' />
        )}
      </div>
    </>
  );
};

export default SequenceStep;
