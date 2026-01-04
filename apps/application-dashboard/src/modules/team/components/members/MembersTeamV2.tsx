import { FC, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Popover, PopoverContent, PopoverTrigger, Tag, toast } from '@zamp-platform/ui';
import TeamItem from 'modules/team/components/members/TeamItem';
import {
  MembersTeamPropsType,
  PostAddTeamToAudiencePayload,
  TeamType,
  UserMappedTeamType,
} from 'modules/team/people.types';
import { usePostAddTeamToAudienceMutation, usePostAddTeamToOrganizationMutation } from '@/apis/people';
import { useAppSelector } from '@/hooks/toolkit';
import { useCurrentUser } from '@/hooks/useUserPrivilege';
import { RootState } from '@/store';
import { capitalizeWords } from '@/utils/common';

const DeleteTeamDialog = lazy(() => import('modules/team/components/members/DeleteTeamDialog'));

const MembersTeamV2: FC<MembersTeamPropsType> = ({
  teamsData,
  userMappedTeams,
  userInfo,
  hasPeoplePolicy,
  teamsRandomColorRef,
}) => {
  const [search, setSearch] = useState('');
  const [filteredTeams, setFilteredTeams] = useState<TeamType[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedTeamToBeDeleted, setSelectedTeamToBeDeleted] = useState<TeamType>();
  const [userTeams, setUserTeams] = useState<UserMappedTeamType[]>([]);
  const [randomColor, setRandomColor] = useState<string>();
  const popoverContentRef = useRef<HTMLDivElement>(null);

  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const { isSystemAdmin } = useCurrentUser();

  const [postAddTeamToAudience] = usePostAddTeamToAudienceMutation();
  const [postAddTeamToOrganization] = usePostAddTeamToOrganizationMutation();

  const orderedTeamsData = useMemo(() => {
    if (userMappedTeams.length > 0) {
      const assignedTeams: TeamType[] = [];
      const unassignedTeams: TeamType[] = [];

      teamsData?.forEach((team) => {
        const isAssigned = userMappedTeams?.some((userTeam) => userTeam?.teamId === team?.team_id);

        if (isAssigned) {
          assignedTeams.push(team);
        } else {
          unassignedTeams.push(team);
        }
      });

      return [...assignedTeams, ...unassignedTeams];
    }

    return teamsData;
  }, [teamsData]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setSearch(value);
    if (value?.length > 0) {
      const filteredTeams = orderedTeamsData?.filter((team) =>
        team?.name?.toLowerCase().includes(value?.toLowerCase()),
      );

      setFilteredTeams(filteredTeams);
    } else {
      setFilteredTeams(orderedTeamsData);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedTeamToBeDeleted(undefined);
    }
  };

  const handleSelectTeamToBeDeleted = (team: TeamType) => {
    setSelectedTeamToBeDeleted(team);
    handlePopoverOpenChange(false);
  };

  const handleAddUserToTeam = (team: UserMappedTeamType) => {
    setUserTeams((prev) => [...prev, team]);
  };

  const handleRemoveUserFromTeam = (teamId: string) => {
    setUserTeams((prev) => prev?.filter((t) => t?.teamId !== teamId));
  };

  const handleAddTeamToAudience = (payload: PostAddTeamToAudiencePayload) => {
    postAddTeamToAudience({ organizationId, teamId: payload?.team_id, payload })
      .unwrap()
      .then((res) => {
        toast.success(
          hasPeoplePolicy ? res?.message : `${capitalizeWords(userInfo?.name)} added to ${payload?.team_name}`,
        );
      })
      .catch(() => {
        toast.error(`Failed to add ${capitalizeWords(userInfo?.name)} to ${payload?.team_name}`);
      });
  };

  const handleAddTeamToOrg = () => {
    const sampleTeamId = `${userTeams?.length + 1}`;

    handleAddUserToTeam({
      teamId: sampleTeamId,
      teamMembershipId: '',
      value: search,
      label: search,
      valid: true,
      color: randomColor,
      isNew: true,
    });
    handlePopoverOpenChange(false);
    postAddTeamToOrganization({
      organizationId,
      payload: { name: search, description: '', color_hex_code: randomColor ?? '' },
    })
      .unwrap()
      .then((res) => {
        const teamId = res?.team_id;

        handleAddTeamToAudience({ user_id: userInfo?.user_id, team_id: teamId, team_name: search });
      })
      .catch(() => {
        toast.error(`Failed to create ${search} team`);
        handleRemoveUserFromTeam(sampleTeamId);
      });
  };

  const handlePopoverOpenChange = (open: boolean) => {
    setIsPopoverOpen(open);
    if (open) {
      setSearch('');
      setRandomColor(teamsRandomColorRef?.current());
      setFilteredTeams(orderedTeamsData);
    }
  };

  const handlePopoverScroll = () => {
    // Dispatch a custom event to notify TeamItem components to close their inner popovers
    window.dispatchEvent(new CustomEvent('outer-popover-scroll'));
  };

  useEffect(() => {
    if (search?.length > 0) {
      const filteredTeams = orderedTeamsData?.filter((team) =>
        team?.name?.toLowerCase().includes(search?.toLowerCase()),
      );

      setFilteredTeams(filteredTeams);
    } else {
      setFilteredTeams(orderedTeamsData);
    }
  }, [orderedTeamsData]);

  useEffect(() => {
    setUserTeams(userMappedTeams);
  }, [userMappedTeams]);

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
        <PopoverTrigger disabled={!isSystemAdmin}>
          <div className='flex cursor-pointer flex-wrap gap-1.5 px-2 py-2.5'>
            {userTeams?.length > 0 ? (
              userTeams?.map((team) => (
                <Tag key={team?.teamId} style={{ backgroundColor: team?.color }} className='border-none'>
                  {team?.label}
                </Tag>
              ))
            ) : (
              <span className='f-12-450 text-gray-500'>Add Team</span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          ref={popoverContentRef}
          className='max-h-[300px] overflow-y-auto p-2.5 [&::-webkit-scrollbar]:hidden'
          sideOffset={-4}
          onScroll={handlePopoverScroll}
        >
          <Input
            placeholder='Search team or create a new one...'
            size='small'
            className='mb-2 min-w-[220px]'
            value={search}
            onChange={handleSearch}
          />
          <div className='space-y-[2px]'>
            {filteredTeams?.map((team) => (
              <TeamItem
                team={team}
                userMappedTeams={userTeams}
                key={team?.team_id}
                onSelectTeamToBeDeleted={() => handleSelectTeamToBeDeleted(team)}
                userInfo={userInfo}
                onAddUserToTeam={handleAddUserToTeam}
                hasPeoplePolicy={hasPeoplePolicy}
                onRemoveUserFromTeam={handleRemoveUserFromTeam}
              />
            ))}
          </div>
          {search && search?.length >= 2 && !teamsData?.some((team) => team?.name === search) && (
            <Button
              variant='ghost'
              size='medium'
              className='mt-0.5 flex w-full items-center justify-start gap-1'
              onClick={handleAddTeamToOrg}
            >
              <span className='f-11-400'>Create team: </span>
              <Tag style={{ backgroundColor: randomColor }}>{search}</Tag>
            </Button>
          )}
        </PopoverContent>
      </Popover>
      {selectedTeamToBeDeleted && (
        <DeleteTeamDialog
          organizationId={organizationId}
          team={selectedTeamToBeDeleted}
          isOpen={!!selectedTeamToBeDeleted}
          onOpenChange={handleOpenChange}
          onRemoveUserFromTeam={handleRemoveUserFromTeam}
        />
      )}
    </>
  );
};

export default MembersTeamV2;
