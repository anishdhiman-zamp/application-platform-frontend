import { FC, useState } from 'react';
import { Button, Dialog, DialogContent, DialogTrigger, SearchInput } from '@zamp-platform/ui';
import { useUserIdentity } from 'hooks/useUserIdentity';
import InviteMembersPopup from 'modules/team/InviteMembersPopup';
import { AudiencesByOrganisationIdResponse } from 'types/api/people.types';

type PeopleHeaderPropsType = {
  search: string;
  setSearch: (value: string) => void;
  teamMembersData: AudiencesByOrganisationIdResponse[];
};

const PeopleHeader: FC<PeopleHeaderPropsType> = ({ search, setSearch, teamMembersData }) => {
  const [isInviteMembersPopupOpen, setIsInviteMembersPopupOpen] = useState(false);
  const { isMember } = useUserIdentity();

  return (
    <>
      <div className='f-20-600 text-GRAY_1000'>People</div>
      <div className='mt-5 flex w-full items-center justify-between'>
        <SearchInput
          placeholder='Search team members'
          className='w-80'
          value={search}
          onChange={setSearch}
          aria-label='Search team members'
        />
        <Dialog open={isInviteMembersPopupOpen} onOpenChange={setIsInviteMembersPopupOpen}>
          <DialogTrigger asChild>
            <Button
              className='f-12-500 bg-GRAY_1000 hover:bg-GRAY_950 active:bg-GRAY_950 disabled:bg-GRAY_100 disabled:text-GRAY_700 flex h-7 cursor-pointer items-center gap-1 overflow-clip rounded-md px-3 py-[7px] text-white hover:text-white active:text-white disabled:cursor-not-allowed'
              data-testid='invite-user-btn'
              disabled={isMember}
            >
              Invite members
            </Button>
          </DialogTrigger>
          <DialogContent
            className='max-h-none w-[458px]'
            title='Invite Members'
            description='Type or paste mail addresses, separated by spaces or commas'
          >
            <InviteMembersPopup
              isOpen={isInviteMembersPopupOpen}
              onClose={() => setIsInviteMembersPopupOpen(false)}
              teamMembersData={teamMembersData}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default PeopleHeader;
