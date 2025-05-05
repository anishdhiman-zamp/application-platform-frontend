import { FC, useMemo } from 'react';
import { APPROVAL_TYPE } from 'modules/payments/payments.constant';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { COLORS } from '@/constants/colors';
import type { AudiencesByOrganisationIdResponse, GetTeamsByOrganizationIdResponseType } from '@/types/api/people.types';
import type { ApproverDetailsType } from '@/types/api/policies.types';
import { cn } from '@/utils/common';

type ApprovalDetailsBadgeProps = {
  approvalDetails: ApproverDetailsType;
  teamsData: GetTeamsByOrganizationIdResponseType[];
  orgMembers: AudiencesByOrganisationIdResponse[];
  orgName: string;
};

const STATUS_ICON_MAP = {
  APPROVED: <SvgSpriteLoader id='check' color={COLORS.GRAY_1000} size={12} />,
  PENDING: <SvgSpriteLoader id='clock' color={COLORS.GRAY_700} size={12} />,
  REJECTED: <SvgSpriteLoader id='close' color={COLORS.ORANGE_200} size={12} />,
};

const ApprovalDetailsBadge: FC<ApprovalDetailsBadgeProps> = ({ approvalDetails, teamsData, orgMembers, orgName }) => {
  const teamLength = useMemo(() => {
    return approvalDetails?.approval_status_details?.user_approvals?.length;
  }, [approvalDetails]);

  const { label, backgroundColor, borderColor } = useMemo(() => {
    switch (approvalDetails.type) {
      case APPROVAL_TYPE.TEAM: {
        const team = teamsData?.find((team) => team?.team_id === approvalDetails?.id);

        return {
          label: team?.name,
          backgroundColor: team?.metadata?.color_hex_code,
          borderColor: team?.metadata?.color_hex_code,
        };
      }
      case APPROVAL_TYPE.USER: {
        const orgMember = orgMembers?.find((member) => member?.resource_audience_id === approvalDetails?.id);

        return {
          label: orgMember?.user?.name,
          backgroundColor: COLORS.WHITE,
          borderColor: COLORS.GRAY_400,
        };
      }
      case APPROVAL_TYPE.ORGANIZATION:
        return {
          label: orgName,
          backgroundColor: COLORS.WHITE,
          borderColor: COLORS.GRAY_400,
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
