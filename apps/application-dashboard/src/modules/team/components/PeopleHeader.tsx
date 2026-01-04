import { FC, lazy, useRef, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { useUserIdentity } from 'hooks/useUserIdentity';
import { AudiencesByOrganisationIdResponse } from 'types/api/people.types';
import { SIZE_TYPES } from 'types/common/components';
import Input from 'components/common/input';

const InviteMembersPopup = lazy(() => import('modules/team/InviteMembersPopup'));

type PeopleHeaderPropsType = {
  search: string;
  setSearch: (value: string) => void;
  teamMembersData: AudiencesByOrganisationIdResponse[];
};

const PeopleHeader: FC<PeopleHeaderPropsType> = ({ search, setSearch, teamMembersData }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInviteMembersPopupOpen, setIsInviteMembersPopupOpen] = useState(false);
  const { isMember } = useUserIdentity();

  const handleOpenInviteMembersPopup = () => {
    setIsInviteMembersPopupOpen(true);
  };
  const handleCloseInviteMembersPopup = () => {
    setIsInviteMembersPopupOpen(false);
  };

  return (
    <>
      <div className='f-20-600 text-GRAY_1000'>People</div>
      <div className='mt-5 flex w-full items-center justify-between'>
        <Input
          placeholder='Search team members'
          className='w-80'
          inputRef={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leadingIconProps={{
            id: 'search-sm',
            iconCategory: ICON_SPRITE_TYPES.GENERAL,
            className: 'text-GRAY_700',
          }}
          size={SIZE_TYPES.SMALL}
        />
        <Button
          className='f-12-500 bg-GRAY_1000 hover:bg-GRAY_950 active:bg-GRAY_950 disabled:bg-GRAY_100 disabled:text-GRAY_700 flex h-7 cursor-pointer items-center gap-1 overflow-clip rounded-md px-3 py-[7px] text-white hover:text-white active:text-white disabled:cursor-not-allowed'
          data-testid='invite-user-btn'
          onClick={handleOpenInviteMembersPopup}
          disabled={isMember}
        >
          Invite members
        </Button>
        {isInviteMembersPopupOpen && (
          <InviteMembersPopup
            isOpen={isInviteMembersPopupOpen}
            onClose={handleCloseInviteMembersPopup}
            teamMembersData={teamMembersData}
          />
        )}
      </div>
    </>
  );
};

export default PeopleHeader;
