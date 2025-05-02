import { FC, useMemo } from 'react';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { COLORS } from '@/constants/colors';
import type { GetTeamsByOrganizationIdResponseType } from '@/types/api/people.types';
import type { ApproverDetailsType } from '@/types/api/policies.types';
import { cn } from '@/utils/common';

type ApprovalDetailsBadgeProps = {
  approvalDetails: ApproverDetailsType;
  teamsData: GetTeamsByOrganizationIdResponseType[];
};

const STATUS_ICON_MAP = {
  APPROVED: <SvgSpriteLoader id='check' color={COLORS.GRAY_1000} size={12} />,
  PENDING: <SvgSpriteLoader id='clock' color={COLORS.GRAY_700} size={12} />,
  REJECTED: <SvgSpriteLoader id='close' color={COLORS.ORANGE_200} size={12} />,
};

const ApprovalDetailsBadge: FC<ApprovalDetailsBadgeProps> = ({ approvalDetails, teamsData }) => {
  const teamLength = useMemo(() => {
    return approvalDetails?.approval_status_details?.user_approvals?.length;
  }, [approvalDetails]);

  const { label, backgroundColor, borderColor } = useMemo(() => {
    if (approvalDetails.type === 'organization') {
      const id = '6d0e0ce5-5a8f-4097-a07c-ba19a0914283';
      const team = teamsData?.find((team) => team?.team_id === id);

      return {
        label: team?.name,
        backgroundColor: team?.metadata?.color_hex_code,
        borderColor: team?.metadata?.color_hex_code,
      };
    }

    return { label: 'user', backgroundColor: COLORS.WHITE, borderColor: COLORS.GRAY_400 };
  }, [teamsData, approvalDetails]);

  return (
    <div
      className={cn('px-1.5 py-0.5 rounded flex items-center gap-1 border')}
      style={{ background: backgroundColor, borderColor }}
    >
      {STATUS_ICON_MAP[approvalDetails?.approval_status_details?.status as keyof typeof STATUS_ICON_MAP]}
      <div className='f-12-500 text-GRAY_1000'>
        {label} <span className='text-GRAY_800'>{!!teamLength && teamLength}</span>
      </div>
    </div>
  );
};

export default ApprovalDetailsBadge;
