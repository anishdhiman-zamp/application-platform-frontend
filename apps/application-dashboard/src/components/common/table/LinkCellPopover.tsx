import { FC, RefObject, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@zamp-platform/ui';
import { motion } from 'framer-motion';
import { ArrowUpRight, Link as LinkIcon } from 'lucide-react';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';

const addPopoverListeners = (popoverRef: RefObject<HTMLDivElement | null>, onClose: () => void) => {
  const handleClickOutside = (event: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  const handleScroll = () => {
    onClose();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === KEYBOARD_KEYS.ESCAPE) {
      onClose();
    }
  };

  // adding listeners so the current click doesn't immediately close it
  const timeoutId = setTimeout(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    document.addEventListener('keydown', handleKeyDown);
  }, 0);

  return () => {
    clearTimeout(timeoutId);
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('scroll', handleScroll, true);
    document.removeEventListener('keydown', handleKeyDown);
  };
};

const adjustPopoverPosition = (popoverEl: HTMLDivElement, cellRect: DOMRect, gridRect: DOMRect) => {
  const popoverWidth = popoverEl.offsetWidth;
  const EDGE_PADDING = 8;
  const cellCenterX = cellRect.left + cellRect.width / 2;

  // Start centered, then clamp within grid container bounds
  let left = cellCenterX - popoverWidth / 2;

  // Clamp to right edge of grid
  if (left + popoverWidth > gridRect.right - EDGE_PADDING) {
    left = gridRect.right - popoverWidth - EDGE_PADDING;
  }

  // Clamp to left edge of grid
  if (left < gridRect.left + EDGE_PADDING) {
    left = gridRect.left + EDGE_PADDING;
  }

  popoverEl.style.left = `${left}px`;
};

interface LinkCellPopoverProps {
  url: string;
  cellRect: DOMRect;
  gridRect: DOMRect;
  onClose: () => void;
}

const LinkCellPopover: FC<LinkCellPopoverProps> = ({ url, cellRect, gridRect, onClose }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return addPopoverListeners(popoverRef, onClose);
  }, [onClose]);

  const navigableUrl = url.toLowerCase().startsWith('www.') ? `https://${url}` : url;

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(navigableUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  // Position the popover below the cell, clamped within the grid container
  const top = cellRect.bottom + 4;

  useLayoutEffect(() => {
    if (popoverRef.current) {
      adjustPopoverPosition(popoverRef.current, cellRect, gridRect);
    }
  }, [cellRect]);

  return createPortal(
    <motion.div
      ref={popoverRef}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className='group border-GRAY_400 hover:bg-BG_GRAY_2 fixed z-[1300] flex h-8 max-w-[240px] items-center gap-2 rounded-md border bg-white px-2.5 py-2'
      style={{ top }}
    >
      <LinkIcon size={14} className='text-BLUE_700 shrink-0' />
      <Button
        variant='link'
        size='small'
        onClick={handleLinkClick}
        className='f-13-500 text-BLUE_700 min-w-0 cursor-pointer !justify-start truncate px-0 text-left no-underline transition-colors group-hover:underline'
        title={url}
      >
        {url}
      </Button>
      <Button
        variant='link'
        size='small'
        onClick={handleLinkClick}
        className='text-BLUE_700 shrink-0 cursor-pointer p-0 transition-colors'
        title='Open in new tab'
      >
        <ArrowUpRight size={14} />
      </Button>
    </motion.div>,
    document.body,
  );
};

export default LinkCellPopover;
