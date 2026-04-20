import { FC } from 'react';
import { Button, Input, Popover, PopoverContent, PopoverTrigger, TooltipV2 } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { SIDE_OPTIONS } from '@/types/commonTypes';
import { useFiltersMenu } from 'components/filter/filterMenu/FiltersMenuV3/useFiltersMenu';

const FiltersMenuV3: FC = () => {
  const {
    hasNoSelectedFilters,
    searchedFilters,
    handleAddFilter,
    handleSearch,
    search,
    handleOpenFilter,
    openFiltersMenu,
    setOpenFiltersMenu,
    handleConfigureFilter,
    hasNoFilters,
  } = useFiltersMenu();

  return (
    <>
      {hasNoFilters ? (
        <Button
          variant='secondary'
          size='xxsmall'
          className='h-6 gap-1 p-1.5 [&_svg]:size-3'
          onClick={handleOpenFilter}
          data-testid='create-filter-btn'
        >
          <SvgSpriteLoader id='filter-lines' size={12} />
          <span>Create Filter</span>
        </Button>
      ) : (
        <Popover open={openFiltersMenu} onOpenChange={setOpenFiltersMenu}>
          <PopoverTrigger asChild>
            <Button
              variant='secondary'
              size='xxsmall'
              className='h-6 gap-1 p-1.5 [&_svg]:size-3'
              data-testid='filters-menu-v3-btn'
            >
              <SvgSpriteLoader id='filter-lines' size={12} />
              {hasNoSelectedFilters && <span>Filter</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent align='start'>
            <div className='mt-0.5 mr-0.5 mb-1.5 ml-1.5 flex items-center justify-between'>
              <Input
                placeholder='Search...'
                size='small'
                className='h-4 border-none p-1 focus-visible:ring-0'
                onChange={handleSearch}
                value={search}
              />
              <Button
                variant='ghost'
                size='small'
                className='h-6 px-1.5 py-1 [&_svg]:size-3.5'
                onClick={handleOpenFilter}
              >
                <div className='flex items-center gap-1'>
                  <SvgSpriteLoader id='plus' size={14} />
                  <span>New Filter</span>
                </div>
              </Button>
            </div>
            <div className='flex flex-col gap-1'>
              {searchedFilters.map((filter) => (
                <Button
                  size='xsmall'
                  variant='ghost'
                  onClick={() => handleAddFilter(filter.key)}
                  key={filter.key}
                  className='flex items-center justify-between gap-2'
                  data-testid={`${filter.key}-add-filter-btn`}
                >
                  <div className='flex items-center gap-1.5'>
                    <span className='f-12-400 text-gray-900'>{filter.value?.label}</span>
                    <span className='f-12-500'>{filter.value?.title}</span>
                  </div>

                  <TooltipV2 tooltipBody='Configure' side={SIDE_OPTIONS.BOTTOM} asChildTrigger>
                    <Button
                      size='xxsmall'
                      variant='ghost'
                      className='text-gray-700 [&_svg]:size-3'
                      onClick={(e) => handleConfigureFilter(e, filter.key)}
                      data-testid={`${filter.key}-filters-menu-v3-configure-btn`}
                    >
                      <SvgSpriteLoader id='settings-04' size={12} />
                    </Button>
                  </TooltipV2>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};

export default FiltersMenuV3;
