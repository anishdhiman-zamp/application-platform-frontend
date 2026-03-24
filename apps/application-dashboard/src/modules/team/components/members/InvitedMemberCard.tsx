import type { FC } from 'react';
import { Button, toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import MembersEmail from 'modules/team/components/members/MembersEmail';
import MembersName from 'modules/team/components/members/MembersName';
import MembersRole from 'modules/team/components/members/MembersRole';
import { useDeleteAudienceInvitationMutation } from '@/apis/people';
import { InvitedAudiencesByOrganisationIdResponse } from '@/types/api/people.types';

type InvitedMemberCardProps = {
  row: InvitedAudiencesByOrganisationIdResponse;
  organizationId: string;
};

const InvitedMemberCard: FC<InvitedMemberCardProps> = ({ row, organizationId }) => {
  const [deleteAudienceInvitation, { isLoading: isDeletingAudienceInvitation }] = useDeleteAudienceInvitationMutation();

  const handleDeleteAudienceInvitation = (invitationId: string) => {
    deleteAudienceInvitation({ organizationId, invitationId })
      .unwrap()
      .then(() => {
        toast.success('Invitation deleted successfully');
      })
      .catch(() => {
        toast.error('Failed to delete invitation');
      });
  };

  return (
    <div className='border-b-0.5 border-DIVIDER_GRAY group relative grid grid-cols-3 gap-4 *:min-w-0'>
      <MembersName name={row?.name ?? row?.email} value={row?.email} />
      <MembersEmail value={row?.email} />
      <MembersRole value={{ user_id: '', privilege: row?.privilege }} />
      <div className='absolute top-2 right-0'>
        <div className='flex h-full items-center justify-end'>
          <Button
            isLoading={isDeletingAudienceInvitation}
            variant='ghost'
            size='small'
            className='h-6 w-6 opacity-0 group-hover:opacity-100'
            onClick={() => handleDeleteAudienceInvitation(row?.organization_invitation_id ?? '')}
          >
            <SvgSpriteLoader id='trash-01' className='text-GRAY_900' size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvitedMemberCard;
