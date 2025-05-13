import ArtifactTag from 'modules/process/activity-summary/components/ArtifactTag';
import SummarySection from 'modules/process/activity-summary/components/SummarySection';
import { ACTIVITY_LOGS_SUMMARY_MOCK_DATA } from 'modules/process/mock.data';

const Summary = () => {
  return (
    <div className='flex flex-col items-start justify-start h-full w-full overflow-auto'>
      <div className='px-6 pt-5 pb-6 flex flex-col justify-start items-start w-full gap-y-3'>
        <p className='f-13-550'>Key Details</p>
        {ACTIVITY_LOGS_SUMMARY_MOCK_DATA?.summary?.map((section) => <SummarySection key={section.id} data={section} />)}
      </div>
      <div className='h-px w-full bg-GRAY_400' />
      <div className='px-6 py-5 flex flex-col justify-start items-start w-full gap-y-3'>
        <p className='f-13-550'>Artifacts</p>
        {ACTIVITY_LOGS_SUMMARY_MOCK_DATA?.artifacts?.map((artifact) => (
          <ArtifactTag key={artifact.id} data={artifact} />
        ))}
      </div>
    </div>
  );
};

export default Summary;
