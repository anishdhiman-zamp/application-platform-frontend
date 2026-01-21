'use client';

import { DragEvent, useCallback, useRef, useState } from 'react';
import { Button, Dialog, DialogBody, DialogContent, DialogHeader, toast } from '@zamp-platform/ui';
import { FileText, FolderUp } from 'lucide-react';
import { useUpdateSkillMutation, useUploadSkillMutation } from '@/apis/pace';
import { cn } from '@/utils/common';

interface UploadSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId?: string; // If provided, modal is in update mode
}

const ACCEPTED_FILE_TYPES = ['.zip', '.skill'];

const UploadSkillModal = ({ isOpen, onClose, skillId }: UploadSkillModalProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUpdateMode = !!skillId;

  const [uploadSkill, { isLoading: isUploading, isError: isUploadError, reset: resetUpload }] =
    useUploadSkillMutation();
  const [updateSkill, { isLoading: isUpdating, isError: isUpdateError, reset: resetUpdate }] = useUpdateSkillMutation();

  const isLoading = isUploading || isUpdating;

  const validateFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const isValidType = ACCEPTED_FILE_TYPES.some((ext) => fileName.endsWith(ext));

    if (!isValidType) {
      toast.error(`Invalid file type. Please upload a ${ACCEPTED_FILE_TYPES.join(' or ')} file.`);

      return false;
    }

    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer?.files?.[0];

      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      handleFile(file);
    }

    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    try {
      if (isUpdateMode && skillId) {
        await updateSkill({ skillId, file: selectedFile }).unwrap();
        toast.success('Skill updated successfully');
      } else {
        await uploadSkill({ file: selectedFile }).unwrap();
        toast.success('Skill uploaded successfully');
      }
      handleClose();
    } catch (error) {
      toast.error(
        (error as any)?.data?.message || `Failed to ${isUpdateMode ? 'update' : 'upload'} skill. Please try again.`,
      );
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setIsDragOver(false);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent size='small' className='w-[480px]' showCloseButton onClick={(e) => e.stopPropagation()}>
        <DialogHeader className='f-16-600 text-GRAY_950'>{isUpdateMode ? 'Update skill' : 'Upload skill'}</DialogHeader>
        <DialogBody>
          <div className='px-5 pt-4 pb-5'>
            {/* Drop Zone */}
            <div
              className={cn(
                'border-GRAY_400 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed transition-colors',
                isDragOver && 'border-GRAY_600 bg-GRAY_50',
                selectedFile && 'border-GREEN_500 bg-GREEN_50',
                (isUploadError || isUpdateError) && 'border-RED_500 bg-RED_50',
              )}
              onClick={handleClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              role='button'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleClick();
                }
              }}
            >
              {selectedFile ? (
                <div className='flex flex-col items-center gap-2'>
                  <FileText
                    size={24}
                    className={cn(isUploadError || isUpdateError ? 'text-RED_600' : 'text-GREEN_600')}
                  />
                  <span className='f-14-500 text-GRAY_900'>{selectedFile.name}</span>
                  <Button
                    variant='link'
                    size='xsmall'
                    className='text-GRAY_600 hover:text-GRAY_900'
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      resetUpload();
                      resetUpdate();
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className='flex flex-col items-center gap-2'>
                  <div className='border-GRAY_400 rounded-md border p-2'>
                    <FolderUp size={16} className='text-GRAY_600' />
                  </div>
                  <span className='f-14-400 text-GRAY_700'>Drag and drop or click to upload</span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type='file'
              accept={ACCEPTED_FILE_TYPES.join(',')}
              onChange={handleFileInputChange}
              className='hidden'
            />

            {/* File Requirements */}
            <div className='mt-4'>
              <p className='f-13-500 text-GRAY_900 mb-2'>File requirements</p>
              <ul className='f-13-400 text-GRAY_700 list-disc space-y-1 pl-5'>
                <li>.zip or .skill file that includes a SKILL.md file at the root level</li>
                <li>SKILL.md contains a skill name and description formatted in YAML</li>
              </ul>
            </div>

            {/* Submit Button */}
            {selectedFile && (
              <div className='mt-5 flex justify-end'>
                <Button size='small' onClick={handleSubmit} isLoading={isLoading} disabled={isLoading}>
                  {isUpdateMode ? 'Update' : 'Upload'}
                </Button>
              </div>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default UploadSkillModal;
