import React, { FC, memo } from 'react';
import { MapAny } from 'types/commonTypes';

const AgGridTooltipComponent: FC<MapAny> = ({ value }) => {
  return <div className='text-TEXT_WHITE f-12-300 bg-black p-2'>{value}</div>;
};

export default memo(AgGridTooltipComponent);
