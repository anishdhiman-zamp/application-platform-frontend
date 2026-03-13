import { Button, CSS_VARS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { defaultFnType } from '@/types/commonTypes';
import { DisplayTypeOptions } from 'components/common/table/CustomHeader/customHeader.constants';

interface MenuPopoverProps {
  handleTypeClose: defaultFnType;
  handleTypeChange: (value: string) => void;
}

const TypeMenuPopover = ({ handleTypeClose, handleTypeChange }: MenuPopoverProps) => (
  <div className='w-60 px-1 py-3'>
    <div className='mb-3.5 flex items-center gap-1.5 px-2'>
      <Button variant='ghost' size='icon' className='h-3.5 w-3.5 p-0 [&_svg]:size-3.5' onClick={handleTypeClose}>
        <SvgSpriteLoader id='arrow-narrow-left' size={14} color={CSS_VARS.GRAY_900} />
      </Button>
      <span className='f-13-500'>Display type</span>
    </div>
    <div>
      {DisplayTypeOptions.map((option) => (
        <Button
          key={option.value}
          variant='ghost'
          size='medium'
          className='w-full justify-between'
          onClick={() => handleTypeChange(option.value)}
        >
          <span className='f-12-500'>{option.label}</span>
        </Button>
      ))}
    </div>
  </div>
);

export default TypeMenuPopover;
