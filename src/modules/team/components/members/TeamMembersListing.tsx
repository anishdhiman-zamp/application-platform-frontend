import { FC } from 'react';
import { useGetAudiencesByOrganisationIdQuery } from 'apis/people';
import { useAppSelector } from 'hooks/toolkit';
import EmptyStateListing from 'modules/team/components/EmptyStateListing';
import MembersEmail from 'modules/team/components/members/MembersEmail';
import MembersName from 'modules/team/components/members/MembersName';
import MembersRole from 'modules/team/components/members/MembersRole';
import SkeletonLoaderListing from 'modules/team/components/SkeletonLoaderListing';
import { TEAM_MEMBERS_LISTING_COLUMN_DEFS } from 'modules/team/people.constants';
import { TeamMembersListingPropsType } from 'modules/team/people.types';
import { RootState } from 'store';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

const TeamMembersListing: FC<TeamMembersListingPropsType> = ({ data, isLoadingTeamMembersData }) => {
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const { data: teamMembersData } = useGetAudiencesByOrganisationIdQuery({ organizationId }, { skip: !organizationId });
  const hasData = (teamMembersData?.length ?? 0) > 0;

  return hasData || isLoadingTeamMembersData ? (
    <>
      <div className='grid grid-cols-3 gap-4 border-b-0.5 border-DIVIDER_GRAY'>
        {TEAM_MEMBERS_LISTING_COLUMN_DEFS.map((column, index) => (
          <div key={index} className='py-2 px-2'>
            <span className='text-left f-11-400 text-GRAY_700'>{column.headerName}</span>
          </div>
        ))}
      </div>
      <CommonWrapper
        isLoading={isLoadingTeamMembersData}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<SkeletonLoaderListing />}
      >
        <div className='overflow-y-auto h-[calc(100vh-270px)] pb-10' style={{ scrollbarWidth: 'none' }}>
          {data.map((row, index) => (
            <div key={index} className='grid grid-cols-3 gap-4 border-b-0.5 border-DIVIDER_GRAY'>
              <MembersName value={row?.user?.email} member />
              <MembersEmail value={row?.user?.email} />
              <MembersRole
                value={{ user_id: row?.user?.user_id, privilege: row?.privilege, userEmail: row?.user?.email }}
                member
              />
            </div>
          ))}
        </div>
      </CommonWrapper>
    </>
  ) : (
    <EmptyStateListing title='No team members were added' />
  );
};

export default TeamMembersListing;
