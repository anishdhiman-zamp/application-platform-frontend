import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import ArtifactTag from 'modules/process/common/ArtifactTag';
import { ACTIVITY_LOGS_SUMMARY_MOCK_DATA } from 'modules/process/mock.data';

const LogCta = () => {
  return (
    <div className='flex flex-col items-center justify-start gap-y-2 mt-3 w-full'>
      <div className='flex items-center justify-start gap-x-2 w-full'>
        {ACTIVITY_LOGS_SUMMARY_MOCK_DATA?.artifacts?.map((artifact) => (
          <ArtifactTag key={artifact.id} data={artifact} />
        ))}
      </div>
      <div className='flex items-center justify-start gap-x-2 w-full'>
        <Button variant={'outline'} className='gap-x-1.5 h-6 px-2.5 py-1 f-12-500'>
          <SvgSpriteLoader id='coins-stacked-04' size={12} />
          <span className='f-12-450 text-GRAY_1000'>View Data</span>
        </Button>
      </div>
      <div className='flex items-center justify-start gap-x-2 w-full'>
        <Button className='gap-x-1.5 h-6 px-2.5 py-1.5 f-12-500' disabled>
          <SvgSpriteLoader id='refresh-cw-01' size={12} />
          <span className='f-12-450'>Try again</span>
        </Button>
        <Button variant={'outline'} className='gap-x-1.5 h-6 px-2.5 py-1.5 f-12-500'>
          <span className='f-12-450'>Reject</span>
        </Button>
        <Button className='gap-x-1.5 h-6 px-2.5 py-1.5 f-12-500'>
          <SvgSpriteLoader id='check' size={12} />
          <span className='f-12-450'>Approve</span>
        </Button>
      </div>
    </div>
  );
};

export default LogCta;
