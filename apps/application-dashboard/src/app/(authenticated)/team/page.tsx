import { FC } from 'react';
import { TEAM_TABS_TYPES } from 'modules/team/people.types';
import PeoplePage from 'modules/team/PeoplePage';

interface TeamProps {
  searchParams: Promise<{
    tab?: TEAM_TABS_TYPES;
  }>;
}

const Team: FC<TeamProps> = async ({ searchParams }) => {
  const { tab } = await searchParams;

  return <PeoplePage tab={tab} />;
};

export default Team;
