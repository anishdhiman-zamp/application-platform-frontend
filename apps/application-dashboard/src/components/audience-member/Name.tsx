import { useAppSelector } from '@/hooks/toolkit';
import { TeamInfoType } from '@/modules/shareResource';
import { RootState } from '@/store';
import { ResourceAudienceType } from '@/types/api/auth.types';
import { convertEmailUsernameToName, getUserNameFromEmail } from '@/utils/common';

interface AudienceMemberNameProps {
  resourceAudienceType: ResourceAudienceType;
  isOrg: boolean;
  isTeam: boolean;
  user?: { email?: string };
  teamInfo?: TeamInfoType;
  customerName?: string;
}

const AudienceMemberName = ({ resourceAudienceType, isOrg, isTeam, user, teamInfo }: AudienceMemberNameProps) => {
  const orgName = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.name);
  const orgLabel = `Everyone in ${orgName}`;
  const userName = isOrg
    ? orgLabel
    : isTeam
      ? teamInfo?.name
      : convertEmailUsernameToName(getUserNameFromEmail(user?.email || resourceAudienceType)) || 'Unknown';

  return <>{userName}</>;
};

export default AudienceMemberName;
