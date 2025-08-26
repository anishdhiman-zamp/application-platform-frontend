'use client';
import { useEffect, useMemo } from 'react';
import { useGetPageDetailsQuery, useGetPagesQuery } from 'apis/pages';
import { persistLastVisitedPage } from 'hooks/useLastVisitedPage';
import Sheets from 'modules/sheets';
import SheetsTabs from 'modules/sheets/SheetsTabs';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import CommonWrapper from 'components/commonWrapper';
import 'ag-charts-enterprise';

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageId = params?.pageId;
  const {
    data: pageDetails,
    isLoading,
    isError,
    refetch,
  } = useGetPageDetailsQuery(pageId as string, { refetchOnMountOrArgChange: false, skip: !pageId });
  const { data: pages, isFetching: isFetchingPages } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const currentSheetId = useMemo(
    () => searchParams?.get('sheetId') ?? pageDetails?.sheets?.[0]?.sheet_id,
    [pageDetails, searchParams],
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

  const checkIsPageValid = () => {
    if (!pages) return;

    const isValidPageId = pages?.some((page) => page.page_id === pageId);

    if (!isValidPageId) {
      router.push(ROUTES_PATH.HOME);
    }
  };

  useEffect(() => {
    if (isFetchingPages) return;

    persistLastVisitedPage(pageId as string);

    //on org switch/ invalid page, redirect to valid page
    checkIsPageValid();
  }, [pageId, pages, isFetchingPages]);

  return (
    <CommonWrapper isError={isError} refetchFunction={refetch}>
      <div className='relative h-full w-full rounded-tl-md'>
        <Sheets
          key={currentSheetId}
          pageId={pageId as string}
          sheetId={currentSheetId as string}
          isPageLoading={isLoading}
        />
        <SheetsTabs tabs={tabs} currentSheetId={currentSheetId as string} isPageLoading={isLoading} />
      </div>
    </CommonWrapper>
  );
};

export default Page;
