import { useState } from 'react';
import { useUpdateSheetLayoutMutation } from '@/apis/pages';
import { ResponsiveGridLayoutType } from '@/types/commonTypes';

interface UseUpdateSheetLayoutProps {
  setSheetLayout: (layout: ResponsiveGridLayoutType[]) => void;
  pageId: string;
  sheetId: string;
}

const useUpdateSheetLayout = ({ setSheetLayout, pageId, sheetId }: UseUpdateSheetLayoutProps) => {
  const [dragStartLayout, setDragStartLayout] = useState<ResponsiveGridLayoutType[]>([]);
  const [updateSheetLayout] = useUpdateSheetLayoutMutation();

  const handleDragStart = (layout: ResponsiveGridLayoutType[]) => {
    setDragStartLayout([...layout]);
  };

  const handleDragStop = (layout: ResponsiveGridLayoutType[]) => {
    const hasLayoutChanged = JSON.stringify(layout) !== JSON.stringify(dragStartLayout);

    if (hasLayoutChanged) {
      setSheetLayout(layout);
      updateSheetLayout({
        pageId,
        sheetId,
        body: layout.map((widget) => ({
          layout: {
            x: widget?.x ?? 0,
            y: widget?.y ?? 0,
            w: widget?.w ?? 0,
            h: widget?.h ?? 0,
          },
          widget_id: widget?.i ?? '',
        })),
      });
    }
  };

  return { handleDragStart, handleDragStop };
};

export default useUpdateSheetLayout;
