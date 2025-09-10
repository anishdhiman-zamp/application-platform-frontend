'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useGetPagesQuery } from '@/apis/pages';
import { persistLastVisitedPage } from '@/hooks/useLastVisitedPage';
import SheetsTabs from '@/modules/sheets/SheetsTabs';

const SheetTabsDefault = () => {
  const params = useParams();
  const currentSheetId = params?.sheetId;

  const pageId = params?.pageId;

  const { data: pages } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const currentPage = useMemo(() => pages?.find((page) => page.page_id === pageId), [pages, pageId]);

  useEffect(() => {
    if (pageId) {
      persistLastVisitedPage(pageId as string);
    }
  }, [pageId]);

  const tabs = useMemo(
    () =>
      currentPage?.sheets
        ?.map((sheet) => ({
          value: sheet?.sheet_id,
          label: sheet?.name,
          fractionalIndex: sheet?.fractional_index,
        }))
        .sort((sheet1, sheet2) => sheet1?.fractionalIndex - sheet2?.fractionalIndex) ?? [],
    [currentPage],
  );

  return (
    <div>
      <SheetsTabs key={pageId?.toString()} tabs={tabs} currentSheetId={currentSheetId?.toString() || ''} />
    </div>
  );
};

export default SheetTabsDefault;
