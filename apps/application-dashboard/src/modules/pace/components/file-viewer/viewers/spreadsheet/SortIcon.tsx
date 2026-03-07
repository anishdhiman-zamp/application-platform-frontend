import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

interface SortIconProps {
  isSorted: false | 'asc' | 'desc';
}

const SortIcon = ({ isSorted }: SortIconProps) => {
  if (isSorted === 'asc') return <ArrowUp size={14} className='text-GRAY_700' />;
  if (isSorted === 'desc') return <ArrowDown size={14} className='text-GRAY_700' />;

  return <ArrowUpDown size={14} className='text-GRAY_600' />;
};

export default SortIcon;
