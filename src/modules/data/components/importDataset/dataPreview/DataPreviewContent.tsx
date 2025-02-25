import React, { FC, useState } from 'react';
import {
  DATA_PREVIEW_TABS_TYPES,
  dataPreviewTabItemList,
} from 'modules/data/components/importDataset/importData.constants';
import { DataPreviewContentPropsType } from 'modules/data/components/importDataset/importData.types';
import { MenuItem, TAB_TYPES } from 'types/common/components';
import DatasetTable from 'components/common/table/DatasetTable';
import { Tabs } from 'components/common/tabs/Tabs';

const DataPreviewContent: FC<DataPreviewContentPropsType> = ({ mappedData, rawData }) => {
  const [selectedTab, setSelectedTab] = useState<DATA_PREVIEW_TABS_TYPES>(DATA_PREVIEW_TABS_TYPES.FORMATTED);

  const handleTabSelect = (item?: MenuItem) => {
    setSelectedTab(item?.value as DATA_PREVIEW_TABS_TYPES);
  };

  const renderTable = () => {
    switch (selectedTab) {
      case DATA_PREVIEW_TABS_TYPES.FORMATTED:
        return (
          <DatasetTable
            columns={mappedData?.data_preview?.columns?.map((headerName) => ({ field: headerName })) || []}
            rows={mappedData?.data_preview?.rows?.map((item) => ({ ...item }))}
          />
        );
      case DATA_PREVIEW_TABS_TYPES.ORIGINAL:
        return (
          <DatasetTable
            columns={rawData?.columns?.map((headerName) => ({ field: headerName })) || []}
            rows={rawData?.rows?.map((item) => ({ ...item }))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className='flex flex-col justify-start h-full '>
      <div className='flex flex-col px-6 pt-6 pb-4'>
        <span className='f-16-600'>Preview</span>
        <div className='mt-6'>
          <Tabs
            list={dataPreviewTabItemList}
            id='data-preview'
            type={TAB_TYPES.FILLED_OUTLINED}
            onSelect={handleTabSelect}
            wrapperClassName='!w-fit rounded-md bg-GRAY_100'
          />
        </div>
      </div>

      <div className='relative w-full h-full overflow-hidden'>
        <div className='h-full overflow-y-auto' style={{ scrollbarWidth: 'none' }}>
          <div>{renderTable()}</div>
        </div>
      </div>
    </div>
  );
};

export default DataPreviewContent;
