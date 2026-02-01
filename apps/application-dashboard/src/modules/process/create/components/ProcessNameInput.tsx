import { FC, useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/common';

type ProcessNameInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onEnter?: () => void;
};

const ProcessNameInput: FC<ProcessNameInputProps> = ({ value, onChange, onEnter }) => {
  const [isEditing, setIsEditing] = useState(!value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    if (value.trim()) {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnter && value.trim()) {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <div className='mt-5 mb-10 w-full space-y-2'>
      <input
        ref={inputRef}
        type='text'
        className={cn(
          'f-26-550 text-GRAY_1000 placeholder:text-GRAY_1000/30 w-full border-none bg-transparent shadow-none outline-none focus:border-none focus:shadow-none',
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder='Name your process'
      />
    </div>
  );
};

export default ProcessNameInput;
