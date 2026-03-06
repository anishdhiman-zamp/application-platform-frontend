'use client';

import { useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Check, ChevronDown } from 'lucide-react';
import { SettingsRow } from 'modules/general/components/SettingsRow';
import { PREFERENCES_ROWS, THEME_MODE, THEME_OPTIONS } from 'modules/general/constants/general.constants';
import { useTheme } from '@/app/_providers/theme-provider';

const Preferences = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const currentLabel = THEME_OPTIONS.find((themeOption) => themeOption.value === theme)?.label ?? THEME_MODE.LIGHT;

  const themeDropdown = (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='small'
          className='flex items-center gap-1.5'
          style={{ outline: 'none', boxShadow: 'none' }}
        >
          {currentLabel}
          <ChevronDown
            className={cn(
              'text-GRAY_700 h-3.5 w-3.5 transition-transform duration-200',
              open ? 'rotate-180' : 'rotate-0',
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='bg-BG_WHITE'>
        {THEME_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            className='f-12-450 hover:bg-BG_GRAY_2 flex cursor-pointer items-center justify-between gap-4 rounded-sm'
          >
            {option.label}
            {theme === option.value && <Check className='text-GRAY_700 h-3.5 w-3.5' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className='flex flex-col'>
      <h1 className='f-20-600 text-GRAY_1000 pt-6 pb-4'>Preferences</h1>

      <div className='border-GRAY_200 rounded-2xl border'>
        <SettingsRow label={PREFERENCES_ROWS[0].label} value={currentLabel} actionNode={themeDropdown} />
        <SettingsRow
          label={PREFERENCES_ROWS[1].label}
          value={PREFERENCES_ROWS[1].value}
          className='border-none'
          action={{ text: 'Change' }}
        />
      </div>
    </div>
  );
};

export default Preferences;
