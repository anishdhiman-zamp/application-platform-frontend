import { FC } from 'react';
import { CSS_VARS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { CustomMenuItemProps } from 'ag-grid-react';
import { defaultFnType } from 'types/commonTypes';

interface CustomContextMenuItemProps extends CustomMenuItemProps {
  action: defaultFnType;
}

const CustomContextMenuItem: FC<CustomContextMenuItemProps> = ({ action, menuItemParams, name, closeMenu }) => {
  const handleClick = () => {
    action();
    closeMenu();
  };

  return (
    <div
      className='hover:bg-GRAY_100 group mx-1 flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-2'
      onClick={handleClick}
    >
      <SvgSpriteLoader id={menuItemParams.iconId} color={CSS_VARS.GRAY_900} width={12} height={12} />
      <span className='text-GRAY_900 f-12-500 group-hover:text-GRAY_1000'>{name}</span>
    </div>
  );
};

export default CustomContextMenuItem;
