import { Button, COLORS, CSS_VARS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import TooltipV2 from '@/components/common/TooltipV2';
import { defaultFnType } from '@/types/commonTypes';
import type { FilterModelType } from '@/types/components/table.type';
type ShareResourceAccessDetailsProps = {
  fgacFilters: FilterModelType;
  showRoleChangeDropdown: boolean;
  handleToggleCustomiseAccess: defaultFnType;
  fgacColor?: string;
  tooltipText: string;
  emptyFiltersTitle: string;
};

const ShareResourceAccessDetails = ({
  fgacFilters,
  showRoleChangeDropdown,
  handleToggleCustomiseAccess,
  fgacColor,
  tooltipText,
  emptyFiltersTitle,
}: ShareResourceAccessDetailsProps) => {
  return (
    <div className='w-28'>
      {fgacFilters?.conditions && fgacFilters?.conditions?.length > 0 ? (
        <Button
          variant='ghost'
          size='xxsmall'
          className='f-12-450 text-GRAY_1000 group flex items-center gap-1.5 px-1 py-0.5'
          onClick={handleToggleCustomiseAccess}
          disabled={!showRoleChangeDropdown}
        >
          <span className='h-2 w-2 rounded-[2px]' style={{ backgroundColor: fgacColor ?? COLORS.BLUE_150 }} />
          <span>Custom</span>
          {showRoleChangeDropdown && (
            <SvgSpriteLoader
              id='arrow-narrow-right'
              size={12}
              color={CSS_VARS.GRAY_1000}
              className='opacity-0 group-hover:opacity-100'
            />
          )}
        </Button>
      ) : (
        <TooltipV2 tooltipBody={tooltipText} asChildTrigger>
          <div
            className={cn(
              'f-12-450 text-GRAY_1000 group flex w-fit cursor-pointer items-center gap-1.5 rounded-sm px-1',
              !showRoleChangeDropdown ? 'text-GRAY_600' : 'hover:bg-accent hover:text-accent-GRAY_1000',
            )}
            onClick={handleToggleCustomiseAccess}
          >
            <SvgSpriteLoader id='coins-stacked-04' size={8} color={CSS_VARS.GRAY_900} />
            <span>{emptyFiltersTitle}</span>
            {showRoleChangeDropdown && (
              <SvgSpriteLoader
                id='arrow-narrow-right'
                size={12}
                color={CSS_VARS.GRAY_1000}
                className='opacity-0 group-hover:opacity-100'
              />
            )}
          </div>
        </TooltipV2>
      )}
    </div>
  );
};

export default ShareResourceAccessDetails;
