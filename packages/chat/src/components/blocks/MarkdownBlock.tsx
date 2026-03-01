'use client';

import Link from 'next/link';
import React, { Children, isValidElement, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import FileReferenceItem from './FileReferenceItem';

const ZAMP_FILE_PROTOCOL = 'zamp-file://';

const urlTransform = (url: string): string => {
  if (url.startsWith(ZAMP_FILE_PROTOCOL)) {
    return url;
  }
  return url;
};

const extractTextFromChildren = (children: ReactNode): string => {
  let text = '';
  Children.forEach(children, (child) => {
    if (typeof child === 'string') {
      text += child;
    } else if (typeof child === 'number') {
      text += String(child);
    } else if (isValidElement(child)) {
      const childProps = child.props as { children?: ReactNode };
      if (childProps.children) {
        text += extractTextFromChildren(childProps.children);
      }
    }
  });
  return text;
};

interface MarkdownBlockProps {
  payload: {
    text: string;
  };
}

export const MarkdownBlock: React.FC<MarkdownBlockProps> = ({ payload }) => {
  return (
    <div className='prose prose-sm f-13-450 text-gray-1000 max-w-none wrap-break-word' data-testid='markdown-block'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        urlTransform={urlTransform}
        components={{
          a: ({ href, children }) => {
            if (!href) return <>{children}</>;

            if (href.startsWith(ZAMP_FILE_PROTOCOL)) {
              const filePath = href.slice(ZAMP_FILE_PROTOCOL.length);
              const extractedText = extractTextFromChildren(children);
              const fileName = extractedText || filePath.split('/').pop() || 'File';
              return <FileReferenceItem fileReference={{ path: filePath, name: fileName }} />;
            }

            return (
              <Link href={href} target='_blank' className='text-blue-700'>
                {children}
              </Link>
            );
          },
        }}
      >
        {payload.text}
      </ReactMarkdown>
    </div>
  );
};
