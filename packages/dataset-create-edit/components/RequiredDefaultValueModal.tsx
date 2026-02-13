import { Button, Dialog, DialogClose, DialogContent, Input, Radio, RadioGroup } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { AlertTriangle, Info } from 'lucide-react';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { DatasetColumnTypes } from '../constants';
import { getFormatHint, getRadioOptions, isRadioOptionType, validateValueForType } from '../utils/columnValidation';

interface RequiredDefaultValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDismiss: () => void;
  onConfirm: (defaultValue: string) => void;
  columnType: string;
  initialDefaultValue?: string | boolean | null;
}

const RequiredDefaultValueModal: FC<RequiredDefaultValueModalProps> = ({
  isOpen,
  onClose,
  onDismiss,
  onConfirm,
  columnType,
  initialDefaultValue,
}) => {
  const [defaultValue, setDefaultValue] = useState<string>('');
  const radioOptions = useMemo(() => getRadioOptions(columnType), [columnType]);
  // Validate input against column type
  const isValidFormat = useMemo(() => {
    return validateValueForType(defaultValue, columnType);
  }, [defaultValue, columnType]);
  const formatHint = getFormatHint(columnType);
  const isConfirmDisabled = !defaultValue.trim() || !isValidFormat;
  const normalizedColumnType = columnType.toUpperCase();
  const showFormatError =
    ![DatasetColumnTypes.TIMESTAMP, DatasetColumnTypes.BOOLEAN].includes(normalizedColumnType as DatasetColumnTypes) &&
    defaultValue.trim() &&
    !isValidFormat;

  // Initialize default value when modal opens
  const initializeDefaultValue = useCallback(() => {
    // If there's an existing default value, use it
    if (initialDefaultValue !== undefined && initialDefaultValue !== null) {
      // Convert to string (handles boolean, number, and string types)
      setDefaultValue(String(initialDefaultValue));
    } else {
      // For radio types, select the first option by default
      if (isRadioOptionType(columnType)) {
        const options = getRadioOptions(columnType);
        setDefaultValue(options[0]?.value || '');
      } else {
        setDefaultValue('');
      }
    }
  }, [columnType, initialDefaultValue]);

  const handleConfirm = () => {
    if (!defaultValue.trim() || !isValidFormat) return; // Guard against empty or invalid values
    // Blur any focused element before closing to prevent focus ring on the toggle
    (document.activeElement as HTMLElement)?.blur();
    onConfirm(defaultValue.trim());
  };

  const handleDismiss = () => {
    onDismiss();
  };

  // Handle Enter key globally within the dialog to trigger "Mark as required"
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isOpen && !isConfirmDisabled) {
        e.preventDefault();
        e.stopPropagation();
        handleConfirm();
      }
    },
    [isOpen, isConfirmDisabled, handleConfirm],
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown, true);
      return () => window.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [isOpen, handleKeyDown]);

  // Render input based on column type
  const renderInputByType = () => {
    const normalizedType = columnType.toUpperCase();

    switch (normalizedType) {
      case DatasetColumnTypes.TIMESTAMP:
      case DatasetColumnTypes.BOOLEAN:
        // Render radio options for Timestamp and Boolean types
        return (
          <RadioGroup value={defaultValue} onValueChange={setDefaultValue} className='mb-6 flex flex-col gap-3'>
            {radioOptions.map((option) => (
              <label key={option.value} className='flex cursor-pointer items-center gap-2.5'>
                <Radio value={option.value} />
                <span className='f-14-400 text-GRAY_1000'>{option.label}</span>
              </label>
            ))}
          </RadioGroup>
        );

      case DatasetColumnTypes.TEXT:
      case DatasetColumnTypes.INTEGER:
      case DatasetColumnTypes.FLOAT:
      case DatasetColumnTypes.DOUBLE:
      case DatasetColumnTypes.JSON:
      default:
        // Render text input with validation for other types
        return (
          <>
            <Input
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isConfirmDisabled) {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
              placeholder=''
              className={cn('mb-1.5 w-full', showFormatError && 'border-RED_500 focus:border-RED_500')}
              autoFocus
            />

            {/* Data format hint - shows error styling when format is invalid */}
            <div
              className={cn(
                'f-13-400 mb-6 flex items-center gap-1.5',
                showFormatError ? 'text-RED_800' : 'text-GRAY_600',
              )}
            >
              {showFormatError ? <AlertTriangle className='h-3.5 w-3.5' /> : <Info className='h-3.5 w-3.5' />}
              <span>Format: &lt;{formatHint}&gt;</span>
            </div>
          </>
        );
    }
  };

  useEffect(() => {
    if (isOpen) {
      initializeDefaultValue();
    }
  }, [isOpen, initializeDefaultValue]);

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        size='small'
        title='Set a default value'
        description='Set a default value to make this column required'
        className='border-GRAY_400 !z-1300 max-h-fit w-[400px] rounded-[14px] border'
        dialogueOverlayClassName='!z-1300'
      >
        <div className='px-5 pt-5'>
          {/* Close button */}
          <DialogClose className='absolute top-4 right-4 text-gray-500 hover:text-gray-700'>
            <span className='text-xl leading-none'>×</span>
          </DialogClose>

          {/* Title */}
          <h2 className='f-16-600 text-GRAY_1000 mb-1'>Set a default value</h2>

          {/* Description */}
          <p className='f-13-400 text-GRAY_700 mb-4'>To mark column as required, set a default value.</p>

          {/* Input based on column type */}
          {renderInputByType()}
        </div>

        {/* Buttons */}
        <div className='border-GRAY_400 flex justify-end gap-3 border-t px-5 py-4'>
          <Button variant='outline' size='medium' className='px-3.5 py-2' onClick={handleDismiss}>
            Dismiss
          </Button>
          <Button size='medium' className='px-3.5 py-2' onClick={handleConfirm} disabled={isConfirmDisabled}>
            Mark as required
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequiredDefaultValueModal;
