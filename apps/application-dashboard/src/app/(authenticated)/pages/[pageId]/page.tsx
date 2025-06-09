'use client';
import { useEffect, useMemo } from 'react';
import { useGetPageDetailsQuery, useGetPagesQuery } from 'apis/pages';
import { getPageRouteById } from 'constants/routeConfig';
import { useAppDispatch } from 'hooks/toolkit';
import { useHash } from 'hooks/useHash';
import { persistLastVisitedPage } from 'hooks/useLastVisitedPage';
import Sheets from 'modules/sheets';
import SheetsTabs from 'modules/sheets/SheetsTabs';
import { getSheetIdFromPath } from 'modules/widgets/widgets.utils';
import { useParams } from 'next/navigation';
import { resetBreadcrumb } from 'store/slices/layout-configs';
import CommonWrapper from 'components/commonWrapper';
import 'ag-charts-enterprise';

const Page = () => {
  const dispatch = useAppDispatch();
  const params = useParams();
  const pathname = useHash();

  const pageId = params?.pageId;
  const {
    data: pageDetails,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetPageDetailsQuery(pageId as string, { refetchOnMountOrArgChange: false, skip: !pageId });
  const { data: pages } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const currentSheetId = useMemo(
    () => getSheetIdFromPath(pathname, pageId as string) ?? pageDetails?.sheets?.[0]?.sheet_id,
    [pageDetails, pathname, pageId],
  );

  useEffect(() => {
    if (pageDetails) {
      persistLastVisitedPage(pageDetails.page_id);
    }
  }, [pageDetails]);

  const tabs = useMemo(
    () =>
      pageDetails?.sheets
        ?.map((sheet) => ({
          value: sheet?.sheet_id,
          label: sheet?.name,
          fractionalIndex: sheet?.fractional_index,
        }))
        .sort((sheet1, sheet2) => sheet1?.fractionalIndex - sheet2?.fractionalIndex) ?? [],
    [pageDetails],
  );

  useEffect(() => {
    const currentPageTitle = pages?.find((page) => page.page_id === pageId)?.name ?? 'Loading...';

    persistLastVisitedPage(pageId as string);
    dispatch(resetBreadcrumb([{ title: currentPageTitle, href: getPageRouteById(pageId as string) }]));
  }, [pageId, pages]);

  return (
    <CommonWrapper isError={isError} refetchFunction={refetch}>
      <div className='relative h-full w-full rounded-tl-md'>
        <Sheets
          key={currentSheetId}
          pageId={pageId as string}
          sheetId={currentSheetId as string}
          isPageLoading={isLoading}
        />
        <SheetsTabs tabs={tabs} currentSheetId={currentSheetId as string} isPageLoading={isFetching} />
      </div>
    </CommonWrapper>
  );
};

export default Page;
