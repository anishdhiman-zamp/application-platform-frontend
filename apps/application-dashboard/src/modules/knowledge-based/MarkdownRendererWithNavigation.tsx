'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppDispatch } from 'hooks/toolkit';
import { useParams } from 'next/navigation';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { useGetKnowledgeBaseQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import DynamicLottiePlayer from '@/components/DynamicLottiePlayer';
import { ZAMP_LOGO_LOADER } from '@/constants/lottie/zamp-logo-loader';
import KnowledgeBaseNavigation from '@/modules/knowledge-based/KnowledgeBaseNavigation';
import { closeSidebar, openSidebar } from '@/store/slices/layout-configs';
import { extractHeadersFromMarkdown, type HeaderItem } from '@/utils/markdownUtils';

interface MarkdownRendererWithNavigationPropsType {
  hideNav?: boolean;
  scrollRef?: React.RefObject<HTMLDivElement>;
}

const MarkdownRendererWithNavigation = ({ hideNav = false, scrollRef }: MarkdownRendererWithNavigationPropsType) => {
  const dispatch = useAppDispatch();
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [headers, setHeaders] = useState<HeaderItem[]>([]);
  const params = useParams();
  const processId = params?.processId as string;
  const { data, isLoading, isError, refetch } = useGetKnowledgeBaseQuery({ processId });
  const [currentSelectedHeader, setCurrentSelectedHeader] = useState<string | null>(null);
  const [isManualNavigation, setIsManualNavigation] = useState(false);

  const handleManualHeaderSelection = useCallback((headerId: string | null) => {
    setIsManualNavigation(true);
    setCurrentSelectedHeader(headerId);

    setTimeout(() => {
      setIsManualNavigation(false);
    }, 1000);
  }, []);

  const getMarkdownContent = useCallback(async () => {
    if (!data || !data?.content_signed_url) return;
    const response = await fetch(data?.content_signed_url);
    const content = await response.text();

    setMarkdownContent(content);
    setHeaders(extractHeadersFromMarkdown(content));
  }, [data]);

  useEffect(() => {
    getMarkdownContent();
  }, [data, getMarkdownContent]);

  useEffect(() => {
    dispatch(closeSidebar());

    return () => {
      dispatch(openSidebar());
    };
  }, [dispatch]);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (isManualNavigation) return;

      const visibleHeaders = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visibleHeaders.length > 0) {
        const topHeader = visibleHeaders[0];

        setCurrentSelectedHeader(topHeader.target.id);
      }
    },
    [isManualNavigation],
  );

  useEffect(() => {
    if (!scrollRef?.current || headers.length === 0) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: scrollRef?.current,
      rootMargin: '-10% -0px -90% 0px',
      threshold: 0,
    });

    const headerElements: HTMLElement[] = [];

    const collectHeaderElements = (headerItems: HeaderItem[]) => {
      headerItems.forEach((header) => {
        const element = document.getElementById(header.id);

        if (element) {
          headerElements.push(element);
        }
        if (header.children) {
          collectHeaderElements(header.children);
        }
      });
    };

    collectHeaderElements(headers);

    headerElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [headers, handleIntersection]);

  return (
    <CommonWrapper
      isLoading={isLoading}
      isError={isError}
      refetchFunction={refetch}
      skeletonType={SkeletonTypes.CUSTOM}
      className='w-full'
      loader={
        <div className='z-1000 flex h-full w-full items-center justify-center bg-white'>
          <DynamicLottiePlayer src={ZAMP_LOGO_LOADER} className='lottie-player h-[140px]' autoplay loop keepLastFrame />
        </div>
      }
    >
      <div className='flex'>
        <div className='markdown-body w-full overflow-y-auto p-6'>
          <div className='kb-viewer m-auto max-w-[800px] pb-20'>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>
        {!hideNav && (
          <div>
            <div className='sticky top-0 z-50 max-h-[calc(100vh-60px)] w-[320px] min-w-[320px] overflow-y-auto bg-white px-8 py-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
              <h2 className='f-14-400 mb-2 text-gray-700'>In this Knowledge Base</h2>
              <KnowledgeBaseNavigation
                items={headers}
                currentSelectedHeader={currentSelectedHeader}
                setCurrentSelectedHeader={handleManualHeaderSelection}
              />
            </div>
          </div>
        )}
      </div>
    </CommonWrapper>
  );
};

export default MarkdownRendererWithNavigation;
