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
    <div className='mr-2.5 flex flex-1 items-center justify-between'>
      <div>{labelProps.title}</div>
      {showCountOfSelected && <SelectedCountTooltip value={value} tooltipBodyClassName={tooltipBodyClassName} />}
    </div>
  );
};

export default ValueContainerContent;
