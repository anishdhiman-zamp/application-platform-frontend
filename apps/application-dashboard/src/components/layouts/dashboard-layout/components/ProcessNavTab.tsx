'use client';

import { startTransition, useOptimistic, useState } from 'react';
import { Button, Input, Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { getNextNavigationTarget } from '@zamp-platform/utils';
import { Activity, Hammer, MoreVertical, Pencil, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn, preventAutoFocus } from 'utils/common';
import type { Process } from '@/app/(authenticated)/resources';
import TooltipV2 from '@/components/common/TooltipV2';
import { getProcessRouteById, ROUTES_PATH } from '@/constants/routeConfig';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { usePagesAndProcesses } from '@/contexts/PagesAndProcessesContext';
import { type ProcessResponseType, ProcessStatus as ProcessStatusEnum } from '@/types/api/processApi.types';
import DeleteProcessDialog from 'components/layouts/dashboard-layout/components/DeleteProcessDialog';

interface ProcessNavTabProps {
  label: string;
  processId: string;
  isSelected?: boolean;
  process?: ProcessResponseType;
  deleteProcess: (processId: string) => void;
  updateProcess: (processId: string, data: Partial<Process>) => void;
  isZampInternalEnabled?: boolean;
}

const ProcessNavTab = ({
  label,
  processId,
  isSelected,
  process,
  deleteProcess,
  updateProcess,
  isZampInternalEnabled,
}: ProcessNavTabProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [processName, setProcessName] = useState<string>();
  const [finalName, setFinalName] = useState<string>();

  const router = useRouter();
  const { processes } = usePagesAndProcesses();

  const [optimisticName, updateOptimisticName] = useOptimistic(finalName || label, (state, newName: string) => newName);

  const handleInputBlur = () => {
    const trimmedName = processName?.trim();

    if (trimmedName === label || !trimmedName) {
      return;
    }

    updateProcess(processId, { process_id: processId, display_name: trimmedName });

    setFinalName(trimmedName);
    startTransition(() => {
      updateOptimisticName(trimmedName);
    });
  };

  const handleMenuOpen = (open: boolean) => {
    setIsMenuOpen(open);
    if (open) {
      setProcessName(optimisticName);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER) {
      e.preventDefault();
      e.stopPropagation();
      handleMenuOpen(false);
      handleInputBlur();
    }
  };

  const handleDeleteSuccess = () => {
    if (!isSelected || !processes) return;

    const currentProcess = processes.find((p) => p?.process_id === processId);

    if (!currentProcess) return;

    const { target, hasRemainingItems } = getNextNavigationTarget({
      items: processes,
      closingItem: currentProcess,
      isEqual: (a, b) => a?.process_id === b?.process_id,
      strategy: 'previous',
    });

    if (hasRemainingItems && target) {
      router.push(getProcessRouteById(target.process_id || ''));
    } else {
      router.push(ROUTES_PATH.PEOPLE);
    }
  };

  const handleDeleteProcess = () => {
    setIsMenuOpen(false);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          'text-GRAY_900 f-13-500 hover:bg-GRAY_20 group flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 select-none',
          isSelected ? 'bg-GRAY_100 text-GRAY_1000' : '',
        )}
        data-testid={`${processId}-process-nav-tab`}
      >
        {process?.status !== ProcessStatusEnum.LIVE ? (
          <Hammer height={14} width={14} className='shrink-0 cursor-pointer' strokeWidth={1.7} />
        ) : (
          <Activity height={14} width={14} className='shrink-0 cursor-pointer' strokeWidth={1.7} />
        )}
        <TooltipV2 tooltipBody={optimisticName} showOnlyWhenTruncated asChildTrigger>
          <div className='flex-1 truncate'>{optimisticName}</div>
        </TooltipV2>
        <Popover open={isMenuOpen} onOpenChange={handleMenuOpen}>
          <PopoverTrigger
            className={cn('cursor-pointer opacity-0 group-hover:opacity-100')}
            data-testid={`${processId}-process-nav-tab-popover-trigger`}
            id='process-nav-tab-popover-trigger'
          >
            {isZampInternalEnabled && (
              <MoreVertical size={14} strokeWidth={1.5} className={isMenuOpen ? 'text-GRAY_800' : 'text-GRAY_500'} />
            )}
          </PopoverTrigger>
          <PopoverContent
            align='end'
            sideOffset={16}
            className='space-y-2'
            onCloseAutoFocus={preventAutoFocus}
            id='process-nav-tab-popover-content'
          >
            <Input
              size='small'
              placeholder='Process name'
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              icon={<Pencil size={16} className='text-GRAY_500' strokeWidth={1.5} />}
              autoFocus
              onBlur={handleInputBlur}
              onKeyDown={handleEditKeyDown}
              data-testid={`${processId}-process-nav-tab-input`}
            />
            <Button
              variant='ghost'
              size='medium'
              className='flex w-full items-center justify-start gap-1.5 text-red-700 hover:text-red-700'
              onClick={handleDeleteProcess}
              data-testid={`${processId}-process-nav-tab-delete-process-btn`}
              id='process-nav-tab-delete-process-button'
            >
              <Trash size={12} strokeWidth={1.5} />
              <span>Delete process</span>
            </Button>
          </PopoverContent>
        </Popover>
      </div>
      <DeleteProcessDialog
        process={process}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={deleteProcess}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </>
  );
};

export default ProcessNavTab;
