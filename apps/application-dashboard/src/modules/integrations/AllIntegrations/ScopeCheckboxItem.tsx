'use client';

import { Checkbox } from '@zamp-platform/ui';
import type { ScopeCheckboxItemPropsType } from '@/modules/integrations/types/integrations.types';

const ScopeCheckboxItem = ({ scope, checked, onToggle }: ScopeCheckboxItemPropsType) => {
  return (
    <label className='flex cursor-pointer items-center gap-2.5 py-1 font-[420]'>
      <Checkbox checked={checked} onCheckedChange={() => onToggle(scope)} />
      <span className='f-12-400 text-GRAY_1000 min-w-0 flex-1 truncate'>{scope}</span>
    </label>
  );
};

export default ScopeCheckboxItem;
