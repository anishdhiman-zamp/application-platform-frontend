import React, { FC, useRef, useState } from 'react';
import {
  useDeleteAudienceFromDatasetAccessMutation,
  useGetAudiencesByDatasetIdQuery,
  usePatchChangeAudienceRoleInDatasetMutation,
} from 'apis/dataset';
import { COLORS } from 'constants/colors';
import { CHANGE_ACCESS_PRIVILEGES_LIST, DATASET_ACCESS_PRIVILEGES_LIST } from 'modules/data/data.constants';
import { DatasetAccessPrivilegesType, DatasetAccessToAudiencesPropsType } from 'modules/data/data.types';
import RemoveFromTeamPopup from 'modules/people/RemoveFromTeamPopup';
import { defaultFn } from 'types/commonTypes';
import Avatar from 'components/common/avatar';
import { Dropdown } from 'components/common/dropdown';
import { toast } from 'components/common/toast/Toast';

const DatasetAccessToAudiences: FC<DatasetAccessToAudiencesPropsType> = ({
  resource_type,
  privilege,
  datasetId,
  resource_audience_id,
  user,
}) => {
  const role = DATASET_ACCESS_PRIVILEGES_LIST.find((role) => role.value === privilege);
  const selectedRoleRef = useRef<DatasetAccessPrivilegesType>(DATASET_ACCESS_PRIVILEGES_LIST[0]);

  const { refetch: refetchAudiencesByDatasetId } = useGetAudiencesByDatasetIdQuery({ datasetId }, { skip: !datasetId });
  const [changeRole] = usePatchChangeAudienceRoleInDatasetMutation();
  const [deleteAudience] = useDeleteAudienceFromDatasetAccessMutation();
  const [isHoveredDropdown, setIsHoveredDropdown] = useState<boolean>(false);

  const handleRoleChange = async (selectedOption: DatasetAccessPrivilegesType) => {
    selectedRoleRef.current = selectedOption;
    const changedRole = selectedRoleRef.current.value;

    try {
      await changeRole({
        datasetId: datasetId,
        body: {
          audience_id: resource_audience_id,
          role: changedRole,
        },
      }).unwrap();
      refetchAudiencesByDatasetId();
      toast.success('Role changed successfully');
    } catch {
      toast.error('Failed to change role');
    }
  };

  const [isOpenRemoveFromTeamPopup, setIsOpenRemoveFromTeamPopup] = useState<boolean>(false);
  const handleOpenRemoveFromTeamPopup = () => {
    setIsOpenRemoveFromTeamPopup(true);
  };
  const handleCloseRemoveFromTeamPopup = () => {
    setIsOpenRemoveFromTeamPopup(false);
  };

  const handleDeleteAudience = async () => {
    try {
      await deleteAudience({
        datasetId: datasetId,
        body: {
          audience_id: resource_audience_id,
        },
      }).unwrap();
      handleCloseRemoveFromTeamPopup();
      refetchAudiencesByDatasetId();
      toast.success('Audience deleted successfully');
    } catch {
      handleCloseRemoveFromTeamPopup();
      toast.error('Failed to delete audience');
    }
  };

  return (
    <>
      <div className='f-12-400 py-1.5 px-2 bg-white flex justify-between items-start'>
        <div className='flex items-start justify-start gap-x-1 w-[120px]'>
          {!!user?.email && (
            <>
              <div className='w-fit'>
                <Avatar
                  name={user?.email}
                  backgroundColor={COLORS.GRAY_1000}
                  className='w-4 h-4 rounded-full text-white f-8-400 flex items-center justify-center'
                />
              </div>
              <span>{user?.email}</span>
            </>
          )}
        </div>
        <span className='flex text-wrap flex-wrap break-words whitespace-normal items-start justify-start w-[90px]'>
          {resource_type}
        </span>
        <span
          className='flex items-end justify-end w-[120px] -mt-[12px]'
          onMouseEnter={() => setIsHoveredDropdown(true)}
          onMouseLeave={() => setIsHoveredDropdown(false)}
        >
          <Dropdown
            options={CHANGE_ACCESS_PRIVILEGES_LIST}
            id='dataset-access-to-audiences-dropdown'
            eventCallback={defaultFn}
            onChange={handleRoleChange}
            defaultValue={role}
            value={selectedRoleRef.current}
            placeholder='Member'
            isSearchable={false}
            enableDelete
            onClickDelete={handleOpenRemoveFromTeamPopup}
            customClass={{
              focus: 'none',
              border: 'transparent',
              fontSize: 'f-12-400',
            }}
            customClassNames={{
              placeholder: 'f-12-300',
            }}
            menuOptionClasses={{
              contentWrapper: 'py-2',
            }}
            isHoveredDropdown={isHoveredDropdown}
            showSelectedIcon
          />
        </span>
      </div>
      <RemoveFromTeamPopup
        isOpen={isOpenRemoveFromTeamPopup}
        onClose={handleCloseRemoveFromTeamPopup}
        onDelete={handleDeleteAudience}
        feature='remove-access-from-dataset'
      />
    </>
  );
};

export default DatasetAccessToAudiences;
