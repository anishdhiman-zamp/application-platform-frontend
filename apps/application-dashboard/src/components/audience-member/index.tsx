import { CSS_VARS, Tag } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import Image from 'next/image';
import { JOINED_DATASET_ICON } from '@/constants/icons';
import { useAppSelector } from '@/hooks/toolkit';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { TeamInfoType } from '@/modules/shareResource';
import type { RootState } from '@/store';
import { ResourceAudienceType } from '@/types/api/auth.types';
import AudienceMemberName from 'components/audience-member/Name';
import Avatar from 'components/common/avatar';

interface AudienceMemberProps {
  teamInfo: TeamInfoType;
  currentUserHasAdminAccess: boolean;
  resourceAudienceType: ResourceAudienceType;
  resourceType: string;
  customerName?: string;
  user?: {
    name?: string;
    role?: string;
    email?: string;
  };
  showAvatar?: boolean;
  tagClassName?: string;
}

const AudienceMember = ({
  teamInfo,
  currentUserHasAdminAccess,
  customerName,
  resourceAudienceType,
  resourceType,
  user,
  showAvatar = true,
  tagClassName,
}: AudienceMemberProps) => {
  const orgName = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.name);
  const { isCurrentUserEmail } = useUserIdentity();
  const checkIfUser = isCurrentUserEmail(user?.email ?? '');
  const isTeam = resourceAudienceType === ResourceAudienceType.TEAM;
  const isOrg = resourceAudienceType === ResourceAudienceType.ORGANIZATION;
  const customAvatarWord = isOrg ? customerName || orgName || '' : (user?.email ?? '');

  return (
    <div className='flex items-center justify-start'>
      <div className='flex items-start justify-start gap-x-1'>
        <div className='flex items-center gap-1'>
          {showAvatar ? (
            isTeam ? (
              <div>
                <SvgSpriteLoader id='users-02' width={14} height={14} color={CSS_VARS.GRAY_1000} className='mr-0.5' />
              </div>
            ) : (
              <div className='w-fit'>
                <Avatar
                  name={customAvatarWord}
                  backgroundColor={CSS_VARS.GRAY_1000}
                  className='f-8-400 flex h-4 w-4 items-center justify-center rounded-full text-white dark:text-black'
                />
              </div>
            )
          ) : null}
          <Tag
            variant={isTeam ? 'blue' : 'outline'}
            className={tagClassName}
            style={{
              backgroundColor: isTeam ? teamInfo?.color : 'transparent',
            }}
          >
            <AudienceMemberName
              resourceAudienceType={resourceAudienceType}
              isOrg={isOrg}
              isTeam={isTeam}
              user={user}
              teamInfo={teamInfo}
              customerName={customerName}
            />
            {checkIfUser && <span className='f-12-400 text-gray-700'>(You)</span>}
          </Tag>
        </div>
      </div>
      <span className='hidden w-[100px] flex-wrap items-center justify-start gap-1 text-wrap break-words whitespace-normal'>
        {currentUserHasAdminAccess && (
          <>
            <Image src={JOINED_DATASET_ICON} alt='joined-dataset-icon' width={16} height={16} />
            {resourceType}
          </>
        )}
      </span>
    </div>
  );
};

export default AudienceMember;
