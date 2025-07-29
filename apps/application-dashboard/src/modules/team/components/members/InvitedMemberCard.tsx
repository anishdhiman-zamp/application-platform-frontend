import type { FC } from 'react';
import { Button, toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
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
    <div className={cn(`border-b-0.5 border-DIVIDER_GRAY group relative grid w-full grid-cols-9`)}>
      <div className='col-span-3'>
        <MembersName name={row?.name ?? row?.email} value={row?.email} />
      </div>
      <div className='col-span-3'>
        <MembersEmail value={row?.email} />
      </div>
      <div className='col-span-3'>
        <MembersRole value={{ user_id: '', privilege: row?.privilege }} />
      </div>
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
