import type { FC } from 'react';
import { Button, toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/lib/utils';
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
    <div className={cn(`group border-b-0.5 border-DIVIDER_GRAY grid grid-cols-9 w-full relative`)}>
      <div className='col-span-3'>
        <MembersName value={row?.email} />
      </div>
      <div className='col-span-3'>
        <MembersEmail value={row?.email} />
      </div>
      <div className='col-span-3'>
        <MembersRole value={{ user_id: '', privilege: row?.privilege }} />
      </div>
      <div className='absolute right-0 top-2'>
        <div className='flex justify-end items-center h-full'>
          <Button
            isLoading={isDeletingAudienceInvitation}
            variant='ghost'
            size='small'
            className='w-6 h-6 group-hover:opacity-100 opacity-0'
            onClick={() => handleDeleteAudienceInvitation(row?.organization_invitation_id ?? '')}
          >
            <SvgSpriteLoader id='trash-01' className=' text-GRAY_900' size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvitedMemberCard;
