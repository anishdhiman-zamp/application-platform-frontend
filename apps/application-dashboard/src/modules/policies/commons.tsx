import AccountWithLogo from 'modules/payments/move-money/components/AccountWithLogo';
import { MASK_DOTS } from 'modules/payments/payments.constant';
import { AccountDetailsType } from 'modules/payments/payments.types';
import { ResourceType } from 'modules/shareResource';
import { snakeCaseToSentenceCase } from 'utils/common';
import AudienceMember from '@/components/audience-member';
import AudienceMemberName from '@/components/audience-member/Name';
import { DEFAULT_BANK } from '@/constants/icons';
import { ResourceAudienceType } from '@/types/api/auth.types';

export const getAccountWithLogo = (account: AccountDetailsType) => {
  return (
    <AccountWithLogo
      className='p-0 py-1'
      name={`${snakeCaseToSentenceCase(account?.account_name)}  ${MASK_DOTS}  ${account?.masked_account_number}`}
      logo={DEFAULT_BANK}
    />
  );
};

export const getAudienceMember = (audience: {
  resource_audience_type: ResourceAudienceType;
  resource_audience_id: string;
  privilege: string;
  resource_type: string;
  resource_id: string;
  user?: {
    email: string;
  };
  team_name: string;
  team_color: string;
}) => {
  return (
    <AudienceMember
      resourceType={ResourceType.PAYMENTS}
      user={{ ...audience?.user, email: audience?.user?.email ?? '' }}
      currentUserHasAdminAccess={false}
      teamInfo={{ name: audience?.team_name, color: audience?.team_color }}
      resourceAudienceType={audience?.resource_audience_type}
      showAvatar={false}
    />
  );
};

export const getAudienceName = (audience: {
  resource_audience_id: string;
  resource_audience_type: ResourceAudienceType;
  user?: {
    email: string;
  };
  team_name: string;
  team_color: string;
}) => {
  return (
    <AudienceMemberName
      key={audience.resource_audience_id}
      resourceAudienceType={audience.resource_audience_type}
      isOrg={audience.resource_audience_type === ResourceAudienceType.ORGANIZATION}
      isTeam={audience.resource_audience_type === ResourceAudienceType.TEAM}
      user={audience.user}
    />
  );
};
