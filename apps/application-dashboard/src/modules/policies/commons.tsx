import { SelectOption } from '@zamp-platform/ui';
import AccountWithLogo from 'modules/payments/move-money/components/AccountWithLogo';
import { MASK_DOTS } from 'modules/payments/payments.constant';
import { AccountDetailsType } from 'modules/payments/payments.types';
import { attributesMap, payoutAttributes, templateAttributes } from 'modules/policies/create/constants';
import {
  CreatePolicyConfigPayload,
  PolicyAttributeAction,
  PolicyDialogType,
  PolicyFormData,
} from 'modules/policies/types';
import { ResourceType } from 'modules/shareResource';
import { store } from 'store';
import { convertEmailUsernameToName, getUserNameFromEmail, snakeCaseToSentenceCase } from 'utils/common';
import AudienceMember from '@/components/audience-member';
import AudienceMemberName from '@/components/audience-member/Name';
import { DEFAULT_BANK } from '@/constants/icons';
import { ResourceAudienceType } from '@/types/api/auth.types';

export const getAccountWithLogo = (account: AccountDetailsType) => {
  return (
    <AccountWithLogo
      className='p-0 py-1'
      name={`${snakeCaseToSentenceCase(account?.account_name)}  ${MASK_DOTS}  ${account?.masked_account_number}`}
      logo={account?.banking_partner ?? DEFAULT_BANK}
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

export const getAudienceLabel = (audience: {
  resource_audience_id: string;
  resource_audience_type: ResourceAudienceType;
  user?: {
    email: string;
  };
  team_name: string;
  team_color: string;
}) => {
  const orgName = store.getState()?.user?.user?.orgs?.[0]?.name;
  const orgLabel = `Everyone in ${orgName}`;
  const isOrg = audience.resource_audience_type === ResourceAudienceType.ORGANIZATION;
  const isTeam = audience.resource_audience_type === ResourceAudienceType.TEAM;
  const userName = isOrg
    ? orgLabel
    : isTeam
      ? audience?.team_name
      : convertEmailUsernameToName(getUserNameFromEmail(audience.user?.email || audience.resource_audience_type)) ||
        'Unknown';

  return userName;
};

export const getAttributes = (type: PolicyDialogType) => {
  if (type === 'payout') {
    return payoutAttributes;
  }

  return templateAttributes;
};

const getValue = (key: string, selectedValue: string | number | SelectOption[]) => {
  // Handle different field types
  switch (key) {
    case 'amount':
      return Number(selectedValue ?? 0);
    case 'is_template_based_payment':
      if (Array.isArray(selectedValue)) return selectedValue?.[0]?.value;

      return false;
    default:
      if (Array.isArray(selectedValue)) {
        return selectedValue.map((option) => option.value);
      }

      return selectedValue;
  }
};

export const transformFormDataToApiPayload = (
  data: PolicyFormData,
  defaultConditions: any[],
): CreatePolicyConfigPayload => {
  // Transform creator data
  const creator = (data.creator as SelectOption[]).map((option) => {
    if (typeof option.value === 'string' || typeof option.value === 'boolean') {
      return { type: 'user', id: option.value.toString() };
    }

    return { type: option.value.type, id: option.value.id };
  });

  // Transform conditions
  const conditions = Object.entries(data)
    .filter(([key]) => attributesMap[key]?.formFieldType === 'condition')
    .map(([key, value]) => {
      const attribute = attributesMap[key];
      const payloadValue = getValue(key, value as SelectOption[]);

      if (
        !payloadValue ||
        ((typeof payloadValue === 'string' || Array.isArray(payloadValue)) && (!payloadValue || !payloadValue.length))
      ) {
        return;
      }

      return {
        field: key,
        value: payloadValue,
        operator: attribute.operator,
      };
    })
    .filter((condition) => condition !== undefined);

  // Transform approval flow
  const approval_flow = {
    steps: data.approvalSteps.map((step) => ({
      logical_operator: step.logical_operator,
      conditions: step.conditions.map((condition) => ({
        mode: condition.mode,
        approver_details: condition.approver_details.map((approver) => ({
          type: approver.type,
          id: approver.id,
        })),
      })),
    })),
  };

  const action = (data.action as SelectOption[])[0]?.value as string;

  const transformedConditions = [...(conditions ?? []), ...defaultConditions];

  return {
    creator: creator.length > 0 ? creator : undefined,
    ...(transformedConditions.length > 0 && {
      conditions: {
        logical_operator: '&&',
        conditions: transformedConditions,
      },
    }),
    action,
    approval_flow: action === PolicyAttributeAction.BLOCK ? undefined : approval_flow,
  };
};

export const defaultConditions = [
  {
    field: 'currency',
    value: 'USD',
    operator: '==',
  },
];
