import { FC, useRef, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Tag,
} from '@zamp-platform/ui';
import { DUMMY_APPROVERS as dummyApprovers } from 'modules/policies/constants';
import { ApproverDetail } from 'modules/policies/types';
import { KEY_CODES } from '@/components/multiSelectInput/multiSelectInput.types';

type ApproverListProps = {
  selectedApprovers: ApproverDetail[];
  onChange: (approvers: ApproverDetail[]) => void;
};

const ApproverList: FC<ApproverListProps> = ({ selectedApprovers, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter approvers based on input value
  const filteredApprovers = dummyApprovers.filter((approver) =>
    approver.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  // Remove last tag if input is empty and backspace is pressed
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEY_CODES.BACKSPACE && inputValue.length === 0 && selectedApprovers.length > 0) {
      onChange(selectedApprovers.slice(0, -1));
    }
  };

  // Add approver to selected list
  const handleSelect = (checked: boolean, approver: ApproverDetail) => {
    if (checked) {
      onChange([...selectedApprovers, approver]);
    } else {
      onChange(selectedApprovers.filter((a) => a.id !== approver.id));
    }
    setInputValue('');
    // Keep focus on input after selection
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='flex flex-wrap gap-2.5 border p-1.5 rounded-md w-full min-h-[40px] items-center cursor-text'>
          {selectedApprovers.map((approver) => (
            <Tag variant='outline' key={approver.id} className='flex items-center gap-1'>
              {approver.label}
            </Tag>
          ))}
          <input
            ref={inputRef}
            className='flex-1 min-w-[80px] border-none outline-none bg-transparent f-14-500'
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='z-[1001] max-h-60 overflow-y-auto' align='start'>
        {filteredApprovers.length === 0 ? (
          <div className='px-2 py-2 text-gray-400'>No approvers found</div>
        ) : (
          filteredApprovers.map((approver) => (
            <DropdownMenuCheckboxItem
              key={approver.id}
              checked={selectedApprovers.includes(approver)}
              onCheckedChange={(checked) => handleSelect(checked, approver)}
            >
              <Tag variant='outline'>{approver.label}</Tag>
            </DropdownMenuCheckboxItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ApproverList;
