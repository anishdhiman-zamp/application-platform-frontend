import { FC, useMemo } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { COLORS } from '@/constants/colors';
import type { AudiencesByOrganisationIdResponse, GetTeamsByOrganizationIdResponseType } from '@/types/api/people.types';
import { ApprovalStatus, type ApproverDetailsType } from '@/unused/apis/policies.types';
import { APPROVAL_TYPE } from '@/unused/modules/payments/payments.constant';
import { cn } from '@/utils/common';

type ApprovalDetailsBadgeProps = {
  approvalDetails: ApproverDetailsType;
  teamsData: GetTeamsByOrganizationIdResponseType[];
  orgMembers: AudiencesByOrganisationIdResponse[];
  orgName: string;
  isApproved: boolean;
};

const STATUS_ICON_MAP = {
  APPROVED: <SvgSpriteLoader id='check' color={COLORS.GRAY_1000} size={12} />,
  PENDING: <SvgSpriteLoader id='clock' color={COLORS.GRAY_700} size={12} />,
  REJECTED: <SvgSpriteLoader id='x-close' color={COLORS.GRAY_1000} size={12} />,
};

const ApprovalDetailsBadge: FC<ApprovalDetailsBadgeProps> = ({
  approvalDetails: {
    approval_status_details: { user_approvals, status },
    id,
    type,
  },
  teamsData,
  orgMembers,
  orgName,
  isApproved,
}) => {
  const approvalUsers = useMemo(() => {
    return user_approvals;
  }, [user_approvals]);

  const getUserStatusIcon = (userId: string) => {
    const user = approvalUsers?.find((user) => user.id === userId);

    if (user?.status) {
      return STATUS_ICON_MAP[user.status as keyof typeof STATUS_ICON_MAP];
    }

    return <SvgSpriteLoader id='clock' color={COLORS.GRAY_500} size={12} />;
  };

  const { label, backgroundColor, borderColor, teamList } = useMemo(() => {
    switch (type) {
      case APPROVAL_TYPE.TEAM: {
        const team = teamsData?.find((team) => team?.team_id === id);

        return {
          label: team?.name,
          backgroundColor: team?.metadata?.color_hex_code,
          borderColor: team?.metadata?.color_hex_code,
          teamList: team?.team_memberships?.map((team) => team?.user),
        };
      }
      case APPROVAL_TYPE.USER: {
        const orgMember = orgMembers?.find((member) => member?.resource_audience_id === id);

        return {
          label: orgMember?.user?.name,
          backgroundColor: COLORS.WHITE,
          borderColor: COLORS.GRAY_400,
          teamList: [],
        };
      }
      case APPROVAL_TYPE.ORGANIZATION: {
        return {
          label: orgName,
          backgroundColor: COLORS.WHITE,
          borderColor: COLORS.GRAY_400,
          teamList: orgMembers.map((res) => res.user),
        };
      }
      default: {
        return { label: '', backgroundColor: COLORS.WHITE, borderColor: COLORS.GRAY_400 };
      }
    }
  }, [teamsData, type]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={cn('flex items-center gap-1 rounded border px-1.5 py-0.5', {
            'cursor-pointer': !!teamList?.length,
          })}
          style={{ background: backgroundColor, borderColor }}
        >
          {(!isApproved ||
            (isApproved && (status === ApprovalStatus.APPROVED || status === ApprovalStatus.REJECTED))) &&
            STATUS_ICON_MAP[status as keyof typeof STATUS_ICON_MAP]}
          <div className='f-12-500 text-GRAY_1000 select-none'>{label}</div>
        </div>
      </DropdownMenuTrigger>
      {!!teamList?.length && (
        <DropdownMenuContent align='end' className='z-1001 max-h-[300px] min-w-[200px] overflow-y-auto' sideOffset={5}>
          {teamList?.map((user) => (
            <DropdownMenuItem key={user?.user_id} className='flex cursor-default items-center justify-between py-1'>
              <div className='f-12-450 text-GRAY_1000 border-GRAY_400 rounded border px-2.5 py-0.5'>
                {user?.name || user?.email || ''}
              </div>
              {getUserStatusIcon(user?.user_id)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default ApprovalDetailsBadge;
