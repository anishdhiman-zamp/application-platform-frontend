'use client';
import { useEffect, useMemo } from 'react';
import { useGetPagesQuery } from 'apis/pages';
import { useHash } from 'hooks/useHash';
import { persistLastVisitedPage } from 'hooks/useLastVisitedPage';
import Sheets from 'modules/sheets';
import SheetsTabs from 'modules/sheets/SheetsTabs';
import { getSheetIdFromPath } from 'modules/widgets/widgets.utils';
import { useParams } from 'next/navigation';
import CommonWrapper from 'components/commonWrapper';
import 'ag-charts-enterprise';

const Page = () => {
  const params = useParams();
  const pathname = useHash();

  const pageId = params?.pageId;
  const { data: pages } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const currentPage = useMemo(() => pages?.find((page) => page.page_id === pageId), [pages, pageId]);

  const currentSheetId = useMemo(
    () => getSheetIdFromPath(pathname, pageId as string) ?? currentPage?.sheets?.[0]?.sheet_id,
    [currentPage, pathname, pageId],
  );

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
    <CommonWrapper isError={false} refetchFunction={() => {}}>
      <div className='relative h-full w-full rounded-tl-md'>
        <Sheets key={currentSheetId} pageId={pageId as string} sheetId={currentSheetId as string} isBff />
        <SheetsTabs tabs={tabs} currentSheetId={currentSheetId as string} />
      </div>
    </CommonWrapper>
  );
};

export default Page;
