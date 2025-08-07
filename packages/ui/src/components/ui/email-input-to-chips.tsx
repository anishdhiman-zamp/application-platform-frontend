'use client';
import { X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { Button } from './button';

interface EmailInputToChipsProps {
  value: string[];
  onChange: (emails: string[]) => void; // eslint-disable-line no-unused-vars
  placeholder?: string;
  className?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EmailInputToChips: React.FC<EmailInputToChipsProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addEmail = (email: string) => {
    const trimmed = email.trim();
    if (trimmed && emailRegex.test(trimmed) && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput('');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail(input);
    } else if (e.key === 'Backspace' && input === '') {
      onChange(value.slice(0, -1));
    }
  };

  const handleRemove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div
      className={`f-13-450 flex flex-wrap items-center gap-2 ${className}`}
      onClick={() => inputRef.current?.focus()}
      data-testid='input-to-chips-root'
    >
      {value.map((email, idx) => (
        <span key={email} className='bg-bg-gray-2 flex items-center rounded-lg border border-gray-400 py-1 pr-1 pl-2'>
          {email}
          <Button onClick={() => handleRemove(idx)} variant='ghost' size='icon' className='h-4 w-4 [&_svg]:size-3'>
            <X width={7} height={7} className='text-gray-700' />
          </Button>
        </span>
      ))}
      <input
        ref={inputRef}
        className='min-w-[120px] flex-1 border-none bg-transparent px-2 py-1 outline-none'
        type='text'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        aria-label='Add email'
        data-testid='input-to-chips-input'
      />
    </div>
  );
};

export default EmailInputToChips;
