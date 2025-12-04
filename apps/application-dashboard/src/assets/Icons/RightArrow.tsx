import { type FC } from 'react';
import type { LucideProps } from 'lucide-react';

const RightArrow: FC<LucideProps> = ({ ...props }) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='11' height='8' viewBox='0 0 11 8' fill='none' {...props}>
      <path
        d='M0.5 4H9.83333M9.83333 4L6.33333 0.5M9.83333 4L6.33333 7.5'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};

export default RightArrow;
