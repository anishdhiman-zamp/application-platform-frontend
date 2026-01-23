'use client';

import { DragEvent, useCallback, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  toast,
} from '@zamp-platform/ui';
import { FolderUp, Loader2 } from 'lucide-react';
import { useUpdateSkillMutation, useUploadSkillMutation } from '@/apis/pace';
import { ACCEPTED_SKILLFILE_TYPES, SKILL_FILE_REQUIREMENTS } from '@/modules/pace/pace.constants';
import { getConflictingSkillName } from '@/modules/pace/pace.utils';
import { cn } from '@/utils/common';

interface UploadSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId?: string;
  getSkillIdByName?: (skillName: string) => string | undefined;
}

const UploadSkillModal = ({ isOpen, onClose, skillId, getSkillIdByName }: UploadSkillModalProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [conflictingSkillName, setConflictingSkillName] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUpdateMode = !!skillId;
  const hasConflict = !!conflictingSkillName && !isUpdateMode;

  const [uploadSkill, { isLoading: isUploading, reset: resetUpload }] = useUploadSkillMutation();
  const [updateSkill, { isLoading: isUpdating, reset: resetUpdate }] = useUpdateSkillMutation();
  const [isReplacing, setIsReplacing] = useState(false);

  const isLoading = isUploading || isUpdating || isReplacing;

  const clearConflict = () => {
    setConflictingSkillName(null);
    setPendingFile(null);
    resetUpload();
    resetUpdate();
  };

  const validateFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const isValidType = ACCEPTED_SKILLFILE_TYPES.some((ext) => fileName.endsWith(ext));

    if (!isValidType) {
      toast.error(`Invalid file type. Please upload a ${ACCEPTED_SKILLFILE_TYPES.join(' or ')} file.`);

      return false;
    }

    return true;
  };

  const handleSubmit = async (file: File) => {
    try {
      if (isUpdateMode && skillId) {
        await updateSkill({ skillId, file }).unwrap();
        toast.success('Skill updated successfully');
      } else {
        await uploadSkill({ file }).unwrap();
        toast.success('Skill uploaded successfully');
      }
      handleClose();
    } catch (error) {
      const conflictName = getConflictingSkillName(error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message;

      if (conflictName && !isUpdateMode) {
        // Conflict error in upload mode - show replace confirmation
        setConflictingSkillName(conflictName);
        setPendingFile(file);
      } else {
        toast.error(errorMessage || `Failed to ${isUpdateMode ? 'update' : 'upload'} skill. Please try again.`);
      }
    }
  };

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        clearConflict();
        handleSubmit(file);
      }
    },
    [isUpdateMode, skillId],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (hasConflict || isLoading) return;

      const file = e.dataTransfer?.files?.[0];

      if (file) {
        handleFile(file);
      }
    },
    [handleFile, hasConflict, isLoading],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!hasConflict && !isLoading) {
        setIsDragOver(true);
      }
    },
    [hasConflict, isLoading],
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    if (!hasConflict && !isLoading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      handleFile(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadAndReplace = async () => {
    if (!conflictingSkillName || !pendingFile || !getSkillIdByName) return;

    const existingSkillId = getSkillIdByName(conflictingSkillName);

    if (!existingSkillId) {
      toast.error('Could not find the existing skill to replace.');

      return;
    }

    setIsReplacing(true);
    try {
      await updateSkill({ skillId: existingSkillId, file: pendingFile }).unwrap();
      toast.success('Skill replaced successfully');
      handleClose();
    } catch (error) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message || 'Failed to replace skill. Please try again.',
      );
    } finally {
      setIsReplacing(false);
    }
  };

  const resetState = () => {
    setIsDragOver(false);
    setConflictingSkillName(null);
    setPendingFile(null);
    setIsReplacing(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetState, 200);
  };

  const getDialogTitle = () => {
    if (hasConflict) {
      return `Replace "${conflictingSkillName}" skill?`;
    }

    return isUpdateMode ? 'Update skill' : 'Upload skill';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        size='small'
        className='w-[450px] gap-y-4 rounded-[14px]'
        showCloseButton
        closeButtonClassName='top-[23px] right-5'
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className='h-fit border-b-0 px-5 pt-5'>
          <DialogHeaderTitle className='f-16-600'>{getDialogTitle()}</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='flex flex-col gap-y-4 px-5'>
          {hasConflict ? (
            <p className='f-14-400 text-GRAY_700 pt-1'>
              There's an existing skill with the same name. Uploading this skill will replace the existing one, which
              can't be restored.
            </p>
          ) : (
            <>
              <div
                className={cn(
                  'flex min-h-[140px] flex-col items-center justify-center rounded-lg border border-dashed transition-all duration-200',
                  'border-GRAY_400',
                  !isLoading && 'hover:border-GRAY_600 hover:bg-GRAY_50 cursor-pointer',
                  isLoading && 'border-GRAY_400 bg-GRAY_50 cursor-not-allowed opacity-70',
                  isDragOver && !isLoading && 'border-PRIMARY_500 bg-PRIMARY_50 scale-[1.01] border-2',
                )}
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                role='button'
                tabIndex={isLoading ? -1 : 0}
                onKeyDown={(e) => {
                  if (!isLoading && (e.key === 'Enter' || e.key === ' ')) {
                    handleClick();
                  }
                }}
              >
                {isLoading ? (
                  <div className='flex flex-col items-center gap-2'>
                    <Loader2 size={24} className='text-GRAY_600 animate-spin' />
                    <span className='f-14-500 text-GRAY_700'>
                      {isUpdateMode ? 'Updating skill...' : 'Uploading skill...'}
                    </span>
                  </div>
                ) : (
                  <div className='flex flex-col items-center gap-2'>
                    <FolderUp size={32} className='text-GRAY_600' strokeWidth={1.5} />
                    <span className='f-14-400 text-GRAY_700'>
                      Drag and drop or click to {isUpdateMode ? 'update' : 'upload'}
                    </span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type='file'
                accept={ACCEPTED_SKILLFILE_TYPES.join(',')}
                onChange={handleFileInputChange}
                className='hidden'
              />

              <div className='mb-5'>
                <p className='f-12-450 text-GRAY_700'>File requirements</p>
                <ul className='f-12-450 text-GRAY_700 mt-1 list-inside list-disc'>
                  {SKILL_FILE_REQUIREMENTS.map((requirement) => (
                    <li key={requirement}>{requirement}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </DialogBody>

        {hasConflict && (
          <DialogFooter className='mt-2 flex justify-end gap-x-2.5 px-5 py-4'>
            <Button variant='secondary' size='small' onClick={clearConflict}>
              Go back
            </Button>
            <Button size='small' onClick={handleUploadAndReplace} isLoading={isLoading} disabled={isLoading}>
              Upload and replace
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UploadSkillModal;
