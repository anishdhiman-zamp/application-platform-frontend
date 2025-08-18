import { RefObject } from 'react';
import { AutoSizeTextarea } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import DisplayField from 'modules/process/artifacts/components/pdf-dataset-artifact/dataset-row/DisplayField';

interface EditableFieldProps {
  onInputChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onDoubleClick: () => void;
  onClick: () => void;
  isEditing: boolean;
  shouldShowInputDirectly: boolean;
  isRequired: boolean;
  isCompleted: boolean;
  isSelected: boolean;
  value: string;
  editingValue: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  editTextareaRef: RefObject<HTMLTextAreaElement | null>;
  isClicked: boolean;
  isPdfDataset?: boolean;
}

const EditableField = ({
  onInputChange,
  onBlur,
  onKeyDown,
  onClick,
  onDoubleClick,
  isEditing,
  shouldShowInputDirectly,
  isRequired,
  isCompleted,
  isSelected,
  value,
  editingValue,
  textareaRef,
  editTextareaRef,
  isClicked,
  isPdfDataset = false,
}: EditableFieldProps) => {
  if (isEditing || shouldShowInputDirectly) {
    return (
      <AutoSizeTextarea
        ref={isEditing ? editTextareaRef : isSelected ? textareaRef : null}
        value={editingValue}
        onChange={(e) => onInputChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={isRequired ? '*Required' : 'Optional'}
        className={cn(
          'f-12-400 border-GRAY_400 focus:border-GRAY_600 focus:ring-GRAY_400 !min-h-6 w-[280px] overflow-hidden !rounded-md border bg-white px-1.5 py-1 shadow-none [scrollbar-width:none] focus:ring-3',
          {
            'border-RED_200 placeholder:text-RED_900': isRequired,
            'bg-ORANGE_100 border-ORANGE_200': isCompleted && value,
          },
        )}
        minRows={1}
        maxHeight={160}
      />
    );
  }

  return (
    <DisplayField
      value={value}
      isCompleted={isCompleted}
      isClicked={isClicked}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      isPdfDataset={isPdfDataset}
    />
  );
};

export default EditableField;
