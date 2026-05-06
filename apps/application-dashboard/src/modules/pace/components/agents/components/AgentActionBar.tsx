'use client';

import { Button, SearchInput } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { AGENT_TAB_CONFIG } from 'modules/pace/components/agents/constants/agents.constants';
import { type AgentListingTabType } from 'modules/pace/components/agents/types/agents.types';

interface AgentActionBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeTab: AgentListingTabType;
  onTabChange: (tab: AgentListingTabType) => void;
}

const AgentActionBar = ({ searchTerm, onSearchChange, activeTab, onTabChange }: AgentActionBarProps) => {
  return (
    <div className='flex flex-col gap-3 pb-2'>
      <div className='flex h-8 w-full items-center gap-1'>
        <SearchInput
          placeholder='Search'
          value={searchTerm}
          onChange={onSearchChange}
          allowClear={false}
          size='small'
          showSearchIcon
          wrapperClassName='w-full min-w-0'
          className='bg-BG_WHITE h-7'
          aria-label='Search agents'
          testId='agent-listing-search-input'
        />
      </div>
      <div className='flex items-center gap-1.5'>
        {AGENT_TAB_CONFIG.map((tab) => (
          <Button
            key={tab.id}
            variant='ghost'
            size='small'
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'f-12-500 h-7 cursor-pointer rounded-md px-2.5 py-1.5',
              activeTab === tab.id
                ? 'bg-GRAY_100 text-GRAY_1000'
                : 'bg-BG_WHITE text-GRAY_900 hover:bg-GRAY_100 hover:text-GRAY_1000',
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AgentActionBar;
