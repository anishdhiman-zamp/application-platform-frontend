import { type FC, useState } from 'react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@zamp-platform/ui';
import type { ApproverListOption } from '@/modules/policies/types';
import type { MapAny } from '@/types/commonTypes';
import { getFirstLetters } from '@/utils/common';

type ApprovalDropdownProps = {
  selectedApprovers: ApproverListOption[];
  onChange: (approvers: ApproverListOption[]) => void;
  approversList: ApproverListOption[];
};

const ApprovalDropdown: FC<ApprovalDropdownProps> = ({ selectedApprovers, onChange, approversList }) => {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const isChecked = (option: MapAny, selectedOptions: MapAny[]) => {
    return selectedOptions?.some((selectedOption) => selectedOption?.id === option?.id);
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <div className='relative'>
          {selectedApprovers?.length > 0 ? (
            <div className='flex items-center gap-1'>
              <div className='w-4 h-4 bg-GRAY_1000 flex justify-center items-center f-8-500 rounded-full text-white'>
                {getFirstLetters(selectedApprovers[0]?.label as string, 1).toLocaleUpperCase()}
              </div>
              <div className=' text-GRAY_1000 grow f-12-450'>{`${selectedApprovers?.[0]?.label}  ${
                selectedApprovers?.length > 1 ? `+${selectedApprovers?.length - 1}` : ''
              }`}</div>
            </div>
          ) : (
            <div className='text-GRAY_600 f-12-450 cursor-pointer whitespace-nowrap'>Select approver</div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='z-[1001] max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden'
        sideOffset={6}
        align='start'
        side='bottom'
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        {approversList?.map((audience, index) => (
          <DropdownMenuCheckboxItem
            key={audience.id ?? index}
            checked={isChecked(audience, selectedApprovers)}
            onCheckedChange={(checked) => {
              if (checked) {
                onChange([...selectedApprovers, audience]);
              } else {
                onChange(selectedApprovers.filter((selectedOption) => selectedOption.id !== audience.id));
              }
            }}
          >
            {audience.richLabel || audience.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ApprovalDropdown;
