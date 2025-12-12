import { Suspense } from 'react';
import PeoplePage from 'modules/team/PeoplePage';

const Team = () => {
  return (
    <Suspense>
      <PeoplePage />
    </Suspense>
  );
};

export default Team;
