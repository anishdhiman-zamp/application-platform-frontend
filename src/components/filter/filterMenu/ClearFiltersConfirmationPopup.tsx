import React, { FC } from 'react';
import { defaultFnType } from 'types/commonTypes';

interface ClearFiltersConfirmationPopupProps {
  className?: string;
  onClick: defaultFnType;
  onCancel: defaultFnType;
  containerRef: React.RefObject<HTMLDivElement>;
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
      className={`p-4 z-30 bg-white border-DIVIDER_SAIL_2 border ${className} top-[calc(100%+8px)]`}
    >
      <div className='mb-3'>Remove all filters?</div>

      <div className='flex'>
        <button
          className='hover:border-DIVIDER_SAIL_4 border border-DIVIDER_SAIL_2 outline-none rounded-lg p-1.5 min-w-17.5 mr-3'
          onClick={onClick}
          data-testid='clear-filters-confirmation-popup-yes'
        >
          Yes
        </button>
        <button
          className='hover:border-DIVIDER_SAIL_4 border border-DIVIDER_SAIL_2 outline-none rounded-lg p-1.5 min-w-17.5'
          onClick={onCancel}
        >
          No
        </button>
      </div>
    </div>
  );
};

export default ClearFiltersConfirmationPopup;
