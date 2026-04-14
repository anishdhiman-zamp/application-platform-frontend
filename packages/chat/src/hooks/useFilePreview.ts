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

/** Data returned by {@link useFilePreview} describing the resolved preview state. */
export interface FilePreviewData {
  /** The detected file category (image, video, code, pdf, or generic). */
  category: FilePreviewCategory;
  /** A blob or server URL for the visual preview, or `null` if unavailable. */
  previewUrl: string | null;
  /** Syntax-highlighted React nodes for code files, or `null` for other categories. */
  codeNodes: ReactNode | null;
  /** Whether the preview is still being generated. */
  isLoading: boolean;
}

/**
 * Recursively converts a HAST (HTML Abstract Syntax Tree) node array into React elements.
 *
 * @param nodes - The HAST child nodes to convert.
 * @param keyPrefix - A prefix used to generate stable React keys for each element.
 * @returns An array of React nodes representing the HAST tree.
 */
const hastToReact = (nodes: RootContent[], keyPrefix = 'fp'): ReactNode[] =>
  nodes.map((node, i) => {
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

/**
 * Applies syntax highlighting to a code string using lowlight.
 *
 * Falls back to auto-detection when the language is unspecified or unregistered,
 * and returns the raw string if highlighting fails entirely.
 *
 * @param code - The source code text to highlight.
 * @param language - An optional lowlight-registered language identifier.
 * @returns React nodes with syntax-highlighting spans, or the plain text on failure.
 */
const highlightCode = (code: string, language?: string): ReactNode => {
  try {
    const tree =
      language && lowlightInstance.registered(language)
        ? lowlightInstance.highlight(language, code)
        : lowlightInstance.highlightAuto(code);
    return hastToReact(tree.children as RootContent[]);
  } catch {
    return code;
  }
};

/**
 * Truncates text to a maximum number of lines.
 *
 * @param text - The input text to truncate.
 * @param maxLines - The maximum number of lines to keep.
 * @returns The truncated text containing at most {@link maxLines} lines.
 */
const truncateToLines = (text: string, maxLines: number): string => {
  const lines = text.split('\n');
  return lines.slice(0, maxLines).join('\n');
};

/**
 * Generates a rich preview for an uploaded file reference.
 *
 * Based on the file extension the hook determines a {@link FilePreviewCategory}
 * and asynchronously produces the appropriate preview:
 * - **Image** — creates a blob URL or falls back to the server URL.
 * - **Video** — captures the first visible frame as a JPEG thumbnail.
 * - **Code** — reads the first {@link MAX_CODE_BYTES} bytes and applies syntax highlighting.
 * - **PDF** — renders the first page to a canvas and converts it to a JPEG thumbnail.
 *
 * All generated blob URLs are automatically revoked on unmount.
 *
 * @param fileReference - The uploaded file metadata (name, path, and optional raw `File` object).
 * @returns A {@link FilePreviewData} object with the resolved preview state.
 */
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

/**
 * Renders the first page of a PDF to an off-screen canvas and returns a JPEG blob URL.
 *
 * Uses `pdfjs-dist` (dynamically imported) to parse the document and render at 2× scale.
 *
 * @param src - A URL or blob URL pointing to the PDF document.
 * @returns A blob URL for the JPEG thumbnail of the first page.
 * @throws If the PDF cannot be loaded or the canvas conversion fails.
 */
const capturePdfPage = async (src: string): Promise<string> => {
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
};

/**
 * Captures a single frame from a video and returns it as a JPEG blob URL.
 *
 * Creates an off-screen `<video>` element, seeks to 0.1 s, draws the frame
 * onto a canvas, and converts the result to a JPEG blob. Times out after
 * {@link VIDEO_CAPTURE_TIMEOUT_MS} milliseconds.
 *
 * @param src - A URL or blob URL pointing to the video source.
 * @returns A blob URL for the captured JPEG frame.
 * @throws If the video fails to load, the canvas context is unavailable, or the operation times out.
 */
const captureVideoFrame = (src: string): Promise<string> =>
  new Promise((resolve, reject) => {
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
