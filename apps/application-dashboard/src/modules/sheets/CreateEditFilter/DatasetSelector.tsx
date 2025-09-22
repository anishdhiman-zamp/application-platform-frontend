import { FC } from 'react';
import { Button, Combobox } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import useDatasetSelector from 'modules/sheets/CreateEditFilter/useDatasetSelector';

interface DatasetSelectorProps {
  className?: string;
}

const DatasetSelector: FC<DatasetSelectorProps> = ({ className }) => {
  const { isDatasetSelectorOpen, setIsDatasetSelectorOpen, handleSelectDataset, datasetOptions, selectedDatasets } =
    useDatasetSelector();

  return (
    <div className={cn('f-13-500 text-gray-1000 flex items-center justify-between', className)}>
      <span>Dataset</span>
      <Combobox
        options={datasetOptions}
        onSelect={handleSelectDataset}
        open={isDatasetSelectorOpen}
        onOpenChange={setIsDatasetSelectorOpen}
        emptyText='No options'
        itemClassName='flex items-center px-2 py-1.5'
        align='start'
        side='left'
        sideOffset={270}
        selectedValues={selectedDatasets}
        disableSelectedOptions
        tooltipBody='Add dataset'
      >
        <Button
          className={cn('size-4 rounded-[2px] p-[2px] [&_svg]:size-3', {
            'bg-gray-300 hover:bg-gray-300': isDatasetSelectorOpen,
          })}
          variant='ghost'
        >
          <SvgSpriteLoader id='plus' size={12} />
        </Button>
      </Combobox>
    </div>
  );
};

export default DatasetSelector;
