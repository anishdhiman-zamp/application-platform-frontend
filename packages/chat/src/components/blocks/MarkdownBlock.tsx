'use client';

import '../code-highlight.css';

import type { Element, RootContent } from 'hast';
import { common, createLowlight } from 'lowlight';
import Link from 'next/link';
import React, { Children, isValidElement, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { useChatActions } from '../../context/ChatActionsContext';
import { useStreamingText } from '../../hooks/useStreamingText';

const lowlight = createLowlight(common);

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

function hastToReact(nodes: RootContent[], keyPrefix = 'hl'): React.ReactNode[] {
  return nodes.map((node, i) => {
    if (node.type === 'text') {
      return node.value;
    }
    if (node.type === 'element') {
      const el = node as Element;
      const className = (el.properties?.className as string[])?.join(' ');
      return React.createElement(
        el.tagName,
        { key: `${keyPrefix}-${i}`, ...(className ? { className } : {}) },
        el.children ? hastToReact(el.children as RootContent[], `${keyPrefix}-${i}`) : null,
      );
    }
    return null;
  });
}

function highlightCode(code: string, language?: string): React.ReactNode {
  try {
    const tree =
      language && lowlight.registered(language) ? lowlight.highlight(language, code) : lowlight.highlightAuto(code);

    return hastToReact(tree.children as RootContent[]);
  } catch {
    return code;
  }
}

interface MarkdownBlockProps {
  payload: {
    text: string;
  };
  isStreaming?: boolean;
}

export const MarkdownBlock: React.FC<MarkdownBlockProps> = ({ payload, isStreaming = false }) => {
  const { onFileOpen } = useChatActions();
  const displayedText = useStreamingText(payload.text, isStreaming);

  const handleFileOpen = (filePath: string, fileName: string) => {
    if (onFileOpen) {
      const normalizedPath = filePath.startsWith('/home/') ? filePath.slice(6) : filePath;
      onFileOpen(normalizedPath, fileName);
    }
  };

  return (
    <div
      className='max-w-chat-prose text-GRAY_950 overflow-hidden text-[14px] leading-[1.667] font-[420] wrap-break-word'
      data-testid='markdown-block'
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        urlTransform={urlTransform}
        components={{
          h1: ({ children }) => (
            <h1 className='text-GRAY_1000 mt-10 mb-2 text-[22px] leading-[1.4] font-semibold tracking-[-0.02em] first:mt-4'>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className='text-GRAY_1000 mt-6 text-[18px] leading-[1.4] font-semibold tracking-[-0.015em] first:mt-0'>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className='text-GRAY_1000 mt-8 text-[16px] leading-[1.4] font-semibold tracking-[-0.01em] first:mt-0'>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className='text-GRAY_950 mt-3 text-[14px] leading-[1.667] font-[420] first:mt-0'>{children}</p>
          ),
          ul: ({ children }) => (
            <ul className='text-GRAY_950 mt-3 list-disc pl-5 text-[14px] leading-[1.667] font-[420] first:mt-0'>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className='text-GRAY_950 mt-3 list-decimal pl-5 text-[14px] leading-[1.667] font-[420] first:mt-0'>
              {children}
            </ol>
          ),
          li: ({ children }) => <li className='mt-2 first:mt-0'>{children}</li>,
          hr: () => <hr className='bg-GRAY_300 my-8 h-px border-none' />,
          strong: ({ children }) => <strong className='text-GRAY_1000 font-semibold'>{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote className='border-GRAY_300 text-GRAY_900 mt-4 border-l-2 pl-4 first:mt-0'>
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
                <code className='bg-PINK_100 text-PINK_600 rounded-[3px] px-1 py-0.5 font-mono text-[12px] font-normal'>
                  {children}
                </code>
              );
            }

            const language = match?.[1];
            return (
              <div className='mt-5 pb-2 first:mt-0'>
                <div className='border-GRAY_300 overflow-hidden rounded-lg border'>
                  {language && (
                    <div className='border-GRAY_300 bg-BG_GRAY_2 text-GRAY_900 border-b px-4 py-1.5 font-mono text-[11px] font-medium tracking-normal'>
                      {language}
                    </div>
                  )}
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
                  className='bg-GRAY_1000 text-background ml-0.5 inline-flex cursor-pointer items-center rounded-md px-2 py-0.5 text-xs font-medium transition-all duration-150 hover:opacity-80 hover:shadow-md active:scale-[0.98]'
                >
                  {fileName}
                </span>
              );
            }

            return (
              <Link
                href={href}
                target='_blank'
                className='text-GREEN_800 underline decoration-green-300 underline-offset-2'
              >
                {children}
              </Link>
            );
          },
        }}
      >
        {displayedText}
      </ReactMarkdown>
    </div>
  );
};
