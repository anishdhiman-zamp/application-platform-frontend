import { FC } from 'react';
import TeamMembersEmail from 'modules/people/components/teamMembers/TeamMembersEmail';
import TeamMembersName from 'modules/people/components/teamMembers/TeamMembersName';
import TeamMembersRole from 'modules/people/components/teamMembers/TeamMembersRole';
import { TEAM_MEMBERS_LISTING_COLUMN_DEFS } from 'modules/people/people.constants';
import { AudiencesByOrganisationIdResponse } from 'types/api/people.types';

interface TeamMembersListingProps {
  data: AudiencesByOrganisationIdResponse[];
}

const TeamMembersListing: FC<TeamMembersListingProps> = ({ data = [] }) => {
  return (
    !!data && (
      <>
        <div className='grid grid-cols-3 gap-4 border-b-0.5 border-DIVIDER_GRAY'>
          {TEAM_MEMBERS_LISTING_COLUMN_DEFS.map((column, index) => (
            <div key={index} className='py-2 px-2'>
              <span className='text-left f-11-400 text-GRAY_700'>{column.headerName}</span>
            </div>
          ))}
        </div>
        <div className='overflow-y-auto h-[calc(100vh-270px)]'>
          {data.map((row, index) => (
            <div key={index} className='grid grid-cols-3 gap-4 border-b-0.5 border-DIVIDER_GRAY'>
              <TeamMembersName value={row?.user?.email} />
              <TeamMembersEmail value={row?.user?.email} />
              <TeamMembersRole value={{ user_id: row?.user?.user_id, privilege: row?.privilege }} />
            </div>
          ))}
        </div>
      </>
    )
  );
};

export default TeamMembersListing;
