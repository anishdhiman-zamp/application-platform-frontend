import React, { FC } from 'react';
import { ValueContainerContentProps } from 'types/common/components/dropdown/dropdown.types';
import SelectedCountTooltip from 'components/common/dropdown/SelectedCountTooltip';

const ValueContainerContent: FC<ValueContainerContentProps> = ({
  labelProps = {},
  value,
  showCountOfSelected,
  tooltipBodyClassName,
}) => {
  return (
    <div className='tw-flex tw-justify-between tw-items-center tw-flex-1 tw-mr-2.5'>
      <div>{labelProps.title}</div>
      {showCountOfSelected && <SelectedCountTooltip value={value} tooltipBodyClassName={tooltipBodyClassName} />}
    </div>
  );
};

export default ValueContainerContent;
