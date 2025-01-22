import PeopleHeader from 'modules/people/PeopleHeader';
import PeopleTabs from 'modules/people/PeopleTabs';

const PeoplePage = () => {
  return (
    <div className='p-10 w-full h-full bg-white'>
      <PeopleHeader />
      <PeopleTabs />
    </div>
  );
};

export default PeoplePage;
