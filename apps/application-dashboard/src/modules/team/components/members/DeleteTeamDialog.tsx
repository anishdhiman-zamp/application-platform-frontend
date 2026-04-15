import { useMemo } from 'react';
import { ConfirmationDialog, toast } from '@zamp-platform/ui';
import MembersName from 'modules/team/components/members/MembersName';
import { TeamType } from 'modules/team/people.types';
import { useDeleteTeamMutation } from '@/apis/people';
import TooltipV2 from '@/components/common/TooltipV2';
import { SIDE_OPTIONS } from '@/types/commonTypes';
import { capitalizeWords } from '@/utils/common';

interface DeleteTeamDialogProps {
  organizationId: string;
  team?: TeamType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveUserFromTeam: (teamId: string) => void;
}

const DeleteTeamDialog = ({
  organizationId,
  team,
  isOpen,
  onOpenChange,
  onRemoveUserFromTeam,
}: DeleteTeamDialogProps) => {
  const [deleteTeam, { isLoading: isDeletingTeam }] = useDeleteTeamMutation();

  const teamMembers = useMemo(() => {
    return team?.team_memberships?.map((membership) => membership?.user?.name)?.filter((userName) => !!userName) ?? [];
  }, [team]);

  const handleDeleteTeam = () => {
    if (!team) return;
    deleteTeam({ organizationId, teamId: team?.team_id })
      .unwrap()
      .then(() => {
        toast.success(`${team?.name} team deleted successfully`);
        onRemoveUserFromTeam(team?.team_id);
      })
      .catch(() => {
        toast.error(`Failed to delete ${team?.name} team`);
      })
      .finally(() => {
        onOpenChange(false);
      });
  };

  if (!team) return null;

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title={`Delete team '${team?.name}'`}
      description={
        <>
          Deleting the {team?.name} team will revoke all access granted through this team
          {teamMembers?.length > 0
            ? ` for ${capitalizeWords(teamMembers?.[0])} ${teamMembers?.length > 1 ? `and ` : ''}`
            : ''}
          {teamMembers?.length === 2 && capitalizeWords(teamMembers?.[1])}
          {teamMembers?.length > 2 && (
            <TooltipV2
              tooltipBody={teamMembers?.slice(1)?.map((member) => (
                <MembersName key={member} value={member} member />
              ))}
              side={SIDE_OPTIONS.BOTTOM}
              tooltipClassName='bg-white border max-h-[230px] overflow-y-auto [&::-webkit-scrollbar]:hidden p-1'
              className='cursor-pointer'
              scrollableBody
            >
              <span className='text-blue-700'>{teamMembers?.length - 1} others</span>
            </TooltipV2>
          )}
        </>
      }
      confirmLabel='Delete'
      isLoading={isDeletingTeam}
      onConfirm={handleDeleteTeam}
      confirmButtonClassName='w-14'
    />
  );
};

export default DeleteTeamDialog;
