import { FC, KeyboardEvent, useEffect, useState } from 'react';
import { Button, Checkbox, Input, Popover, PopoverContent, PopoverTrigger, Tag, toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { MoreHorizontalIcon } from 'lucide-react';
import { TeamItemProps } from 'modules/team/people.types';
import {
  usePostAddTeamToAudienceMutation,
  useRemoveTeamFromAudienceMutation,
  useUpdateTeamMutation,
} from '@/apis/people';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { COLORS } from '@/constants/colors';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { useAppSelector } from '@/hooks/toolkit';
import { RootState } from '@/store';
import { capitalizeWords, preventAutoFocus } from '@/utils/common';

const TeamItem: FC<TeamItemProps> = ({
  team,
  userMappedTeams,
  onSelectTeamToBeDeleted,
  userInfo,
  onAddUserToTeam,
  hasPeoplePolicy,
  onRemoveUserFromTeam,
}) => {
  const [editedName, setEditedName] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';

  const [updateTeam] = useUpdateTeamMutation();
  const [postAddTeamToAudience] = usePostAddTeamToAudienceMutation();
  const [removeTeamFromAudience] = useRemoveTeamFromAudienceMutation();

  const handleUpdateTeam = () => {
    if (editedName?.trim() === team?.name || !editedName?.trim()) return;
    updateTeam({ organizationId, teamId: team?.team_id, payload: { name: editedName } })
      .then(() => {
        toast.success(TOAST_MESSAGES.SUCCESS_TEAM_NAME_UPDATED);
      })
      .catch(() => {
        toast.error(TOAST_MESSAGES.ERROR_TEAM_NAME_UPDATE);
      })
      .finally(() => {
        setIsPopoverOpen(false);
      });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER) {
      e.preventDefault();
      e.stopPropagation();
      handleUpdateTeam();
    }
  };

  const handleCheckboxChange = (value: boolean) => {
    if (value) {
      onAddUserToTeam({
        teamId: team?.team_id,
        teamMembershipId: '',
        value: team?.team_id,
        label: team?.name,
        valid: true,
        color: team?.metadata?.color_hex_code,
        isNew: false,
      });
      postAddTeamToAudience({
        organizationId,
        teamId: team?.team_id,
        payload: { user_id: userInfo?.user_id, team_id: team?.team_id, team_name: team?.name },
      })
        .unwrap()
        .then((res) => {
          toast.success(hasPeoplePolicy ? res?.message : `${capitalizeWords(userInfo?.name)} added to ${team?.name}`);
        })
        .catch(() => {
          toast.error(`Failed to add ${capitalizeWords(userInfo?.name)} to ${team?.name}`);
        });
    } else {
      const teamMembershipId = userMappedTeams?.find((t) => t?.teamId === team?.team_id)?.teamMembershipId ?? '';

      onRemoveUserFromTeam(team?.team_id);
      removeTeamFromAudience({
        organizationId,
        teamId: team?.team_id,
        payload: {
          user_id: userInfo?.user_id,
          team_id: team?.team_id,
          team_membership_id: teamMembershipId,
        },
      })
        .unwrap()
        .then(() => {
          toast.success(`${capitalizeWords(userInfo?.name)} removed from ${team?.name}`);
        })
        .catch(() => {
          toast.error(`Failed to remove ${capitalizeWords(userInfo?.name)} from ${team?.name}`);
        });
    }
  };

  useEffect(() => {
    setEditedName(team?.name);
  }, [team?.name]);

  useEffect(() => {
    if (!isHovered && isPopoverOpen) {
      setIsPopoverOpen(false);
    }
  }, [isHovered, isPopoverOpen]);

  useEffect(() => {
    if (isPopoverOpen) {
      // Close the inner popover when outer popover is scrolled
      const handleCustomScroll = () => {
        setIsPopoverOpen(false);
      };

      window.addEventListener('outer-popover-scroll', handleCustomScroll);

      return () => {
        window.removeEventListener('outer-popover-scroll', handleCustomScroll);
      };
    }
  }, [isPopoverOpen]);

  return (
    <div
      className='group flex cursor-pointer items-center justify-between rounded-md p-1.5 hover:bg-gray-100'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='flex items-center gap-1.5'>
        <Checkbox
          id={team?.team_id}
          checked={userMappedTeams?.some((t) => t?.teamId === team?.team_id)}
          onCheckedChange={handleCheckboxChange}
        />
        <Tag style={{ backgroundColor: team?.metadata?.color_hex_code }} className='border-none'>
          {team?.name}
        </Tag>
      </div>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant='ghost' size='xxsmall' className='opacity-0 group-hover:opacity-100'>
            <MoreHorizontalIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='space-y-2' onCloseAutoFocus={preventAutoFocus}>
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e?.target?.value)}
            size='small'
            autoFocus
            icon={<SvgSpriteLoader id='edit-03' size={14} color={COLORS?.GRAY_500} />}
            onBlur={handleUpdateTeam}
            onKeyDown={handleKeyDown}
          />
          <Button
            variant='ghost'
            size='medium'
            className='flex w-full items-center justify-start gap-1.5 text-red-700 hover:text-red-700'
            onClick={onSelectTeamToBeDeleted}
          >
            <SvgSpriteLoader id='trash-04' size={12} />
            <span>Delete team</span>
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TeamItem;
