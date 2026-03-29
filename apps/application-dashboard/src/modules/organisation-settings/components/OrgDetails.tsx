'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Input } from '@zamp-platform/ui';
import { useRouter } from 'next/navigation';
import { RootState } from 'store';
import { useGetAudiencesByOrganisationIdQuery } from '@/apis/people';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { SettingsRow } from '@/modules/general/components/SettingsRow';
import { useCopyToClipboard } from '@/modules/general/hooks/useCopyToClipboard';
import {
  ORG_DETAILS_ROWS,
  ROLE_LABEL_MAP,
} from '@/modules/organisation-settings/constants/organisation-settings.constants';
import { formatPlural } from '@/utils/common';
import { generateOrgIconSvg } from '@/utils/pixelArtGenerator';

const OrgDetails = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);

  const org = user?.orgs?.[0];
  const orgId = org?.organization_id ?? '';
  const rawRole = org?.resource_audience_policies?.[0]?.privilege ?? '';
  const role = ROLE_LABEL_MAP[rawRole] ?? rawRole;
  const iconSeed = org?.icon_value ?? org?.name ?? '';

  const [orgName, setOrgName] = useState(org?.name ?? '');
  const { copied, handleCopy } = useCopyToClipboard(orgId);
  const orgIconSvg = useMemo(() => (iconSeed ? generateOrgIconSvg(iconSeed) : null), [iconSeed]);

  const { data: members } = useGetAudiencesByOrganisationIdQuery({ organizationId: orgId }, { skip: !orgId });
  const memberCount = members?.length;
  const memberCountLabel = memberCount !== undefined ? formatPlural(memberCount, 'team member') : '';

  const orgDetailsRows = ORG_DETAILS_ROWS({
    orgId,
    copied,
    handleCopy,
    memberCountLabel,
    role,
    onManageMembers: () => router.push(ROUTES_PATH.CHAT_SETTINGS_PEOPLE),
  });

  useEffect(() => {
    if (org?.name) setOrgName(org.name);
  }, [org?.name]);

  return (
    <div className='flex flex-col'>
      <h1 className='f-20-600 text-GRAY_1000 pb-4'>Organisation details</h1>
      <div className='border-GRAY_400 rounded-2xl border'>
        <div className='border-GRAY_400 flex items-center justify-between gap-4 border-b px-6 py-4'>
          <div className='flex min-w-0 items-center justify-center gap-3'>
            {orgIconSvg ? (
              <div
                className='h-7 w-7 shrink-0 overflow-hidden rounded-md [&_svg]:h-full [&_svg]:w-full'
                dangerouslySetInnerHTML={{ __html: orgIconSvg }}
              />
            ) : (
              <div className='bg-GRAY_200 f-16-500 text-GRAY_700 flex h-8 w-8 shrink-0 items-center justify-center rounded-md'>
                {orgName?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <Input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className='f-12-450 w-[210px] rounded-lg shadow-none focus-visible:ring-0'
            />
          </div>
        </div>
        {orgDetailsRows.map(({ key, label, value, action }, index) => (
          <SettingsRow
            key={key}
            label={label}
            value={value}
            action={action}
            className={index === orgDetailsRows.length - 1 ? 'border-none' : ''}
          />
        ))}
      </div>
    </div>
  );
};

export default OrgDetails;
