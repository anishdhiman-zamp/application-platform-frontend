'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { formatRelativeTime } from '@/modules/pace/components/files/file-tree.utils';
import { SAVE_STATUS, type SaveStatus } from '@/modules/pace/components/files/files.constants';

interface FileSaveStatusProps {
  isSaving: boolean;
  lastSavedAt: number | null;
}

const FileSaveStatus = memo(({ isSaving, lastSavedAt }: FileSaveStatusProps) => {
  const prevIsSavingRef = useRef(isSaving);
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [status, setStatus] = useState<SaveStatus>(SAVE_STATUS.IDLE);
  const [relativeTime, setRelativeTime] = useState<string | null>(null);

  useEffect(() => {
    if (isSaving && !prevIsSavingRef.current) {
      setStatus(SAVE_STATUS.SAVING);
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
        savedTimeoutRef.current = null;
      }
    }

    if (!isSaving && prevIsSavingRef.current) {
      setStatus(SAVE_STATUS.SAVED);
      savedTimeoutRef.current = setTimeout(() => {
        setStatus(SAVE_STATUS.IDLE);
      }, 2000);
    }

    prevIsSavingRef.current = isSaving;

    return () => {
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, [isSaving]);

  useEffect(() => {
    if (lastSavedAt && status === SAVE_STATUS.IDLE) {
      setRelativeTime(formatRelativeTime(lastSavedAt, true));

      const interval = setInterval(() => {
        setRelativeTime(formatRelativeTime(lastSavedAt, true));
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [lastSavedAt, status]);

  if (status === SAVE_STATUS.SAVING) {
    return (
      <div className='text-GRAY_700 f-12-400 flex items-center gap-x-1.5'>
        <Loader2 size={12} className='animate-spin' />
        <span>Saving...</span>
      </div>
    );
  }

  if (status === SAVE_STATUS.SAVED) {
    return (
      <div className='text-GRAY_700 f-12-400 flex items-center gap-x-1.5'>
        <Check size={12} className='text-green-600' />
        <span>Saved</span>
      </div>
    );
  }

  if (lastSavedAt && relativeTime) {
    return (
      <div className='text-GRAY_700 f-12-400'>
        <span>Edited {relativeTime}</span>
      </div>
    );
  }

  return null;
});

FileSaveStatus.displayName = 'FileSaveStatus';

export default FileSaveStatus;
