import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Tag,
} from '@zamp-platform/ui';

const approvers = [
  { label: 'Design', value: 'design' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Finance', value: 'finance' },
  { label: 'John', value: 'John' },
  { label: 'Jane', value: 'Jane' },
  { label: 'Jim', value: 'Jim' },
  { label: 'Jill', value: 'Jill' },
];

const ApproverList = () => {
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='flex gap-2.5 border p-1.5 rounded-md w-full'>
          {selectedApprovers.map((approver) => (
            <Tag variant='outline' key={approver}>
              {approver}
            </Tag>
          ))}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='z-[1001]' align='start'>
        {approvers.map((approver) => (
          <DropdownMenuCheckboxItem
            key={approver.value}
            checked={selectedApprovers.includes(approver.value)}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedApprovers([...selectedApprovers, approver.value]);
              } else {
                setSelectedApprovers(selectedApprovers.filter((a) => a !== approver.value));
              }
            }}
          >
            <Tag variant='outline'>{approver.label}</Tag>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ApproverList;
