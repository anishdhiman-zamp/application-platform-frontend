'use client';
import { useEffect } from 'react';
import { useGetPagesQuery } from 'apis/pages';
import { persistLastVisitedPage } from 'hooks/useLastVisitedPage';
import { useParams, useRouter } from 'next/navigation';
import { getPageRouteById, ROUTES_PATH } from '@/constants/routeConfig';
import CommonWrapper from 'components/commonWrapper';

const Page = () => {
  const params = useParams();
  const router = useRouter();

  const pageId = params?.pageId;

  const {
    data: pages,
    isFetching,
    refetch,
    isError,
  } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  useEffect(() => {
    if (pageId) {
      persistLastVisitedPage(pageId as string);
    }
  }, [pageId]);

  const checkIsPageValid = () => {
    if (!pages) return;

    const currentPage = pages?.find((page) => page.page_id === pageId);

    if (!currentPage) {
      router.push(ROUTES_PATH.HOME);
    } else {
      router.replace(getPageRouteById(pageId as string, currentPage?.sheets?.[0]?.sheet_id));
    }
  };

  useEffect(() => {
    if (isFetching) return;

    persistLastVisitedPage(pageId as string);

    //on org switch/ invalid page, redirect to valid page
    checkIsPageValid();
  }, [pageId, pages, isFetching]);

  if (!pages?.length) {
    return null;
  }

  return (
    <CommonWrapper isError={isError} refetchFunction={refetch}>
      <div className='relative h-full w-full rounded-tl-md'></div>
    </CommonWrapper>
  );
};

export default Page;
