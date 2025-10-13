'use client';
import { useEffect } from 'react';
import { useGetPagesQuery } from 'apis/pages';
import { persistLastVisitedPage, persistLastVisitedSheet } from 'hooks/useLastVisitedPage';
import Sheets from 'modules/sheets';
import { useParams, useRouter } from 'next/navigation';
import ZampLogoGifLoader from '@/components/common/loader/ZampLogoGifLoader';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ROUTES_PATH } from '@/constants/routeConfig';
import CommonWrapper from 'components/commonWrapper';

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const currentSheetId = params?.sheetId;

  const pageId = params?.pageId;

  const {
    data: pages,
    isFetching,
    refetch,
    isError,
  } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const checkIsPageValid = () => {
    if (!pages) return;

    const currentPage = pages?.find((page) => page.page_id === pageId);

    if (!currentPage) {
      router.push(ROUTES_PATH.HOME);

      return;
    }

    persistLastVisitedPage(pageId?.toString() || '');
    persistLastVisitedSheet(pageId?.toString() || '', currentSheetId?.toString() || '');
  };

  useEffect(() => {
    if (isFetching) return;
    //on invalid page, redirect to valid page
    checkIsPageValid();
  }, [pageId, pages, isFetching]);

  return (
    <CommonWrapper
      isLoading={isFetching}
      loader={<ZampLogoGifLoader />}
      skeletonType={SkeletonTypes.CUSTOM}
      isError={isError}
      refetchFunction={refetch}
      className='h-full'
    >
      <div className='relative h-full w-full rounded-tl-md'>
        <Sheets key={`${pageId}-${currentSheetId}`} pageId={pageId as string} sheetId={currentSheetId} />
      </div>
    </CommonWrapper>
  );
};

export default Page;
