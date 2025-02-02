import React, { FC, useRef, useState } from 'react';
import {
  useDeleteAudienceFromPageAccessMutation,
  useGetAudiencesByPageIdQuery,
  usePatchChangeAudienceRoleInPageMutation,
} from 'apis/pages';
import { COLORS } from 'constants/colors';
import { JOINED_DATASET_ICON } from 'constants/icons';
import { useOnClickOutside } from 'hooks';
import { CHANGE_PAGE_ACCESS_PRIVILEGES_LIST } from 'modules/page/pages.constants';
import { PageAccessPrivilegesType, PageAccessToAudiencesPropsType } from 'modules/page/pages.types';
import RemoveFromTeamPopup from 'modules/people/RemoveFromTeamPopup';
import Image from 'next/image';
import { convertEmailUsernameToName, getUserNameFromEmail } from 'utils/common';
import AsyncDropdown from 'components/asyncDropdown/AsyncDropdown';
import Avatar from 'components/common/avatar';
import { toast } from 'components/common/toast/Toast';

const PageAccessToAudiences: FC<PageAccessToAudiencesPropsType> = ({
  resource_type,
  privilege,
  pageId,
  resource_audience_id,
  resource_audience_type,
  user,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const role = CHANGE_PAGE_ACCESS_PRIVILEGES_LIST.find((role) => role.value === privilege);
  const [isOpenRemoveFromTeamPopup, setIsOpenRemoveFromTeamPopup] = useState<boolean>(false);
  const [isHoveredDropdown, setIsHoveredDropdown] = useState<boolean>(false);
  const [openChangeRoleDropdown, setOpenChangeRoleDropdown] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<PageAccessPrivilegesType>(role as PageAccessPrivilegesType);
  const { refetch: refetchAudiencesByPageId } = useGetAudiencesByPageIdQuery({ pageId }, { skip: !pageId });
  const [changeRole] = usePatchChangeAudienceRoleInPageMutation();
  const [deleteAudience] = useDeleteAudienceFromPageAccessMutation();
  const userName = convertEmailUsernameToName(getUserNameFromEmail(user?.email || resource_audience_type));

  const handleOpenChangeRoleDropdown = () => {
    setOpenChangeRoleDropdown(true);
  };

  const handleCloseChangeRoleDropdown = () => {
    setOpenChangeRoleDropdown(false);
  };

  const handleRoleChange = (selectedOption: PageAccessPrivilegesType) => {
    changeRole({
      pageId: pageId,
      body: {
        audience_id: resource_audience_id,
        role: selectedOption?.value,
      },
    })
      .unwrap()
      .then(() => {
        setSelectedRole(selectedOption);
        setOpenChangeRoleDropdown(false);
        setIsHoveredDropdown(false);
        refetchAudiencesByPageId();
        toast.success('Role changed successfully');
      })
      .catch((err) => {
        toast.error(err?.data?.error || 'Failed to change role');
      });
  };

  const handleOpenRemoveFromTeamPopup = () => {
    setIsOpenRemoveFromTeamPopup(true);
  };

  const handleCloseRemoveFromTeamPopup = () => {
    setIsOpenRemoveFromTeamPopup(false);
  };

  const handleDeleteAudience = () => {
    deleteAudience({
      pageId: pageId,
      body: {
        audience_id: resource_audience_id,
      },
    })
      .unwrap()
      .then(() => {
        handleCloseRemoveFromTeamPopup();
        refetchAudiencesByPageId();
        toast.success('Audience deleted successfully');
      })
      .catch((err) => {
        handleCloseRemoveFromTeamPopup();
        toast.error(err?.data?.error || 'Failed to delete audience');
      });
  };

  useOnClickOutside(dropdownRef, handleCloseChangeRoleDropdown);

  return (
    <>
      <div className='f-12-400 px-2 bg-white flex justify-between items-center'>
        <div className='flex items-center justify-start'>
          <div className='flex items-start justify-start gap-x-1 w-[140px]'>
            <>
              <div className='w-fit'>
                <Avatar
                  name={userName}
                  backgroundColor={COLORS.GRAY_1000}
                  className='w-4 h-4 rounded-full text-white f-8-400 flex items-center justify-center'
                />
              </div>
              <span>{userName}</span>
            </>
          </div>
          <span className='flex text-wrap flex-wrap break-words whitespace-normal items-center justify-start gap-1 w-[100px]'>
            <Image src={JOINED_DATASET_ICON} alt='joined-dataset-icon' width={16} height={16} />
            {resource_type}
          </span>
        </div>

        <AsyncDropdown
          onOpen={handleOpenChangeRoleDropdown}
          onClose={handleCloseChangeRoleDropdown}
          isOpen={openChangeRoleDropdown}
          onDelete={handleOpenRemoveFromTeamPopup}
          onChange={(role) => handleRoleChange(role as PageAccessPrivilegesType)}
          options={CHANGE_PAGE_ACCESS_PRIVILEGES_LIST}
          selectedValue={selectedRole}
          defaultValue={role as PageAccessPrivilegesType}
          showDelete
          isHoveredDropdown={isHoveredDropdown}
          setIsHoveredDropdown={setIsHoveredDropdown}
          isOverflowStyle
        />
      </div>
      <RemoveFromTeamPopup
        isOpen={isOpenRemoveFromTeamPopup}
        onClose={handleCloseRemoveFromTeamPopup}
        onDelete={handleDeleteAudience}
        feature='remove-access-from-page'
        warningDescription={`${userName} will be immediately removed from ${resource_type} and lose all access`}
      />
    </>
  );
};

export default PageAccessToAudiences;
