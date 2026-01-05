'use client';

import { memo, useEffect, useState } from 'react';
import MarkdownSkeleton from 'modules/process/knowledge-base-creation/components/MarkdownSkeleton';
import dynamic from 'next/dynamic';

// Dynamic import for ReactMarkdown to reduce initial bundle
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => <MarkdownSkeleton />,
});

interface MarkdownContentProps {
  content: string;
}

/**
 * Memoized markdown content component with lazy-loaded plugins (remark-gfm and rehype-slug)
 * for optimal performance and reduced initial bundle size
 */
const MarkdownContent = memo(({ content }: MarkdownContentProps) => {
  const [plugins, setPlugins] = useState<{
    remarkGfm: typeof import('remark-gfm').default | null;
    rehypeSlug: typeof import('rehype-slug').default | null;
  }>({ remarkGfm: null, rehypeSlug: null });

  useEffect(() => {
    // Load plugins only when content is available
    if (content) {
      Promise.all([import('remark-gfm'), import('rehype-slug')]).then(([remarkGfmModule, rehypeSlugModule]) => {
        setPlugins({
          remarkGfm: remarkGfmModule.default,
          rehypeSlug: rehypeSlugModule.default,
        });
      });
    }
  }, [content]);

  if (!plugins.remarkGfm || !plugins.rehypeSlug) {
    return <MarkdownSkeleton />;
  }

  return (
    <ReactMarkdown remarkPlugins={[plugins.remarkGfm]} rehypePlugins={[plugins.rehypeSlug]}>
      {content}
    </ReactMarkdown>
  );
});

MarkdownContent.displayName = 'MarkdownContent';

export default MarkdownContent;
