import React, { FC, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetInvitedAudiencesByOrganisationIdQuery,
  usePostInviteAudiencesByOrganisationIdMutation,
} from 'apis/people';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { useAppSelector } from 'hooks/toolkit';
import { TEAM_MEMBERS_PRIVILEGES_LIST } from 'modules/people/people.constants';
import { InviteMembersPopupPropsType, TeamMembersPrivilegeType } from 'modules/people/people.types';
import { validateEmail } from 'modules/people/people.utils';
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
  const [search, setSearch] = useState<string>('');
  const placeholderText = 'Share with people and teams';
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const [postInviteAudiences] = usePostInviteAudiencesByOrganisationIdMutation();
  const { data: invitedTeamMembersData, refetch: refetchAudiencesByOrganizationId } =
    useGetInvitedAudiencesByOrganisationIdQuery({ organizationId }, { skip: !organizationId });

  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const [validationErrorText, setValidationErrorText] = useState<string>('');
  const checkIfUser = useSelector((state: RootState) => state?.user?.user)?.user_email;
  const [selectedItems, setSelectedItems] = useState<ArrayListOption[]>([]);

  const isInvitable = !showValidationError && selectedItems.length > 0;

  const handleCloseInviteMembersPopup = () => {
    onClose?.();
    setShowValidationError(false);
    setSelectedItems([]);
    setSearch('');
  };

  const postAudiencesInviteData: PostAudiencesInviteData = {
    invitations: selectedItems
      .map((item) => ({
        email: item.value,
        role: item.role ?? 'default_role',
      }))
      .filter((item) => item.email),
  };

  const handleInviteMembers = async () => {
    try {
      await postInviteAudiences({ organizationId, body: postAudiencesInviteData }).unwrap();
      refetchAudiencesByOrganizationId();
      toast.success('Invitation sent successfully');
      handleCloseInviteMembersPopup();
    } catch {
      toast.error('Failed to send invitation');
    }
  };

  const handleValidateAndAdd = (value: string) => {
    let isValid = validateEmail(value);
    const resource_audience_id = '';
    const resource_audience_type = '';

    if (!isValid) {
      setValidationErrorText('Email address incorrect');
    }

    const isAlreadyInvited = invitedTeamMembersData?.some((item) => item?.email === value);

    if (isAlreadyInvited) {
      isValid = false;
      setValidationErrorText('User is already invited');
    }

    if (value === checkIfUser) {
      isValid = false;
      setShowValidationError(true);
      setValidationErrorText('You cannot invite yourself');
    }

    setSelectedItems((prevEmails) => [
      ...prevEmails,
      {
        value: value,
        valid: isValid,
        role: selectedRoleRef?.current?.value,
        color: isValid ? COLORS.WHITE : COLORS.RED_100,
        resource_audience_type,
        resource_audience_id,
      },
    ]);
    setShowValidationError((prevShowValidationError) => prevShowValidationError || !isValid);
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
            search={search}
            setSearch={setSearch}
            selectedRoleRef={selectedRoleRef}
            isOpen={isOpen}
            placeholderText={placeholderText}
            roleOptions={TEAM_MEMBERS_PRIVILEGES_LIST}
            inputArrayList={selectedItems}
            setInputArrayList={setSelectedItems}
            validationErrorText={validationErrorText}
            showValidationError={showValidationError}
            setShowValidationError={setShowValidationError}
            onValidateAndAdd={handleValidateAndAdd}
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
