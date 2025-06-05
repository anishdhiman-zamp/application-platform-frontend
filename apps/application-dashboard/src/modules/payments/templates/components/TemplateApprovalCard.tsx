import { type FC, useRef, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import DropdownToggle from 'modules/payments/move-money/components/DropdownToggle';
import { TEMPLATE_APPROVAL_ACTION_ITEMS } from 'modules/payments/payments.constant';
import { TEMPLATE_APPROVAL_ACTION_TYPES } from 'modules/payments/payments.types';
import { useApprovePolicyMutation, useRejectPolicyMutation } from '@/apis/people';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { useOnClickOutside } from '@/hooks';
import type { defaultFnType } from '@/types/commonTypes';
import { toast } from 'components/common/toast/Toast';

type TemplateApprovalCardProps = {
  canApprove: boolean;
  approvalId: string;
  onViewAllApprovals?: defaultFnType;
};

const TemplateApprovalCard: FC<TemplateApprovalCardProps> = ({ canApprove, approvalId, onViewAllApprovals }) => {
  const moveMoneyActionMenuRef = useRef<HTMLDivElement>(null);
  const [isMoveMoneyActionMenuOpen, setIsMoveMoneyActionMenuOpen] = useState(false);

  const [approvePolicy, { isLoading: isApprovePolicyLoading }] = useApprovePolicyMutation();
  const [rejectPolicy, { isLoading: isRejectPolicyLoading }] = useRejectPolicyMutation();

  const handleApprove = () => {
    approvePolicy({ ids: [approvalId] })
      .unwrap()
      .then(() => {
        toast.success(TOAST_MESSAGES.SUCCESS_APPROVED);
      })
      .catch((error: any) => {
        toast.error(`${TOAST_MESSAGES.ERROR_APPROVED}: ${error?.data?.error}`);
      });
  };

  const handleReject = () => {
    rejectPolicy({ ids: [approvalId] })
      .unwrap()
      .then(() => {
        toast.success(TOAST_MESSAGES.SUCCESS_REJECTED);
      })
      .catch((error: any) => {
        toast.error(`${TOAST_MESSAGES.ERROR_REJECTED}: ${error?.data?.error}`);
      });
  };

  useOnClickOutside(moveMoneyActionMenuRef, () => setIsMoveMoneyActionMenuOpen(false));

  const handleActionClick = (e: React.MouseEvent<HTMLDivElement>, action: string) => {
    e.stopPropagation();
    switch (action) {
      case TEMPLATE_APPROVAL_ACTION_TYPES.APPROVE:
        handleApprove();
        break;
      case TEMPLATE_APPROVAL_ACTION_TYPES.REJECT:
        handleReject();
        break;
      case TEMPLATE_APPROVAL_ACTION_TYPES.VIEW_ALL_APPROVALS:
        onViewAllApprovals?.();
        break;
    }
  };

  if (!canApprove)
    return (
      <div className='f-11-450 text-ORANGE_800 flex items-center gap-1'>
        Approval pending
        <SvgSpriteLoader id='info-circle' size={12} />
      </div>
    );

  return (
    <div ref={moveMoneyActionMenuRef} className='relative'>
      <div
        className='f-11-450 text-ORANGE_800 hover:bg-GRAY_100 z-10 flex items-center gap-1 rounded-md p-1 select-none'
        onClick={(e) => {
          e.stopPropagation();
          setIsMoveMoneyActionMenuOpen(!isMoveMoneyActionMenuOpen);
        }}
      >
        Awaiting your approval{' '}
        <div>
          <DropdownToggle
            isLoading={isApprovePolicyLoading || isRejectPolicyLoading}
            isShowMenu={isMoveMoneyActionMenuOpen}
            setIsShowMenu={setIsMoveMoneyActionMenuOpen}
          />
        </div>
      </div>
      {isMoveMoneyActionMenuOpen && (
        <div className='border-GRAY_500 animate-opacity absolute top-full right-0 z-50 mt-1 min-w-[165px] rounded-md border bg-white p-1 select-none'>
          {TEMPLATE_APPROVAL_ACTION_ITEMS.map((item) => (
            <div
              key={item.value}
              className='hover:bg-GRAY_100 text-GRAY_900 hover:text-GRAY_1000 f-12-500 flex cursor-pointer items-center gap-1.5 rounded-md p-2.5 transition-all duration-200'
              onClick={(e) => {
                handleActionClick(e, item.value);
              }}
            >
              <SvgSpriteLoader size={12} id={item?.icon?.id} />
              <div className='text-sm whitespace-nowrap'>{item?.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateApprovalCard;
