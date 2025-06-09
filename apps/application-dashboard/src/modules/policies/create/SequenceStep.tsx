import { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import ApproverList from 'modules/policies/create/ApproverList';
import PolicyQuorumDropdown from 'modules/policies/create/PolicyQuorumDropdown';
import { ApprovalFlowCondition, ApproverDetail, PolicyQuorum } from 'modules/policies/types';

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
          <div className='border-GRAY_400 h-0 w-full border-t border-dashed' />
        </div>
      )}
      <div className='flex items-center gap-2.5'>
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
