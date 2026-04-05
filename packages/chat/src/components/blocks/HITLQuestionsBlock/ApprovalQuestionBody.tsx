'use client';

import { Button } from '@zamp-platform/ui';
import React from 'react';

export const enum APPROVAL_ACTION {
  APPROVE = 'approve',
  REJECT = 'reject',
}

interface ApprovalQuestionBodyProps {
  isFocused: boolean;
  focusedOptionIndex: number;
  approvalAction?: APPROVAL_ACTION | null;
  onApprove: () => void;
  onReject: () => void;
}

export const ApprovalQuestionBody = ({ isFocused, approvalAction, onApprove, onReject }: ApprovalQuestionBodyProps) => (
  <div data-hitl-focused={isFocused || undefined} className='flex w-full items-center gap-2 px-4 pb-6'>
    <Button
      type='button'
      variant='default'
      size='xsmall'
      debounceMs={0}
      isLoading={approvalAction === APPROVAL_ACTION.APPROVE}
      disabled={approvalAction === APPROVAL_ACTION.REJECT}
      onClick={onApprove}
      testId='hitl-approval-approve'
    >
      Approve
    </Button>
    <Button
      type='button'
      variant='secondary'
      size='xsmall'
      debounceMs={0}
      isLoading={approvalAction === APPROVAL_ACTION.REJECT}
      disabled={approvalAction === APPROVAL_ACTION.APPROVE}
      onClick={onReject}
      testId='hitl-approval-reject'
    >
      Reject
    </Button>
  </div>
);
