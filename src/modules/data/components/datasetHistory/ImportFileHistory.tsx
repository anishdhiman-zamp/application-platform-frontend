import React, { FC, useRef, useState } from 'react';
import { useOnClickOutside } from 'hooks';
import HistoryBulkLoaders from 'modules/data/components/datasetHistory/HistoryBulkLoaders';
import HistoryList from 'modules/data/components/datasetHistory/HistoryList';
import { ImportFileHistoryPropsType } from 'modules/data/components/importDataset/importData.types';

const ImportFileHistory: FC<ImportFileHistoryPropsType> = ({ onClose }) => {
  const importFileHistoryRef = useRef<HTMLDivElement>(null);
  const [isHoveredLoaders, setIsHoveredLoaders] = useState(false);

  useOnClickOutside(importFileHistoryRef, onClose);

  return (
    <div className='fixed w-screen !h-[calc(100vh-136px)] z-1000 top-[94px] left-0 flex justify-end'>
      <div
        ref={importFileHistoryRef}
        className='h-full overflow-y-scroll'
        style={{ scrollbarWidth: 'none' }}
        onMouseLeave={() => setIsHoveredLoaders(false)}
      >
        <div className='flex flex-col h-auto'>
          <HistoryBulkLoaders isHoveredLoaders={isHoveredLoaders} setIsHoveredLoaders={setIsHoveredLoaders} />
          <HistoryList isHoveredLoaders={isHoveredLoaders} />
        </div>
      </div>
    </div>
  );
};

export default ImportFileHistory;
