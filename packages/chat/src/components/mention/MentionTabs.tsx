'use client';

import { cn } from '@zamp-platform/ui/utils';
import { AtSign } from 'lucide-react';
import React from 'react';

import type { ReferenceKindDescriptor } from '../../types/references.types';
import { RECENT_TAB, TAB_BASE } from './constants';
import { getTabStyle } from './utils';

interface MentionTabsProps {
  tabs: ReferenceKindDescriptor[];
  activeTab: string;
  onSelect: (kind: string) => void;
}

export const MentionTabs = ({ tabs, activeTab, onSelect }: MentionTabsProps) => {
  const handleMouseDown = (e: React.MouseEvent, kind: string) => {
    e.preventDefault();
    onSelect(kind);
  };

  return (
    <div className='flex shrink-0 items-center gap-1.5'>
      {tabs.map((tab) => {
        const isActive = tab.kind === activeTab;
        const isRecent = tab.kind === RECENT_TAB;
        return (
          <button
            key={tab.kind}
            type='button'
            onMouseDown={(e) => handleMouseDown(e, tab.kind)}
            className={cn(TAB_BASE, getTabStyle(isRecent, isActive))}
            aria-pressed={isActive}
          >
            {isRecent ? <AtSign className='size-3.5' /> : <span>{tab.display_label}</span>}
          </button>
        );
      })}
    </div>
  );
};
