import { getUpdatedSheetLayout } from 'modules/sheets/sheets.utils';
import { WidgetSize } from 'modules/widgets/widget.types';
import { useUpdateSheetLayoutMutation } from '@/apis/pages';
import { SheetDetailsResponseType } from '@/types/api/pagesApi.types';
import { ResponsiveGridLayoutType } from '@/types/commonTypes';

interface UseWidgetResizeParams {
  pageId: string;
  sheetId: string;
  setSheetLayout?: (layout: ResponsiveGridLayoutType[]) => void;
}

interface HandleWidgetResizeParams {
  widgetId: string;
  size: WidgetSize;
  sheetLayout: ResponsiveGridLayoutType[];
  sheetDetails?: SheetDetailsResponseType;
}

const useWidgetResize = ({ pageId, sheetId, setSheetLayout }: UseWidgetResizeParams) => {
  const [updateSheetLayout] = useUpdateSheetLayoutMutation();

  const handleWidgetResize = ({ widgetId, size, sheetLayout, sheetDetails }: HandleWidgetResizeParams) => {
    if (!sheetLayout || !sheetDetails) return;
    const sortedLayout = [...sheetLayout].sort((a, b) => (a.y > b.y ? 1 : a.y === b.y ? (a.x > b.x ? 1 : -1) : -1));
    const targetWidgetIndex = sortedLayout?.findIndex((widget) => widget.i === widgetId);

    if (targetWidgetIndex === undefined || targetWidgetIndex === -1) return;

    const { newLayouts, widgetsToUpdate } = getUpdatedSheetLayout({
      targetWidgetIndex,
      sheetLayout: sortedLayout,
      size,
      sheetDetails,
    });

    setSheetLayout?.(newLayouts);

    updateSheetLayout({
      pageId,
      sheetId,
      body: widgetsToUpdate.map((widget) => ({
        layout: {
          x: widget.x,
          y: widget.y,
          w: widget.w,
          h: widget.h,
        },
        widget_id: widget.i,
      })),
    });
  };

  return handleWidgetResize;
};

export default useWidgetResize;
