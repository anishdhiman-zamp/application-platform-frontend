'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Switch } from '@zamp-platform/ui';
import { MoreHorizontal } from 'lucide-react';
import { findTimeDifference } from 'modules/data/data.utils';
import type { Skill } from '@/modules/macs/types';

interface SkillCardProps {
  skill: Skill;
  onToggle: (id: string, enabled: boolean) => void;
}

const SkillCard = ({ skill, onToggle }: SkillCardProps) => {
  return (
    <div className='group hover:bg-BG_GRAY_2 px-6 py-4 transition-colors'>
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <h3 className='f-14-550 text-GRAY_1000'>{skill.name}</h3>
          <p className='f-13-400 text-GRAY_700 mt-1 line-clamp-2'>{skill.description}</p>
          <div className='mt-2 flex items-center gap-1.5'>
            <span className='f-12-450 text-GRAY_600'>{skill.addedBy === 'you' ? 'Added by you' : 'Anthropic'}</span>
            {skill.addedBy === 'you' && (
              <>
                <span className='text-GRAY_600'>·</span>
                <span className='f-12-450 text-GRAY_600'>{findTimeDifference(skill.createdAt)}</span>
              </>
            )}
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='text-GRAY_600 hover:bg-GRAY_100 hover:text-GRAY_900 rounded p-1.5 transition-colors'>
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem className='hover:bg-GRAY_100 rounded-md'>Replace</DropdownMenuItem>
              <DropdownMenuItem className='hover:bg-GRAY_100 rounded-md text-red-600'>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Switch checked={skill.enabled} onCheckedChange={(checked) => onToggle(skill.id, checked)} />
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
