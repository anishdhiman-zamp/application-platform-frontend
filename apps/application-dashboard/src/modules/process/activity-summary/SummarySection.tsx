import Summary from 'modules/process/activity-summary/components/Summary';
import { ACTIVITY_LOGS_SUMMARY_MOCK_DATA } from 'modules/process/mock.data';
import ArtifactTag from '@/modules/process/common/ArtifactTag';

const SummarySection = () => {
  return (
    <div className='flex flex-col items-start justify-start h-full min-w-max overflow-x-auto'>
      <div className='px-6 pt-5 pb-6 flex flex-col justify-start items-start w-full gap-y-3'>
        <p className='f-13-550'>Key Details</p>
        {ACTIVITY_LOGS_SUMMARY_MOCK_DATA?.summary?.map((section) => <Summary key={section.id} data={section} />)}
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

export default SummarySection;
