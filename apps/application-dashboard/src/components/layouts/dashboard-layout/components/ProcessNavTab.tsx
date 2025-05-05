import { getActivityRouteByProcessId } from 'constants/routeConfig';
import { useRouter } from 'next/router';
import { cn } from 'utils/common';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { ICON_SPRITE_TYPES } from '@/constants/icons';

interface ProcessNavTabProps {
  label: string;
  processId: string;
  isSelected?: boolean;
  disable?: boolean;
}

//Todo:remove the disable prop

const ProcessNavTab = ({ label, processId, isSelected, disable = false }: ProcessNavTabProps) => {
  const router = useRouter();

  return (
    <div
      className={cn(
        'flex items-center gap-3 text-GRAY_900 px-2 py-2 f-13-500 hover:bg-GRAY_20 rounded-md cursor-pointer select-none',
        isSelected ? 'bg-GRAY_100 text-GRAY_1000' : '',
        disable ? 'opacity-50 cursor-not-allowed' : '',
      )}
      onClick={() => {
        if (!disable) {
          router.push(getActivityRouteByProcessId(processId));
        }
      }}
    >
      <SvgSpriteLoader
        iconCategory={ICON_SPRITE_TYPES.GENERAL}
        id='activity'
        height={16}
        width={16}
        className='w-[14px] align-middle cursor-pointer'
      />
      <div>{label}</div>
    </div>
  );
};

export default ProcessNavTab;
