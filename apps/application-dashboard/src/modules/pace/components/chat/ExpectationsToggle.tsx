'use client';

import { type FC } from 'react';
import { Toggle } from '@zamp-platform/ui';
import { Infinity as InfinityIcon } from 'lucide-react';

interface ExpectationsToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
}

const ExpectationsToggle: FC<ExpectationsToggleProps> = ({ enabled, onChange, className }) => {
  return (
    <Toggle pressed={enabled} onPressedChange={onChange} aria-label='Toggle expectations' className={className}>
      <InfinityIcon size={12} />
      Expectations
    </Toggle>
  );
};

export default ExpectationsToggle;
