import { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  usePostAddTeamToAudienceMutation,
  usePostAddTeamToOrganizationMutation,
  useRemoveTeamFromAudienceMutation,
} from 'apis/people';
import { COLORS, TEAMS_COLORS } from 'constants/colors';
import { useOnClickOutside } from 'hooks';
import { useUserIdentity } from 'hooks/useUserIdentity';
import CustomTeamsDropdown from 'modules/team/components/members/CustomTeamsDropdown';
import { TEAM_PERMISSION_TOAST_MSG } from 'modules/team/people.constants';
import {
  CustomTeamsDropdownPropsType,
  MembersTeamPropsType,
  PostAddTeamToAudiencePayload,
  PostTeamsByOrganizationIdPayload,
} from 'modules/team/people.types';
import { MapAny } from 'types/commonTypes';
import { cn, cyclicIterator } from 'utils/common';
import { KEY_CODES } from '@/components/multiSelectInput/multiSelectInput.types';
import { toast } from 'components/common/toast/Toast';
import MultiSelectInput from 'components/multiSelectInput/MultiSelectInput';

const MembersTeam: FC<MembersTeamPropsType> = ({ userInfo, organizationId, teamsData, userId, userMappedTeams }) => {
  const { isMember } = useUserIdentity();
  const teamsRowRef = useRef<HTMLDivElement>(null);
  const teamsRandomColorRef = useRef(cyclicIterator(TEAMS_COLORS));
  const [postAddTeamToOrganization] = usePostAddTeamToOrganizationMutation();
  const [postAddTeamToAudience] = usePostAddTeamToAudienceMutation();
  const [removeTeamFromAudience] = useRemoveTeamFromAudienceMutation();
  const [search, setSearch] = useState<string>('');
  const [multiSelectInputKey, setMultiSelectInputKey] = useState(0);
  const [isCustomInputFocused, setIsCustomInputFocused] = useState<boolean>(false);
  const [openFullViewTeamTags, setOpenFullViewTeamTags] = useState<boolean>(false);
  const [randomColor, setRandomColor] = useState(() => teamsRandomColorRef.current());
  const [selectedItems, setSelectedItems] = useState<
    {
      value: string;
      label: string;
      valid: boolean;
      color?: string;
      isNew?: boolean;
      teamId?: string;
      teamMembershipId?: string;
    }[]
  >(userMappedTeams);

  const handleAddTeamToOrg = async (payload: PostTeamsByOrganizationIdPayload) => {
    postAddTeamToOrganization({ organizationId, payload })
      .unwrap()
      .then((res) => {
        const teamId = res?.team_id;

        handleAddTeamToAudience({ user_id: userId, team_id: teamId, team_name: payload?.name });
      })
      .catch(() => {
        toast.error(TEAM_PERMISSION_TOAST_MSG.TEAM_CREATE_ERROR);
      });
  };

  const handleAddTeamToAudience = async (payload: PostAddTeamToAudiencePayload) => {
    postAddTeamToAudience({ organizationId, teamId: payload?.team_id, payload })
      .unwrap()
      .then(() => {
        toast.success(`${userInfo?.name} added to ${payload?.team_name}`);
      })
      .catch(() => {
        toast.error(`Failed to add ${userInfo?.name} to ${payload?.team_id}`);
      });
  };

  const handleCheckIfTeamExists = (teamInfo: PostTeamsByOrganizationIdPayload) => {
    const teamId = teamsData.find(
      (team) => team?.name === teamInfo?.name && team?.metadata?.color_hex_code === teamInfo?.color_hex_code,
    )?.team_id;

    const updatedTeamInfo = {
      user_id: userId,
      team_id: teamId ?? '',
      team_name: teamInfo?.name,
    };

    if (teamId) {
      handleAddTeamToAudience(updatedTeamInfo);
    } else {
      handleAddTeamToOrg(teamInfo);
    }
  };

  const handleRemoveAudienceFromTeam = (item: MapAny) => {
    const membershipId = item?.teamMembershipId;
    const teamId = item?.teamId;

    if (!teamId || !membershipId) {
      toast.error(TEAM_PERMISSION_TOAST_MSG.INVALID_TEAM_ERROR);

      return;
    }

    // optimistic delete
    setSelectedItems((prev) => prev?.filter((selected) => selected?.teamId !== teamId));

    const payload = {
      team_id: teamId,
      team_membership_id: membershipId,
      user_id: userId,
    };

    removeTeamFromAudience({ organizationId, teamId, payload })
      .unwrap()
      .then(() => {
        toast.success(`${userInfo?.name} removed from ${item?.label}`);
      })
      .catch(() => {
        toast.error(`Failed to remove ${userInfo?.name} from ${item?.label}`);
      });
  };

  const handleValidateAndAdd = ({
    value,
    color,
  }: {
    value: string;
    label: string;
    color?: string;
    isNew?: boolean;
  }) => {
    if (!value) return;

    // optimistic update
    setSelectedItems((prev) => [
      ...prev,
      {
        value,
        label: value,
        valid: true,
        color: color ?? randomColor,
        isNew: true,
      },
    ]);

    const payload = {
      name: value,
      description: '',
      color_hex_code: color ?? randomColor,
    };

    handleCheckIfTeamExists(payload);
  };

  const handleOptionSelection = (option: { value: string; label: string; color?: string; isNew?: boolean }) => {
    // optimistic update
    setSelectedItems((prev) => [
      ...prev,
      {
        value: option?.value,
        label: option?.value,
        valid: true,
        color: option?.color ?? randomColor,
        isNew: option?.isNew,
      },
    ]);

    const payload = {
      name: option?.value,
      description: '',
      color_hex_code: option?.color ?? randomColor,
    };

    handleCheckIfTeamExists(payload);
  };

  // filter options list
  const filteredOptionListsData = [
    ...(teamsData
      ?.filter((item) => !selectedItems.some((selected) => selected?.value === item?.name))
      .map((member) => ({
        label: member?.name ?? '',
        value: member?.name ?? '',
        color: member?.metadata?.color_hex_code ?? randomColor,
        isNew: false,
      })) ?? []),
    ...[
      {
        label: search,
        value: search,
        color: randomColor,
        isNew: true,
      },
    ],
  ];

  // sync selectedItems with userMappedTeams
  const syncSelectedItemsWithUserMappedTeams = () => {
    const updatedSelectedItems = selectedItems.map((selected) => {
      const matchingUserTeam = userMappedTeams.find((team) => team?.value === selected?.value);

      if (matchingUserTeam) {
        return {
          ...selected,
          teamId: matchingUserTeam?.teamId,
          teamMembershipId: matchingUserTeam?.teamMembershipId,
        };
      }

      return selected;
    });

    setSelectedItems(updatedSelectedItems);
  };

  useEffect(() => {
    syncSelectedItemsWithUserMappedTeams();
    setMultiSelectInputKey((prev) => prev + 1);
  }, [userMappedTeams]);

  useEffect(() => {
    if (!search) {
      const newColor = teamsRandomColorRef.current();

      setRandomColor(newColor);
    }
  }, [search]);

  const memoizedDropdown = useMemo(() => {
    const MemoizedDropdownComponent = (props: CustomTeamsDropdownPropsType) => (
      <CustomTeamsDropdown {...props} randomColor={randomColor} />
    );

    MemoizedDropdownComponent.displayName = 'memoized-teams-dropdown-component';

    return MemoizedDropdownComponent;
  }, [randomColor]);

  const handleCloseFullViewTeamTags = () => {
    setOpenFullViewTeamTags(false);
  };

  const handleToggleFullViewTeamTags = () => {
    setOpenFullViewTeamTags((prev) => !prev);
  };

  useOnClickOutside(teamsRowRef, handleCloseFullViewTeamTags);

  return (
    <div
      className='f-12-400 text-GRAY_1000 relative flex h-full items-center justify-start overflow-visible px-2 py-2 text-left'
      ref={teamsRowRef}
      onClick={handleToggleFullViewTeamTags}
    >
      {isMember ? (
        <div className={cn('flex flex-nowrap gap-1.5 overflow-hidden', openFullViewTeamTags && 'flex-wrap')}>
          {selectedItems.map((item, index) => (
            <span
              key={index}
              className='f-12-400 text-GRAY_1000 flex w-fit rounded px-1.5 py-0.5 capitalize'
              style={{ backgroundColor: item?.color ?? COLORS.WHITE }}
            >
              {item?.label}
            </span>
          ))}
        </div>
      ) : (
        <div>
          <MultiSelectInput
            key={multiSelectInputKey}
            id='select-team'
            search={search}
            setSearch={setSearch}
            inputArrayList={selectedItems}
            setInputArrayList={setSelectedItems}
            optionsList={filteredOptionListsData}
            customOptionsListDropdown={memoizedDropdown}
            onValidateAndAdd={handleValidateAndAdd}
            onSelectOption={handleOptionSelection}
            placeholderText='Add team'
            isOpen={false}
            wrapperClassName='border-none rounded-none shadow-none f-12-400'
            inputWrapperClassName={cn(isCustomInputFocused ? 'flex-wrap' : 'flex-nowrap', 'p-0')}
            multiSelectInputClassName='f-12-400 rounded-none!'
            setIsCustomInputFocused={setIsCustomInputFocused}
            selectOnlyFromList
            onCustomDeleteFn={handleRemoveAudienceFromTeam}
            closeDropdownOnSelect
            allowedAddKeys={[KEY_CODES.ENTER, KEY_CODES.COMMA]}
          />
        </div>
      )}
    </div>
  );
};

export default MembersTeam;
