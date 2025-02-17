import { FC } from 'react';
import { cn } from 'utils/common';

interface BreadCrumbProps {
  breadcrumbStack: string[];
}

const BreadCrumb: FC<BreadCrumbProps> = ({ breadcrumbStack = [] }) => {
  return (
    <div className='flex items-center gap-2'>
      {breadcrumbStack?.map((item, index) => (
        <div
          key={item}
          className={cn(
            `f-13-500 text-GRAY_1000`,
            index == breadcrumbStack?.length - 1 ? 'f-13-500 text-GRAY_1000' : 'f-13-400 text-GRAY_700',
          )}
        >
          {`${item}${index < breadcrumbStack?.length - 1 ? ' / ' : ''}`}
        </div>
      ))}
    </div>
  );
};

export default BreadCrumb;
