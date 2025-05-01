import { FC } from 'react';
import ApproverList from 'modules/policies/create/ApproverList';
import PolicyQuorumDropdown from 'modules/policies/create/PolicyQuorumDropdown';
import { ApprovalFlowCondition, ApproverDetail, PolicyQuorum } from 'modules/policies/types';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';

type SequenceStepProps = {
  sequence: ApprovalFlowCondition;
  onRemove: (index: number) => void;
  index: number;
  onUpdateApproverSequence: (index: number, sequence: ApprovalFlowCondition) => void;
};

const SequenceStep: FC<SequenceStepProps> = ({ sequence, onRemove, index, onUpdateApproverSequence }) => {
  const handleApprovalStepModifierChange = (mode: PolicyQuorum) => {
    onUpdateApproverSequence(index, {
      ...sequence,
      mode,
    });
  };

  const handleRemoveSequence = () => {
    onRemove(index);
  };

  const handleApproverChange = (approvers: ApproverDetail[]) => {
    onUpdateApproverSequence(index, {
      ...sequence,
      approver_details: approvers,
    });
  };

  return (
    <>
      {index > 0 && (
        <div className='my-4 flex items-center gap-1.5'>
          <span className='f-11-600'>OR</span>
          <div className='h-0 border-t border-GRAY_400 w-full border-dashed' />
        </div>
      )}
      <div className='flex gap-2.5 items-center'>
        <PolicyQuorumDropdown value={sequence.mode} onChange={handleApprovalStepModifierChange} />
        <ApproverList selectedApprovers={sequence.approver_details} onChange={handleApproverChange} />
        {index > 0 && (
          <SvgSpriteLoader id='x-close' size={14} onClick={handleRemoveSequence} className='cursor-pointer' />
        )}
      </div>
    </>
  );
};

export default SequenceStep;
