import React, { useState } from 'react';
import { ICON_SPRITE_TYPES, ZAMP_ICON } from 'constants/icons';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFnType } from 'types/commonTypes';
import { cn } from 'utils/common';
import Input from 'components/common/input';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

interface TopbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: defaultFnType;
}

const Topbar = ({ isSidebarOpen, onSidebarToggle }: TopbarProps) => {
  const [search, setSearch] = useState('');
  const router = useRouter();

  //    <div className={cn('relative transition-all duration-300', isSidebarOpen ? 'w-60' : 'w-0')}>

  return (
    <div className='h-12 flex items-center justify-between'>
      <div
        className={cn(
          'py-4 h-12 flex gap-0 items-center justify-between text-GRAY_700 transition-all duration-300',
          isSidebarOpen ? 'w-[240px]' : 'w-[48px]',
        )}
      >
        <div
          className={cn(
            'flex-1 transition-all duration-300 pl-4',
            isSidebarOpen ? 'w-[188px] opacity-100' : 'w-0 opacity-0',
          )}
        >
          <Image
            width={20}
            height={16}
            alt='zamp logo'
            className='w-5 align-middle cursor-pointer'
            src={ZAMP_ICON}
            priority={true}
          />
        </div>
        <div className={cn('border-r', isSidebarOpen ? 'border-white' : ' border-GRAY_400')}>
          <SvgSpriteLoader
            className='cursor-pointer pr-4'
            onClick={onSidebarToggle}
            iconCategory={ICON_SPRITE_TYPES.LAYOUT}
            id='flex-align-right'
          />
        </div>
      </div>
      <div className='flex items-center gap-2 w-full pl-4'>
        <SvgSpriteLoader
          id='arrow-left'
          iconCategory={ICON_SPRITE_TYPES.ARROWS}
          height={16}
          width={16}
          onClick={router.back}
          className='cursor-pointer'
        />
      </div>
      <Input
        placeholder='Search'
        value={search}
        size={SIZE_TYPES.SMALL}
        className='hidden'
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      {/* <div className='flex items-center gap-2 f-13-500'>
        Share
        <SvgSpriteLoader id='dots-vertical' iconCategory={ICON_SPRITE_TYPES.GENERAL} height={16} width={16} />
      </div> */}
    </div>
  );
};

export default Topbar;
