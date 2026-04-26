'use client';

import '../code-highlight.css';
import '../streaming-reveal.css';

import { Book, CopyToClipboard } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Copy } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { useChatActions } from '../../context/ChatActionsContext';
import { useTypewriter } from '../../hooks/useTypewriter';
import { rehypeStreamReveal } from '../../plugins/rehypeStreamReveal';
import { normalizeFilesystemPath } from '../../utils/filesystemUpload';
import {
  buildMentionMatcher,
  extractTextFromChildren,
  highlightCode,
  type ReferenceRef,
  wrapMentions,
} from './utils/markdownBlock.utils';

const ZAMP_FILE_PROTOCOL = 'zamp-file://';

const urlTransform = (url: string): string => {
  if (url.startsWith(ZAMP_FILE_PROTOCOL)) {
    return url;
  }
  return url;
};

interface MarkdownBlockProps {
  payload: {
    text: string;
  };
  isStreaming?: boolean;
  className?: string;
  fontClassName?: string;
  compactParagraphs?: boolean;
  references?: ReferenceRef[];
}

export const MarkdownBlock: React.FC<MarkdownBlockProps> = ({
  payload,
  isStreaming = false,
  className,
  fontClassName = 'text-GRAY_950 text-sm leading-[1.667] font-[420]',
  compactParagraphs = false,
  references,
}) => {
  const { onFileOpen } = useChatActions();

  const handleFileOpen = (filePath: string, fileName: string) => {
    if (onFileOpen) {
      onFileOpen(normalizeFilesystemPath(filePath), fileName);
    }
  };

  const mentionMatcher = useMemo(() => buildMentionMatcher(references ?? []), [references]);
  const { text, isAnimating } = useTypewriter(payload.text, undefined, isStreaming);

  const rehypePlugins = useMemo(
    () => (isStreaming || isAnimating ? [rehypeSlug, rehypeStreamReveal] : [rehypeSlug]),
    [isStreaming, isAnimating],
  );

  return (
    <div
      className={cn(
        'max-w-chat-prose text-GRAY_950 overflow-hidden text-sm leading-[1.667] font-[420] wrap-break-word',
        className,
      )}
      data-testid='markdown-block'
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins}
        urlTransform={urlTransform}
        components={{
          h1: ({ children }) => (
            <h1 className='text-GRAY_1000 mt-10 mb-2 text-[22px] leading-[1.4] font-semibold tracking-[-0.02em] first:mt-4'>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className='text-GRAY_1000 mt-6 text-lg leading-[1.4] font-semibold tracking-[-0.015em] first:mt-0'>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className='text-GRAY_1000 mt-8 text-base leading-[1.4] font-semibold tracking-[-0.01em] first:mt-0'>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className={cn(compactParagraphs ? 'mt-1 first:mt-0' : 'mt-3 first:mt-0', fontClassName)}>
              {compactParagraphs ? wrapMentions(children, mentionMatcher) : children}
            </p>
          ),
          ul: ({ children }) => (
            <ul
              className={cn(
                compactParagraphs ? 'mt-1 list-disc pl-5 first:mt-0' : 'mt-3 list-disc pl-5 first:mt-0',
                fontClassName,
              )}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={cn(
                'text-GRAY_950 list-decimal pl-7 text-sm leading-[1.667] font-[420] first:mt-0',
                compactParagraphs ? 'mt-1' : 'mt-3',
              )}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={compactParagraphs ? 'mt-0 first:mt-0' : 'mt-2 first:mt-0'}>{children}</li>
          ),
          hr: () => <hr className={cn('bg-GRAY_300 h-px border-none', compactParagraphs ? 'my-3' : 'my-8')} />,
          strong: ({ children }) => <strong className='text-GRAY_1000 font-semibold'>{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote
              className={cn(
                'border-GRAY_300 text-GRAY_900 border-l-2 pl-4 first:mt-0',
                compactParagraphs ? 'mt-2' : 'mt-4',
              )}
            >
              {children}
            </blockquote>
          ),
          pre: ({ children }) => <>{children}</>,
          table: ({ children }) => (
            <div className='mt-4 overflow-x-auto pb-3 first:mt-0'>
              <table className='text-GRAY_950 w-full border-collapse text-[13px] font-[420]'>{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead>{children}</thead>,
          th: ({ children }) => (
            <th className='text-GRAY_900 border-GRAY_300 border-b pt-1 pr-4 pb-2 text-left text-[11px] font-semibold tracking-[0.04em] uppercase'>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className='text-GRAY_950 border-GRAY_300 border-b py-2.5 pr-4 leading-normal'>{children}</td>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = extractTextFromChildren(children).replace(/\n$/, '');
            const isInline = !className && !String(children).includes('\n');

            if (isInline) {
              return (
                <code className='bg-PINK_100 text-PINK_600 rounded-[3px] px-1 py-0.5 font-mono text-xs font-normal'>
                  {children}
                </code>
              );
            }

            const language = match?.[1];
            return (
              <div className='mt-5 pb-2 first:mt-0'>
                <div className='border-GRAY_300 overflow-hidden rounded-lg border'>
                  <div className='border-GRAY_300 bg-BG_GRAY_2 flex items-center justify-between border-b px-4 py-1.5'>
                    {language ? (
                      <span className='text-GRAY_900 font-mono text-[11px] font-medium tracking-normal'>
                        {language}
                      </span>
                    ) : (
                      <span />
                    )}
                    <CopyToClipboard text={codeString} tooltipText='Copy code'>
                      <Copy size={14} className='text-GRAY_700 hover:text-GRAY_1000 transition-colors' />
                    </CopyToClipboard>
                  </div>
                  <pre className='bg-GRAY_100 m-0 overflow-x-auto px-5 py-4'>
                    <code className='hljs text-GRAY_1000 font-mono text-[13px] leading-normal font-normal' {...props}>
                      {highlightCode(codeString, language)}
                    </code>
                  </pre>
                </div>
              </div>
            );
          },
          a: ({ href, children }) => {
            if (!href) return <>{children}</>;

            if (href.startsWith(ZAMP_FILE_PROTOCOL)) {
              const filePath = href.slice(ZAMP_FILE_PROTOCOL.length);
              const extractedText = extractTextFromChildren(children);
              const fileName = extractedText || filePath.split('/').pop() || 'File';
              return (
                <span
                  onClick={() => handleFileOpen(filePath, fileName)}
                  role='button'
                  className='text-GRAY_1000 inline-flex cursor-pointer items-center gap-x-1 align-middle'
                >
                  <Book size={14} className='shrink-0' />
                  <span className='f-14-550 decoration-GRAY_700 underline underline-offset-2'>{fileName}</span>
                </span>
              );
            }

            return (
              <Link
                href={href}
                target='_blank'
                className='text-BLUE_700 decoration-BLUE_700 underline underline-offset-2'
              >
                {children}
              </Link>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};
