'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../dropdown-menu';
import { ArrowLeft } from 'lucide-react';
import useDrilldownMenu from './hooks/useDrilldownMenu';
import { DrilldownStateOutput } from './hooks/useDrilldownState';
import { preventAutoFocus, cn } from '@zamp-platform/ui/utils';
import Image from 'next/image';

export type RenderCtx<T> = {
  goBack: () => void; // eslint-disable-line no-unused-vars
  state: T | undefined;
  setState: (_v: T) => void; // eslint-disable-line no-unused-vars
};

export type MenuNode = {
  id: string;
  label: string;
  action?: () => void;
  children?: MenuNode[];
  render?: (ctx: RenderCtx<any>) => ReactNode; // eslint-disable-line no-unused-vars
  icon?: ReactNode;
  iconSrc?: string; // Image source path for image-based icons (e.g., integration logos)
  backText?: string;
  description?: string;
  metadata?: Record<string, any>;
  isHoverActionEnabled?: boolean;
  disabled?: boolean;
  rightText?: string; // Text to display on the right side (e.g., "Coming soon")
};

export type DrilldownMenuProps = {
  asChildTrigger?: boolean;
  drilldownState?: DrilldownStateOutput;
  menuNode: MenuNode;
  children: ReactNode;
  handleClick: (item: MenuNode) => void; // eslint-disable-line no-unused-vars
  onPointerEnter: (item: MenuNode) => void; // eslint-disable-line no-unused-vars
};

export const DrilldownMenu = ({
  children,
  menuNode,
  asChildTrigger,
  drilldownState,
  handleClick,
  onPointerEnter,
}: DrilldownMenuProps) => {
  const menu = useDrilldownMenu(menuNode);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) menu.reset();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild={asChildTrigger}>{children}</DropdownMenuTrigger>

      <DropdownMenuContent className='w-64 overflow-hidden' onCloseAutoFocus={preventAutoFocus}>
        {/* Back header */}
        {menu.canGoBack && (
          <div className='flex items-center gap-2 px-2 py-1'>
            <button
              onClick={menu.goBack}
              className='f-12-450 text-GRAY_700 hover:text-GRAY_1000 flex cursor-pointer items-center'
            >
              <ArrowLeft className='mr-1' size={12} /> {menu.backText}
            </button>
          </div>
        )}

        {/* Animated content */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={menu.current.id}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {menu.current.render
              ? menu.current.render({
                  goBack: menu.goBack,
                  state: drilldownState?.getState(menu.current.id),
                  setState: (v) => drilldownState?.setNodeState(menu.current.id, v),
                })
              : menu.current.children?.map((item) => {
                  const isDisabled = item.disabled === true;
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      disabled={isDisabled}
                      onSelect={(e) => {
                        e.preventDefault();
                        if (isDisabled) return;
                        if (item.children) menu.goForward(item);
                        else {
                          handleOpenChange(false);
                          handleClick(item);
                          if (item.action) {
                            item.action();
                          }
                        }
                      }}
                      className={cn(
                        'group flex items-center justify-between gap-2 rounded-md',
                        !isDisabled && 'hover:bg-gray-50',
                        isDisabled && 'cursor-not-allowed',
                      )}
                      onPointerEnter={() => {
                        if (item.isHoverActionEnabled && !isDisabled) onPointerEnter(item);
                      }}
                    >
                      <div className='flex min-w-0 flex-1 flex-col'>
                        <div className='flex items-center gap-2'>
                          {item.iconSrc ? (
                            <div className={cn('relative h-4 w-4 flex-shrink-0', isDisabled && 'opacity-60')}>
                              <Image
                                src={item.iconSrc}
                                alt={item.label}
                                className='object-contain'
                                sizes='16px'
                                priority
                                fill
                              />
                            </div>
                          ) : item.icon ? (
                            <div
                              className={cn(
                                'flex h-4 w-4 items-center justify-center text-gray-700 [&_svg]:size-3',
                                isDisabled && 'opacity-60',
                              )}
                            >
                              {item.icon}
                            </div>
                          ) : null}
                          <div className='flex min-w-0 flex-1 items-center justify-between gap-2'>
                            <span
                              className={cn(
                                'f-13-500',
                                isDisabled ? 'text-gray-700' : 'group-hover:text-gray-1000 text-gray-900',
                              )}
                            >
                              {item.label}
                            </span>
                            {item.rightText && (
                              <span className='f-10-450 whitespace-nowrap text-gray-700'>{item.rightText}</span>
                            )}
                          </div>
                        </div>
                        {item.description && <span className={cn('f-12-400 ml-6')}>{item.description}</span>}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
          </motion.div>
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
