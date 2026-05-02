'use client';

import { memo } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Copy, MoreHorizontal, WrapText } from 'lucide-react';
import type { ViewModeOption } from '@/modules/pace/components/file-viewer/file-viewer.types';
import { FILE_VIEWER_HEADER_ACTIONS } from '@/modules/pace/components/files/files.constants';
import type { defaultFnType } from '@/types/commonTypes';

interface ViewModeMenuSectionProps<T extends string> {
  value: T;
  options: [ViewModeOption<T>, ViewModeOption<T>];
  onChange: (value: T) => void;
}

const ViewModeMenuSection = <T extends string>({ value, options, onChange }: ViewModeMenuSectionProps<T>) => (
  <>
    <DropdownMenuLabel className='f-11-500 text-GRAY_600 px-2 pt-1 pb-0.5'>View as</DropdownMenuLabel>
    <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as T)}>
      {options.map((option) => (
        <DropdownMenuRadioItem
          key={option.value}
          value={option.value}
          className='f-12-500 text-GRAY_900 hover:bg-GRAY_100 cursor-pointer rounded-md'
        >
          {option.icon}
          {option.label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
    <DropdownMenuSeparator />
  </>
);

interface FileViewerHeaderMenuProps {
  onActionClick: (actionId: string) => void;
  onCopyPath: defaultFnType;
  wordWrapEnabled: boolean;
  onToggleWordWrap: (enabled: boolean) => void;
  disabled?: boolean;
  viewModeSection?: React.ReactNode;
}

const FileViewerHeaderMenu = memo(
  ({
    onActionClick,
    onCopyPath,
    wordWrapEnabled,
    onToggleWordWrap,
    disabled = false,
    viewModeSection,
  }: FileViewerHeaderMenuProps) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <Button variant='ghost' size='icon' className='h-6 w-6 shrink-0' disabled={disabled}>
            <MoreHorizontal size={16} className='text-GRAY_700' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='bg-BG_WHITE flex min-w-[180px] flex-col gap-y-[2px]'
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {viewModeSection}
          <DropdownMenuItem
            onClick={onCopyPath}
            className='f-12-500 text-GRAY_900 hover:bg-GRAY_100 cursor-pointer rounded-md'
          >
            <Copy className='size-4' />
            Copy path
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem
            checked={wordWrapEnabled}
            onCheckedChange={onToggleWordWrap}
            className='f-12-500 text-GRAY_900 hover:bg-GRAY_100 cursor-pointer rounded-md'
          >
            <WrapText className='size-4' />
            Enable word wrap
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {FILE_VIEWER_HEADER_ACTIONS.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => onActionClick(action.id)}
              className={cn(
                'f-12-500 text-GRAY_900 hover:bg-GRAY_100 cursor-pointer rounded-md',
                action.isDestructive && 'text-destructive hover:text-destructive',
              )}
            >
              <action.icon className='size-4' />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

FileViewerHeaderMenu.displayName = 'FileViewerHeaderMenu';

export { ViewModeMenuSection };
export default FileViewerHeaderMenu;
