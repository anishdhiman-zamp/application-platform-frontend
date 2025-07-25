import { FC, useMemo } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  toast,
} from '@zamp-platform/ui';
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

const DeleteTeamDialog: FC<DeleteTeamDialogProps> = ({
  organizationId,
  team,
  isOpen,
  onOpenChange,
  onRemoveUserFromTeam,
}) => {
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent size='small' showCloseButton className='w-[400px]'>
        <DialogHeader>
          <DialogHeaderTitle>Delete team '{team?.name}'</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='f-14-400 p-5'>
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
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2.5'>
          <DialogClose asChild>
            <Button variant='secondary' size='medium'>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant='destructive'
            size='medium'
            onClick={handleDeleteTeam}
            isLoading={isDeletingTeam}
            className='w-14'
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTeamDialog;
