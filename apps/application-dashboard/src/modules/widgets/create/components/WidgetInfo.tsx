import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { WIDGET_INFO_TEXT } from 'modules/widgets/create/constants';

const WidgetInfo = () => {
  return (
    <div className='f-14-400 flex items-center gap-2.5 text-gray-700' data-testid='widget-info'>
      <SvgSpriteLoader id='info-circle' size={16} />
      {WIDGET_INFO_TEXT}
    </div>
  );
};

export default WidgetInfo;
