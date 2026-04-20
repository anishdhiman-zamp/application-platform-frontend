'use client';
import { FC } from 'react';
import { Button, TooltipV2 } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import ColumnSelector from 'modules/sheets/CreateEditFilter/ColumnSelector';
import DatasetSelector from 'modules/sheets/CreateEditFilter/DatasetSelector';
import DatatypeSelector from 'modules/sheets/CreateEditFilter/DatatypeSelector';
import DeleteFilterDialog from 'modules/sheets/CreateEditFilter/DeleteFilterDialog';
import DiscardDialog from 'modules/sheets/CreateEditFilter/DiscardDialog';
import FilterName from 'modules/sheets/CreateEditFilter/FilterName';
import FilterNameOperatorOptions from 'modules/sheets/CreateEditFilter/FilterNameOperatorOptions';
import useCreateEditFilter from 'modules/sheets/CreateEditFilter/useCreateEditFilter';
import { checkIsObjectEmpty, cn } from '@/utils/common';

const CreateEditFilter: FC = () => {
  const {
    formData,
    handleCreateFilter,
    handleClose,
    isFilterOpen,
    existingFilterData,
    isSubmitDisabled,
    tooltipText,
    handleExistingFilterNo,
    handleExistingFilterYes,
    isLoading,
  } = useCreateEditFilter();

  return (
    <div className='shadow-side-drawer relative h-full border-l'>
      {isFilterOpen && (
        <div className='absolute top-4 right-5' data-testid='create-edit-filter-discard-dialog'>
          <DiscardDialog onClose={handleClose} />
        </div>
      )}
      <FilterName />
      <FilterNameOperatorOptions />
      <DatatypeSelector />
      <div className='mt-5 h-[calc(100%-324px)] space-y-3 overflow-y-auto px-5 [&::-webkit-scrollbar]:hidden'>
        <DatasetSelector />
        {formData.columnAndDatasetList.map((item) => (
          <ColumnSelector key={item.datasetId} config={item} />
        ))}
      </div>
      {!checkIsObjectEmpty(existingFilterData) && (
        <div className='f-14-400 rounded-2.5 shadow-menu-shadow absolute bottom-3 mx-5 space-y-2.5 border p-5'>
          <p>Similar filter already exists, would you like to configure the existing one?</p>
          <div className='flex justify-end gap-2.5'>
            <Button variant='ghost' size='medium' onClick={handleExistingFilterNo}>
              No
            </Button>
            <Button size='medium' onClick={handleExistingFilterYes}>
              Yes
            </Button>
          </div>
        </div>
      )}
      {checkIsObjectEmpty(existingFilterData) && isFilterOpen && (
        <div className='fixed right-0 bottom-0 flex w-74 items-center justify-end gap-4.5 p-5'>
          <DeleteFilterDialog onClose={handleClose} />
          <TooltipV2 tooltipBody={tooltipText} asChildTrigger isDisabledBody={!isSubmitDisabled}>
            <Button
              variant={formData.id ? 'secondary' : 'default'}
              size='small'
              className={cn('flex w-21 items-center gap-1', { 'cursor-not-allowed opacity-50': isSubmitDisabled })}
              onClick={handleCreateFilter}
              isLoading={isLoading}
              data-testid='create-edit-filter-submit-btn'
            >
              <SvgSpriteLoader id='check-circle' size={14} />
              <span>{formData.id ? 'Done' : 'Create'}</span>
            </Button>
          </TooltipV2>
        </div>
      )}
    </div>
  );
};

export default CreateEditFilter;
