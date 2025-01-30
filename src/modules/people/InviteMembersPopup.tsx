import React, { FC, useRef, useState } from 'react';
import {
  useGetInvitedAudiencesByOrganisationIdQuery,
  usePostInviteAudiencesByOrganisationIdMutation,
} from 'apis/people';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { useAppSelector } from 'hooks/toolkit';
import { TEAM_MEMBERS_PRIVILEGES_LIST } from 'modules/people/people.constants';
import { InviteMembersPopupPropsType, TeamMembersPrivilegeType } from 'modules/people/people.types';
import { RootState } from 'store';
import { PostAudiencesInviteData } from 'types/api/people.types';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import Popup from 'components/common/popup/Popup';
import { toast } from 'components/common/toast/Toast';
import MultiSelectInput from 'components/multiSelectInput/MultiSelectInput';
import { ArrayListOption } from 'components/multiSelectInput/multiSelectInput.types';

const InviteMembersPopup: FC<InviteMembersPopupPropsType> = ({ isOpen, onClose }) => {
  const selectedRoleRef = useRef<TeamMembersPrivilegeType>(TEAM_MEMBERS_PRIVILEGES_LIST[0]);
  const [inputArrayList, setInputArrayList] = useState<ArrayListOption[]>([]);
  const [search, setSearch] = useState<string>('');
  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const validationErrorText = 'Email address incorrect';
  const placeholderText = 'Share with people and teams';
  const isInvitable = !showValidationError && inputArrayList.length > 0;
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const [postInviteAudiences] = usePostInviteAudiencesByOrganisationIdMutation();
  const { refetch: refetchAudiencesByOrganizationId } = useGetInvitedAudiencesByOrganisationIdQuery(
    { organizationId },
    { skip: !organizationId },
  );

  const handleCloseInviteMembersPopup = () => {
    onClose?.();
    setShowValidationError(false);
    setInputArrayList([]);
    setSearch('');
  };

  const postAutdiencesInviteData: PostAudiencesInviteData = {
    invitations: inputArrayList
      .map((item) => ({
        email: item.value,
        role: item.role ?? 'default_role',
      }))
      .filter((item) => item.email),
  };

  const handleInviteMembers = async () => {
    try {
      await postInviteAudiences({ organizationId, body: postAutdiencesInviteData }).unwrap();
      refetchAudiencesByOrganizationId();
      toast.success('Invitation sent successfully');
      handleCloseInviteMembersPopup();
    } catch {
      toast.error('Failed to send invitation');
    }
  };

  return (
    <Popup
      isOpen={isOpen}
      showIcon
      title='Invite Members'
      titleClassName='f-16-600 text-GRAY_950'
      iconCategory={ICON_SPRITE_TYPES.GENERAL}
      iconId='x-close'
      iconColor={COLORS.TEXT_PRIMARY}
      onClose={handleCloseInviteMembersPopup}
      popupWrapperClassName='bg-white rounded-t-3.5 border border-b-0 border-GRAY_400'
      closeOnClickOutside={false}
    >
      <div className='flex flex-col rounded-b-3.5 w-[458px] bg-white border border-t-0 border-GRAY_400'>
        <div className='px-4 py-6'>
          <MultiSelectInput
            id='invite-members'
            inputArrayList={inputArrayList}
            setInputArrayList={setInputArrayList}
            search={search}
            setSearch={setSearch}
            selectedRoleRef={selectedRoleRef}
            showValidationError={showValidationError}
            validationErrorText={validationErrorText}
            isOpen={isOpen}
            setShowValidationError={setShowValidationError}
            placeholderText={placeholderText}
            roleOptions={TEAM_MEMBERS_PRIVILEGES_LIST}
            customDropdownMenuClass={{
              width: '120px',
              marginLeft: '-20px',
            }}
          />
        </div>
        <div className='flex justify-end border-t border-GRAY_200 py-4 px-5 w-full'>
          <Button
            type={BUTTON_TYPES.PRIMARY}
            id='send-user-invite-btn'
            size={SIZE_TYPES.MEDIUM}
            disabled={!isInvitable}
            onClick={handleInviteMembers}
          >
            Send invite
          </Button>
        </div>
      </div>
    </Popup>
  );
};

export default InviteMembersPopup;
