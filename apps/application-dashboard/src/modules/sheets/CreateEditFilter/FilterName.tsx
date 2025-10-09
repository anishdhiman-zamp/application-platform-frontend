import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import useFilterName from 'modules/sheets/CreateEditFilter/useFilterName';
import TooltipV2 from '@/components/common/TooltipV2';
import { SIDE_OPTIONS } from '@/types/commonTypes';

const FilterName = () => {
  const {
    isEditingFilterNameAllowed,
    isEditingFilterName,
    spanRef,
    filterName,
    handleChange,
    handleInputBlur,
    handleEditKeyDown,
    inputWidth,
    setIsEditingFilterName,
    formData,
  } = useFilterName();

  return (
    <div className='pt-6 pl-2.5'>
      {isEditingFilterNameAllowed ? (
        <>
          {isEditingFilterName ? (
            <div className='relative inline-block'>
              <span ref={spanRef} className='f-24-450 invisible absolute whitespace-pre' aria-hidden='true'>
                {filterName}
              </span>
              <input
                value={filterName}
                onChange={handleChange}
                onBlur={handleInputBlur}
                autoFocus
                style={{ width: `${inputWidth}px` }}
                className={cn('f-18-500 bg-GRAY_50 h-8 rounded-lg px-2.5 py-1 focus:outline-none', {
                  'bg-white': filterName?.length === 0,
                })}
                placeholder='Add filter title'
                onKeyDown={handleEditKeyDown}
                data-testid='filter-name-input'
              />
            </div>
          ) : (
            <TooltipV2 tooltipBody='Rename' side={SIDE_OPTIONS.BOTTOM} asChildTrigger>
              <Button
                variant='ghost'
                className='text-GRAY_950 rounded-lg px-2.5 py-1'
                onClick={() => setIsEditingFilterName(true)}
                size='medium'
                data-testid='filter-name-button'
              >
                <span className='f-18-500'>{formData.name}</span>
              </Button>
            </TooltipV2>
          )}
        </>
      ) : (
        <span className='f-18-500'>{formData.name}</span>
      )}
    </div>
  );
};

export default FilterName;
