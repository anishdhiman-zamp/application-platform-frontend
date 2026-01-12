'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Switch,
} from '@zamp-platform/ui';
import { MoreHorizontal, RotateCw, Trash2 } from 'lucide-react';
import { findTimeDifference } from 'modules/data/data.utils';
import type { Skill } from '@/types/api/skills.types';
import { SkillStatus } from '@/types/api/skills.types';

interface SkillCardProps {
  skill: Skill;
  onToggle: (id: string, enabled: boolean) => void;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
}

const SkillCard = ({ skill, onToggle, onUpdate, onDelete }: SkillCardProps) => {
  const isEnabled = skill.status === SkillStatus.ACTIVE;

  return (
    <div className='group hover:bg-BG_GRAY_2 px-6 py-4 transition-colors'>
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <h3 className='f-14-550 text-GRAY_1000'>{skill.name}</h3>
          <p className='f-13-400 text-GRAY_700 mt-1 line-clamp-2'>{skill.description}</p>
          <div className='mt-2 flex items-center gap-1.5'>
            <span className='f-12-450 text-GRAY_600'>{findTimeDifference(skill.updated_at)}</span>
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='text-GRAY_600 hover:text-GRAY_900 h-7 w-7 p-0'>
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                className='hover:bg-GRAY_100 flex items-center gap-2 rounded-md'
                onClick={() => onUpdate(skill.id)}
              >
                <RotateCw size={16} /> Update
              </DropdownMenuItem>
              <DropdownMenuItem
                className='hover:bg-GRAY_100 flex items-center gap-2 rounded-md text-red-600'
                onClick={() => onDelete(skill.id)}
              >
                <Trash2 size={16} /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Switch checked={isEnabled} onCheckedChange={(checked) => onToggle(skill.id, checked)} />
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
