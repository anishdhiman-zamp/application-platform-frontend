import { FC } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { POLICY_APPROVAL_STEP_MODIFIERS } from 'modules/policies/constants';
import { PolicyQuorumOption } from 'modules/policies/types';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';

type PolicyQuorumDropdownProps = {
  modifier: PolicyQuorumOption;
  onChange: (value: PolicyQuorumOption) => void;
};

const PolicyQuorumDropdown: FC<PolicyQuorumDropdownProps> = ({ modifier, onChange }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='px-2.5 py-2 bg-GRAY_100 rounded-md w-fit f-12-500 flex items-center gap-1.5 cursor-pointer text-nowrap'>
          <span>{modifier.label}</span>
          <SvgSpriteLoader id='chevron-down' size={14} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='z-[1001]' align='start'>
        {POLICY_APPROVAL_STEP_MODIFIERS.map((modifier) => (
          <DropdownMenuItem key={modifier.value} onClick={() => onChange(modifier)}>
            {modifier.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PolicyQuorumDropdown;
