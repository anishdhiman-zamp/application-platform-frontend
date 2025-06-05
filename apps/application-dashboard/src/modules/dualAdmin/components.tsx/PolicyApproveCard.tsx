import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useApprovalActionMutation } from '@/apis/people';
import { toast } from '@/components/common/toast/Toast';
import DropdownToggle from '@/modules/payments/move-money/components/DropdownToggle';
import { TEMPLATE_APPROVAL_ACTION_TYPES } from '@/modules/payments/payments.types';
import { APPROVAL_FAILED_TOAST, APPROVAL_POLICY_TOAST } from '@/modules/policies/constants';
import { DUAL_ADMIN_APPROVAL_POLICY_OPTIONS } from '@/modules/team/people.constants';
import type { MapAny } from '@/types/commonTypes';
import { stopPropagationAction } from '@/utils/common';

type PolicyApproveCardProps = {
  canApprove: boolean;
  approvalId: string;
};

const PolicyApproveCard = ({ canApprove, approvalId }: PolicyApproveCardProps) => {
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [approvePolicy, { isLoading }] = useApprovalActionMutation();

  const handleApproveAction = (action: TEMPLATE_APPROVAL_ACTION_TYPES) => {
    if (isLoading) return;

    approvePolicy({
      action: action.toString().toUpperCase(),
      approval_ids: [approvalId],
    })
      .unwrap()
      .then((res) => {
        toast.success(res?.message || APPROVAL_POLICY_TOAST);
      })
      .catch(() => {
        toast.error(APPROVAL_FAILED_TOAST);
      });
  };

  if (!canApprove) {
    return <div className='f-11-450 text-ORANGE_800 whitespace-nowrap'>Pending approval</div>;
  }

  return (
    <div onClick={stopPropagationAction}>
      <DropdownMenu onOpenChange={setIsShowMenu}>
        <DropdownMenuTrigger asChild>
          <div className='f-11-450 text-ORANGE_800 flex cursor-pointer items-center justify-end gap-1 whitespace-nowrap select-none'>
            Awaiting your approval
            <DropdownToggle isShowMenu={isShowMenu} isLoading={isLoading} setIsShowMenu={setIsShowMenu} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='z-1001 max-h-[300px] min-w-[170px] overflow-y-auto' sideOffset={5}>
          {DUAL_ADMIN_APPROVAL_POLICY_OPTIONS.map((item: MapAny) => (
            <DropdownMenuItem
              onClick={() => handleApproveAction(item?.value)}
              key={item?.value}
              className='hover:!bg-GRAY_50 text-GRAY_1000 f-12-500 cursor-default rounded px-2.5 py-2'
            >
              <div className='flex w-full cursor-pointer items-center gap-1'>
                <SvgSpriteLoader id={item?.icon} size={12} />
                <div>{item?.label}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PolicyApproveCard;
