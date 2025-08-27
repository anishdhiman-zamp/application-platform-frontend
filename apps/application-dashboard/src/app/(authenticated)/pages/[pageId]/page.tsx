'use client';
import { useEffect, useMemo } from 'react';
import { useGetPagesQuery } from 'apis/pages';
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
    data: pages,
    isFetching,
    refetch,
    isError,
  } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const currentPage = useMemo(() => pages?.find((page) => page.page_id === pageId), [pages, pageId]);

  const currentSheetId = useMemo(
    () => searchParams?.get('sheetId') ?? currentPage?.sheets?.[0]?.sheet_id,
    [currentPage, searchParams],
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

  const checkIsPageValid = () => {
    if (!pages) return;

    const isValidPageId = pages?.some((page) => page.page_id === pageId);

    if (!isValidPageId) {
      router.push(ROUTES_PATH.HOME);
    }
  };

  useEffect(() => {
    if (isFetching) return;

    persistLastVisitedPage(pageId as string);

    //on org switch/ invalid page, redirect to valid page
    checkIsPageValid();
  }, [pageId, pages, isFetching]);

  return (
    <CommonWrapper isError={isError} refetchFunction={refetch}>
      <div className='relative h-full w-full rounded-tl-md'>
        <Sheets key={currentSheetId} pageId={pageId as string} sheetId={currentSheetId as string} />
        <SheetsTabs tabs={tabs} currentSheetId={currentSheetId as string} />
      </div>
    </CommonWrapper>
  );
};

export default Page;
