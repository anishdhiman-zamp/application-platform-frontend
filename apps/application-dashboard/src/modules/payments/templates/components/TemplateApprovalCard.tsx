import { type FC, useRef, useState } from 'react';
import DropdownToggle from 'modules/payments/move-money/components/DropdownToggle';
import { TEMPLATE_APPROVAL_ACTION_ITEMS } from 'modules/payments/payments.constant';
import { TEMPLATE_APPROVAL_ACTION_TYPES } from 'modules/payments/payments.types';
import { useApprovePolicyMutation, useRejectPolicyMutation } from '@/apis/people';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { COLORS } from '@/constants/colors';
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
        className='f-11-450 text-ORANGE_800 flex items-center gap-1 select-none z-10 hover:bg-GRAY_100 p-1 rounded-md'
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
            indicatorColor={COLORS.ORANGE_SECONDARY}
          />
        </div>
      </div>
      {isMoveMoneyActionMenuOpen && (
        <div className='z-50 absolute top-full right-0 p-1 rounded-md border border-GRAY_500 bg-white mt-1 animate-opacity select-none min-w-[165px]'>
          {TEMPLATE_APPROVAL_ACTION_ITEMS.map((item) => (
            <div
              key={item.value}
              className='flex items-center gap-1.5 p-2.5 hover:bg-GRAY_100 rounded-md cursor-pointer text-GRAY_900 hover:text-GRAY_1000 transition-all duration-200 f-12-500'
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
