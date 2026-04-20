'use client';

import { useRef } from 'react';
import { TooltipV2 } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import type { AnimatedIconHandle, PaceNavbarItemSchema } from 'modules/pace/pace.types';
import Link from 'next/link';
import { SIDE_OPTIONS } from '@/types/commonTypes';

interface NavbarIconLinkProps {
  item: PaceNavbarItemSchema;
  href: string;
  isActive: boolean;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const NavbarIconLink = ({ item, href, isActive, onClick }: NavbarIconLinkProps) => {
  const iconRef = useRef<AnimatedIconHandle>(null);
  const IconComponent = item.iconComponent;

  return (
    <TooltipV2 tooltipBody={item.label} side={SIDE_OPTIONS.BOTTOM} asChildTrigger>
      <Link
        href={href}
        className={cn(
          'text-GRAY_700 hover:text-GRAY_900 hover:bg-accent flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-lg border-[0.75px] border-transparent p-[7px]',
          isActive &&
            'border-GRAY_500 text-GRAY_900 hover:text-GRAY_900 shadow-tab-shadow bg-BG_WHITE hover:bg-BG_WHITE',
        )}
        role='button'
        tabIndex={0}
        onMouseEnter={() => iconRef.current?.startAnimation()}
        onMouseLeave={() => iconRef.current?.stopAnimation()}
        onClick={onClick}
      >
        <IconComponent ref={iconRef} size={16} className='pointer-events-none' />
      </Link>
    </TooltipV2>
  );
};

export default NavbarIconLink;
