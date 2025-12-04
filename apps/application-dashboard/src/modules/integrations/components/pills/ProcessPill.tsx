import { Button } from '@zamp-platform/ui';
import { Activity } from 'lucide-react';
import { PROCESS_NAMES } from 'modules/integrations/integrations.constant';
import TooltipV2 from '@/components/common/TooltipV2';
import { SIDE_OPTIONS } from '@/types/commonTypes';

const ProcessPill = () => {
  return (
    <TooltipV2
      tooltipBody={<ProcessTooltipContent />}
      side={SIDE_OPTIONS.BOTTOM}
      asChildTrigger
      tooltipClassName='px-3 py-2'
    >
      <Button
        variant='ghost'
        size='small'
        onClick={(e) => e.stopPropagation()}
        className='f-12-500 h-5 gap-x-0.5 px-1 py-[2px]'
      >
        <Activity width={14} height={14} className='p-[2px]' strokeWidth={1.7} />
        <span>{PROCESS_NAMES.length}</span>
      </Button>
    </TooltipV2>
  );
};

const ProcessTooltipContent = () => {
  return (
    <div className='flex flex-col gap-y-2'>
      {PROCESS_NAMES.map((name) => (
        <div key={name} className='flex items-center gap-x-1'>
          <Activity width={10} height={10} strokeWidth={1.7} />
          <span className='f-10-450 text-white'>{name}</span>
        </div>
      ))}
    </div>
  );
};

export default ProcessPill;
