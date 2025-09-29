import { FC } from 'react';
import { Button, Combobox } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ColumnAndDatasetListType } from 'modules/sheets/CreateEditFilter/types';
import useColumnSelector from 'modules/sheets/CreateEditFilter/useColumnSelector';

interface ColumnSelectorProps {
  config: ColumnAndDatasetListType;
}

const ColumnSelector: FC<ColumnSelectorProps> = ({ config }) => {
  const {
    isOpen,
    setIsOpen,
    columnOptions,
    handleSelectColumns,
    handleRemoveColumn,
    handleRemoveDataset,
    datasetOptions,
    isLoadingDatasetFilterConfig,
  } = useColumnSelector(config);

  const handleOpenChange = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <Combobox
      options={columnOptions}
      open={isOpen}
      onOpenChange={setIsOpen}
      emptyText='No options'
      itemClassName='flex items-center px-2 py-1.5'
      searchPlaceholder='Select column'
      isAnchorPointNeeded
      side='left'
      sideOffset={30}
      isMultiSelect
      onMultiSelect={handleSelectColumns}
      selectedValues={config?.columns}
      optionsLoading={isLoadingDatasetFilterConfig}
    >
      <div className='space-y-3 rounded-xl border border-gray-400 p-3'>
        <div className='f-12-450 flex items-center justify-between text-gray-900'>
          <span>{datasetOptions.find((option) => option.value === config?.datasetId)?.label}</span>
          <Button variant='ghost' size='xxsmall' className='size-3 [&_svg]:size-3' onClick={handleRemoveDataset}>
            <SvgSpriteLoader id='x-close' size={12} />
          </Button>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          {config?.columns?.map((column) => (
            <div key={column} className='f-12-500 flex h-6.5 items-center gap-1 rounded-md bg-gray-100 px-1.5 py-1'>
              <span>{columnOptions.find((option) => option.value === column)?.label}</span>
              <Button
                variant='ghost'
                size='xxsmall'
                className='size-3 text-gray-700 [&_svg]:size-3'
                onClick={() => handleRemoveColumn(column)}
              >
                <SvgSpriteLoader id='x-close' size={12} />
              </Button>
            </div>
          ))}
          {config?.columns?.length ? (
            <Button className='size-4 rounded-[2px] p-[2px] [&_svg]:size-3' variant='ghost' onClick={handleOpenChange}>
              <SvgSpriteLoader id='plus' size={12} />
            </Button>
          ) : (
            <Button
              size='xsmall'
              variant='ghost'
              className='bg-gray-100'
              onClick={handleOpenChange}
              data-testid='select-columns-btn'
            >
              <div className='flex items-center gap-1'>
                <SvgSpriteLoader id='plus' size={12} />
                <span>Select columns</span>
              </div>
            </Button>
          )}
        </div>
      </div>
    </Combobox>
  );
};

export default ColumnSelector;
