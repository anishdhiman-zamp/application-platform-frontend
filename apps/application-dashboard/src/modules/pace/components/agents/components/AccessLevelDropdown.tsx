'use client';

import AccessLevelOption from 'modules/pace/components/agents/components/AccessLevelOption';
import { ACCESS_LEVEL_OPTIONS } from 'modules/pace/components/agents/constants/agents.constants';
import { ACCESS_LEVEL, type AccessLevelType } from 'modules/pace/components/agents/types/agents.types';

interface AccessLevelDropdownPropsType {
  value: AccessLevelType;
  onChange: (value: AccessLevelType) => void;
}

const AccessLevelDropdown = ({ value, onChange }: AccessLevelDropdownPropsType) => {
  const handleSelect = (accessLevel: AccessLevelType) => {
    if (accessLevel === ACCESS_LEVEL.CUSTOM) return;
    onChange(accessLevel);
  };

  return (
    <div
      className='border-GRAY_400 flex items-center gap-0.5 rounded-md border p-0.5'
      onClick={(e) => e.stopPropagation()}
    >
      {ACCESS_LEVEL_OPTIONS.map((option) => (
        <AccessLevelOption
          key={option.value}
          option={option}
          isSelected={option.value === value}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
};

export default AccessLevelDropdown;
