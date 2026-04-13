import type { RootContent } from 'hast';
import { common, createLowlight } from 'lowlight';
import { createElement, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { UploadedFileType } from '../types/block.types';
import {
  FILE_PREVIEW_CATEGORY,
  type FilePreviewCategory,
  getFilePreviewCategory,
  getLanguageForExtension,
} from '../utils/filePreviewCategory';
import { getFilePreviewUrl } from '../utils/filePreviewUrl';

const lowlightInstance = createLowlight(common);

const MAX_CODE_BYTES = 1000;
const MAX_CODE_LINES = 5;
const VIDEO_CAPTURE_TIMEOUT_MS = 5000;

export interface FilePreviewData {
  category: FilePreviewCategory;
  previewUrl: string | null;
  codeNodes: ReactNode | null;
  isLoading: boolean;
}

function hastToReact(nodes: RootContent[], keyPrefix = 'fp'): ReactNode[] {
  return nodes.map((node, i) => {
    if (node.type === 'text') return node.value;
    if (node.type === 'element') {
      const className = (node.properties?.className as string[])?.join(' ');
      return createElement(
        node.tagName,
        { key: `${keyPrefix}-${i}`, ...(className ? { className } : {}) },
        node.children ? hastToReact(node.children as RootContent[], `${keyPrefix}-${i}`) : null,
      );
    }
    return null;
  });
}

function highlightCode(code: string, language?: string): ReactNode {
  try {
    const tree =
      language && lowlightInstance.registered(language)
        ? lowlightInstance.highlight(language, code)
        : lowlightInstance.highlightAuto(code);
    return hastToReact(tree.children as RootContent[]);
  } catch {
    return code;
  }
}

function truncateToLines(text: string, maxLines: number): string {
  const lines = text.split('\n');
  return lines.slice(0, maxLines).join('\n');
}

export const useFilePreview = (fileReference: UploadedFileType): FilePreviewData => {
  const fileRefRef = useRef(fileReference);
  fileRefRef.current = fileReference;

  const category = getFilePreviewCategory(fileReference.name);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [codeNodes, setCodeNodes] = useState<ReactNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const blobUrlRef = useRef<string | null>(null);

  const generatePreview = useCallback(async () => {
    const { path, name, file: rawFile } = fileRefRef.current;
    // Treat empty File objects (from addFileReference) as absent so we fall back to server URL
    const file = rawFile?.size ? rawFile : undefined;

    switch (category) {
      case FILE_PREVIEW_CATEGORY.IMAGE: {
        if (file) {
          const url = URL.createObjectURL(file);
          blobUrlRef.current = url;
          setPreviewUrl(url);
        } else if (path) {
          setPreviewUrl(getFilePreviewUrl(path));
        }
        setIsLoading(false);
        break;
      }

      case FILE_PREVIEW_CATEGORY.VIDEO: {
        let videoSrc: string | null = null;
        if (file) {
          videoSrc = URL.createObjectURL(file);
          blobUrlRef.current = videoSrc;
        } else if (path) {
          // Fetch as blob to avoid CORS-tainted canvas when capturing a frame
          try {
            const res = await fetch(getFilePreviewUrl(path), { credentials: 'include' });
            const blob = await res.blob();
            videoSrc = URL.createObjectURL(blob);
            blobUrlRef.current = videoSrc;
          } catch {
            // Failed to fetch video — fallback to file icon
          }
        }

        if (videoSrc) {
          try {
            const thumbnailUrl = await captureVideoFrame(videoSrc);
            if (blobUrlRef.current === videoSrc) {
              URL.revokeObjectURL(videoSrc);
            }
            blobUrlRef.current = thumbnailUrl;
            setPreviewUrl(thumbnailUrl);
          } catch {
            // Failed to capture frame — fallback to no preview
          }
        }
        setIsLoading(false);
        break;
      }

      case FILE_PREVIEW_CATEGORY.CODE: {
        try {
          let text: string;

          if (file) {
            const slice = file.slice(0, MAX_CODE_BYTES);
            text = await slice.text();
          } else if (path) {
            const res = await fetch(getFilePreviewUrl(path), {
              credentials: 'include',
              headers: { Range: `bytes=0-${MAX_CODE_BYTES}` },
            });
            text = await res.text();
          } else {
            setIsLoading(false);
            break;
          }

          const truncated = truncateToLines(text, MAX_CODE_LINES);
          const language = getLanguageForExtension(name);
          const nodes = highlightCode(truncated, language);
          setCodeNodes(nodes);
        } catch {
          // Failed to read code — fallback to file icon
        }
        setIsLoading(false);
        break;
      }

      case FILE_PREVIEW_CATEGORY.PDF: {
        const pdfSrc = file ? URL.createObjectURL(file) : path ? getFilePreviewUrl(path) : null;
        if (!pdfSrc) {
          setIsLoading(false);
          break;
        }

        if (file) blobUrlRef.current = pdfSrc;

        try {
          const thumbnailUrl = await capturePdfPage(pdfSrc);
          if (file && blobUrlRef.current === pdfSrc) {
            URL.revokeObjectURL(pdfSrc);
          }
          blobUrlRef.current = thumbnailUrl;
          setPreviewUrl(thumbnailUrl);
        } catch {
          // Failed to capture PDF page — fallback to file icon
        }
        setIsLoading(false);
        break;
      }

      default: {
        setIsLoading(false);
        break;
      }
    }
  }, [category]);

  useEffect(() => {
    generatePreview();

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [generatePreview]);

  return { category, previewUrl, codeNodes, isLoading };
};

async function capturePdfPage(src: string): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

  const pdf = await pdfjsLib.getDocument({ url: src, withCredentials: true }).promise;
  const page = await pdf.getPage(1);

  const scale = 2;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvas, viewport }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(URL.createObjectURL(blob));
        else reject(new Error('Canvas toBlob returned null'));
      },
      'image/jpeg',
      0.85,
    );
  });
}

function captureVideoFrame(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'use-credentials';
    video.muted = true;
    video.preload = 'metadata';

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Video frame capture timed out'));
    }, VIDEO_CAPTURE_TIMEOUT_MS);

    const cleanup = () => {
      clearTimeout(timeout);
      video.removeAttribute('src');
      video.load();
    };

    video.addEventListener(
      'loadeddata',
      () => {
        video.currentTime = 0.1;
      },
      { once: true },
    );

    video.addEventListener(
      'seeked',
      () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            cleanup();
            reject(new Error('Canvas context unavailable'));
            return;
          }
          ctx.drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            cleanup();
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error('Canvas toBlob returned null'));
            }
          }, 'image/jpeg');
        } catch (e) {
          cleanup();
          reject(e);
        }
      },
      { once: true },
    );

    video.addEventListener(
      'error',
      () => {
        cleanup();
        reject(new Error('Video load failed'));
      },
      { once: true },
    );

    video.src = src;
  });
}
