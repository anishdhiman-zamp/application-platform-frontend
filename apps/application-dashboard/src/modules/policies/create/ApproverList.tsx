import { FC, Fragment, useEffect, useRef, useState } from 'react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@zamp-platform/ui';
import { formatAudienceMembers } from 'modules/policies/create/constants';
import { ApproverDetail, ApproverListOption } from 'modules/policies/types';
import { KEY_CODES } from '@/components/multiSelectInput/multiSelectInput.types';
import useAudienceMembers from '@/hooks/useAudienceMembers';
import { ResourceType } from '@/modules/shareResource/shareResource.types';

type ApproverListProps = {
  selectedApprovers: ApproverDetail[];
  onChange: (approvers: ApproverDetail[]) => void;
};

const ApproverList: FC<ApproverListProps> = ({ selectedApprovers, onChange }) => {
  const { data, loading } = useAudienceMembers({
    resourceType: ResourceType.PAYMENTS,
    resourceId: '',
  });

  const [currentOptions, setCurrentOptions] = useState<ApproverListOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<ApproverListOption[]>([]);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Remove last tag if input is empty and backspace is pressed
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEY_CODES.BACKSPACE && inputValue.length === 0 && selectedApprovers.length > 0) {
      onChange(selectedApprovers.slice(0, -1));
    }
  };

  // Add approver to selected list
  const handleSelect = (checked: boolean, approver: ApproverListOption) => {
    if (checked) {
      onChange([...selectedApprovers, { type: approver.value.type, id: approver.value.id }]);
    } else {
      onChange(selectedApprovers.filter((a) => a.id !== approver.value.id));
    }
    setInputValue('');
    setFilteredOptions(currentOptions);

    // Keep focus on input after selection
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setInputValue(value);
    setFilteredOptions(currentOptions.filter((approver) => approver.label.toLowerCase().includes(value.toLowerCase())));
  };

  useEffect(() => {
    if (!loading && data) {
      const options = formatAudienceMembers(data);

      setCurrentOptions(options);
      setFilteredOptions(options);
    }
  }, [data, loading]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='flex flex-wrap gap-2.5 border p-1.5 rounded-md w-full min-h-[40px] items-center cursor-text'>
          {selectedApprovers.map((approver, idx) => (
            <Fragment key={idx}>{currentOptions.find((o) => o.value.id === approver.id)?.richLabel}</Fragment>
          ))}
          <input
            ref={inputRef}
            className='flex-1 min-w-[80px] border-none outline-none bg-transparent f-14-500'
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='z-[1001] max-h-60 overflow-y-auto' align='start'>
        {filteredOptions.length === 0 ? (
          <div className='px-2 py-2 text-gray-400'>No approvers found</div>
        ) : (
          filteredOptions.map((approver) => (
            <DropdownMenuCheckboxItem
              key={approver.id}
              checked={selectedApprovers.some((a) => a.id === approver.id)}
              onCheckedChange={(checked) => handleSelect(checked, approver)}
            >
              {approver.richLabel || approver.label}
            </DropdownMenuCheckboxItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ApproverList;
