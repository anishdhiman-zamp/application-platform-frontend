import { FC } from 'react';
import InvitedMembersEmail from 'modules/people/components/invitedMembers/InvitedMembersEmail';
import InvitedMembersName from 'modules/people/components/invitedMembers/InvitedMembersName';
import InvitedMembersRole from 'modules/people/components/invitedMembers/InvitedMembersRole';
import { INVITE_TEAM_MEMBERS_LISTING_COLUMN_DEFS } from 'modules/people/people.constants';
import { InvitedMembersListingPropsType } from 'modules/people/people.types';

const InvitedMembersListing: FC<InvitedMembersListingPropsType> = ({ data = [] }) => {
  return (
    !!data && (
      <>
        <div className='grid grid-cols-3 gap-4 border-b-0.5 border-DIVIDER_GRAY'>
          {INVITE_TEAM_MEMBERS_LISTING_COLUMN_DEFS.map((column, index) => (
            <div key={index} className='py-2 px-2'>
              <span className='text-left f-11-400 text-GRAY_700'>{column?.headerName}</span>
            </div>
          ))}
        </div>
        <div className='overflow-y-auto h-[calc(100vh-270px)] pb-10' style={{ scrollbarWidth: 'none' }}>
          {data.map((row, index) => (
            <div key={index} className='grid grid-cols-3 gap-4 border-b-0.5 border-DIVIDER_GRAY'>
              <InvitedMembersName value={row?.email} />
              <InvitedMembersEmail value={row?.email} />
              <InvitedMembersRole value={row?.privilege} />
            </div>
          ))}
        </div>
      </>
    )
  );
};

export default InvitedMembersListing;
