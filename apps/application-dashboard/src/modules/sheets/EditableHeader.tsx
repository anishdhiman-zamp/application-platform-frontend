import { useEffect, useRef, useState } from 'react';
import { Button, TooltipV2 } from '@zamp-platform/ui';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { SIDE_OPTIONS } from '@/types/commonTypes';

interface EditableHeaderProps {
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  id: string;
}

const EditableHeader = ({
  initialValue = 'Untitled',
  placeholder = 'Enter title...',
  onChange,
  className = '',
  id = '',
}: EditableHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      const length = inputRef.current.value.length;

      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const onChangeWrapper = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setValue(initialValue);

      return;
    }
    onChange?.(trimmedValue);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChangeWrapper?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER) {
      setIsEditing(false);
      onChangeWrapper?.(value);
    }
    if (e.key === KEYBOARD_KEYS.ESCAPE) {
      setIsEditing(false);
      setValue(initialValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <>
      {isEditing ? (
        <input
          ref={inputRef}
          type='text'
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            width: `${Math.max((value || placeholder).length + 2, 2)}ch`,
          }}
          className={`f-24-450 inline-block rounded-lg border-none px-2.5 py-1 transition-colors duration-200 outline-none ${value ? 'bg-GRAY_50' : 'bg-white'} ${className} `}
        />
      ) : (
        <TooltipV2 tooltipBody='Rename' side={SIDE_OPTIONS.BOTTOM} asChildTrigger>
          <Button
            variant='ghost'
            className='text-GRAY_950 rounded-lg px-2.5 py-1'
            onClick={handleClick}
            data-testid={`${id}-sheet-name-edit-btn`}
          >
            <span className='f-24-450'>{value}</span>
          </Button>
        </TooltipV2>
      )}
    </>
  );
};

export default EditableHeader;
