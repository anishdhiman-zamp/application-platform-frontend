import React from 'react';
import { getPageRouteById } from 'constants/routeConfig';
import { useRouter } from 'next/router';
import { cn } from 'utils/common';
import { COLORS } from '@/constants/colors';

interface PageNavTabProps {
  label: string;
  pageId: string;
  isSelected?: boolean;
}

const PageNavTab = ({ label, pageId, isSelected }: PageNavTabProps) => {
  const router = useRouter();

  return (
    <div
      className={cn(
        'flex items-center gap-3 text-GRAY_900 px-2 py-2 f-13-500 hover:bg-GRAY_20 rounded-md cursor-pointer select-none',
        isSelected ? 'bg-GRAY_100 text-GRAY_1000' : '',
      )}
      onClick={() => router.push(getPageRouteById(pageId))}
    >
      <svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M10.8685 1.3815C13.4883 4.00127 13.4883 8.24875 10.8685 10.8685C8.35969 13.3773 4.35809 13.4836 1.72283 11.1873C1.60791 11.0871 1.55045 11.037 1.52451 10.9686C1.50268 10.911 1.50024 10.8398 1.51806 10.7808C1.53925 10.7108 1.59666 10.6534 1.71147 10.5385L3.0037 9.24631M10.5 6.12501C10.5 8.54125 8.54125 10.5 6.125 10.5C3.70875 10.5 1.75 8.54125 1.75 6.12501C1.75 3.70876 3.70875 1.75001 6.125 1.75001C8.54125 1.75001 10.5 3.70876 10.5 6.12501Z'
          stroke={isSelected ? COLORS.GRAY_1000 : COLORS.GRAY_900}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>

      <div>{label}</div>
    </div>
  );
};

export default PageNavTab;
