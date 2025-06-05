import React, { FC, RefObject } from 'react';
import { defaultFnType } from 'types/commonTypes';
import { cn } from 'utils/common';

interface ClearFiltersConfirmationPopupProps {
  className?: string;
  onClick: defaultFnType;
  onCancel: defaultFnType;
  containerRef: RefObject<HTMLDivElement | null>;
}

const ClearFiltersConfirmationPopup: FC<ClearFiltersConfirmationPopupProps> = ({
  className = '',
  onClick,
  onCancel,
  containerRef,
}) => {
  return (
    <div
      ref={containerRef}
      className={cn('border-0.5 border-GRAY_400 top-full z-30 mt-1 rounded-md bg-white p-4', className)}
    >
      <div className='mb-3'>Remove all filters?</div>

      <div className='flex'>
        <button
          className='hover:border-DIVIDER_SAIL_4 border-DIVIDER_SAIL_2 mr-3 min-w-17.5 rounded-lg border p-1.5 outline-hidden'
          onClick={onClick}
          data-testid='clear-filters-confirmation-popup-yes'
        >
          Yes
        </button>
        <button
          className='hover:border-DIVIDER_SAIL_4 border-DIVIDER_SAIL_2 min-w-17.5 rounded-lg border p-1.5 outline-hidden'
          onClick={onCancel}
        >
          No
        </button>
      </div>
    </div>
  );
};

export default ClearFiltersConfirmationPopup;
