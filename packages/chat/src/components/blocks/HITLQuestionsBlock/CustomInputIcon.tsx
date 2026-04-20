'use client';

import { cn } from '@zamp-platform/ui/utils';
import { Check, Loader2, PenLine } from 'lucide-react';

interface CustomInputIconProps {
  isSelected: boolean;
  isMultiSelect: boolean;
  isSubmitting?: boolean;
}

export const CustomInputIcon = ({ isSelected, isMultiSelect, isSubmitting }: CustomInputIconProps) => {
  if (isSelected && isSubmitting) return <Loader2 className='text-BG_WHITE animate-spin' size={12} />;
  if (isMultiSelect && isSelected) return <Check className='text-BG_WHITE' size={12} strokeWidth={2} />;
  return <PenLine className={cn(isSelected ? 'text-BG_WHITE' : 'text-GRAY_950')} size={12} strokeWidth={1} />;
};
