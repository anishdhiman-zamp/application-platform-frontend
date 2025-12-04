import type { FC } from 'react';
import type { LucideProps } from 'lucide-react';

const LeftArrow: FC<LucideProps> = ({ ...props }) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='12' height='9' viewBox='0 0 12 9' fill='none' {...props}>
      <path
        d='M11.1667 4.5L0.5 4.5M0.5 4.5L4.5 0.5M0.5 4.5L4.5 8.5'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};

export default LeftArrow;
