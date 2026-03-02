'use client';

import Link from 'next/link';
import React, { Children, isValidElement, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { useChatActions } from '../../context/ChatActionsContext';

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
  const { onFileOpen } = useChatActions();

  const handleFileOpen = (filePath: string, fileName: string) => {
    if (onFileOpen) {
      const normalizedPath = filePath.startsWith('/home/') ? filePath.slice(6) : filePath;
      onFileOpen(normalizedPath, fileName);
    }
  };

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
              return (
                <span
                  onClick={() => handleFileOpen(filePath, fileName)}
                  className='bg-gray-1000 ml-0.5 inline-flex cursor-pointer items-center rounded-md px-2 py-0.5 text-xs font-medium text-white transition-all duration-150 hover:bg-black hover:shadow-md active:scale-[0.98]'
                >
                  {fileName}
                </span>
              );
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
