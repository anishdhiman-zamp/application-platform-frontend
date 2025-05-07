import React from 'react';
import { Tag } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import Image from 'next/image';
import { COLORS } from '@/constants/colors';
import { JOINED_DATASET_ICON } from '@/constants/icons';
import { TeamInfoType } from '@/modules/shareResource';
import { ResourceAudienceType } from '@/types/api/auth.types';
import { checkIfCurrentUser } from '@/utils/accessPermission/accessPermission.utils';
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
}

const AudienceMember = ({
  teamInfo,
  currentUserHasAdminAccess,
  customerName,
  resourceAudienceType,
  resourceType,
  user,
  showAvatar = true,
}: AudienceMemberProps) => {
  const checkIfUser = checkIfCurrentUser(user?.email ?? '');
  const isTeam = resourceAudienceType === ResourceAudienceType.TEAM;
  const isOrg = resourceAudienceType === ResourceAudienceType.ORGANIZATION;
  const customAvatarWord = isOrg && customerName ? customerName : (user?.email ?? '');

  return (
    <div className='flex items-center justify-start'>
      <div className='flex items-start justify-start gap-x-1'>
        <div className='flex items-center gap-1'>
          {showAvatar ? (
            isTeam ? (
              <div>
                <SvgSpriteLoader id='users-02' width={14} height={14} color={COLORS.GRAY_1000} className='mr-0.5' />
              </div>
            ) : (
              <div className='w-fit'>
                <Avatar
                  name={customAvatarWord}
                  backgroundColor={COLORS.GRAY_1000}
                  className='w-4 h-4 rounded-full text-white f-8-400 flex items-center justify-center'
                />
              </div>
            )
          ) : null}
          <Tag
            variant={isTeam ? 'blue' : 'outline'}
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
      <span className='hidden text-wrap flex-wrap break-words whitespace-normal items-center justify-start gap-1 w-[100px]'>
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
