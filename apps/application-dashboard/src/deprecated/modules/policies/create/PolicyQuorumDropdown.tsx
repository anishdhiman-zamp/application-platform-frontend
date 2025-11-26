import { POLICY_APPROVAL_STEP_MODIFIERS } from '@/deprecated/modules/policies/constants';
import { PolicyQuorum } from '@/deprecated/modules/policies/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { FC } from 'react';

type PolicyQuorumDropdownProps = {
  value: PolicyQuorum;
  onChange: (value: PolicyQuorum) => void;
};

const PolicyQuorumDropdown: FC<PolicyQuorumDropdownProps> = ({ value, onChange }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='bg-GRAY_100 f-12-500 flex w-fit cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-2 text-nowrap'>
          <span>{POLICY_APPROVAL_STEP_MODIFIERS.find((modifier) => modifier.value === value)?.label}</span>
          <SvgSpriteLoader id='chevron-down' size={14} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='z-1001' align='start'>
        {POLICY_APPROVAL_STEP_MODIFIERS.map((modifier) => (
          <DropdownMenuItem key={modifier.value} onClick={() => onChange(modifier.value)}>
            {modifier.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PolicyQuorumDropdown;
