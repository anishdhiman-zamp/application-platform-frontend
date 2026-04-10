import { useCallback, useEffect, useRef } from 'react';
import type {
  WorkerRequest,
  WorkerResponse,
} from 'modules/pace/components/file-viewer/viewers/spreadsheet/spreadsheet.worker';

type PendingResolve = {
  resolve: (value: WorkerResponse['payload']) => void;
  reject: (reason: Error) => void;
};

export function useSpreadsheetWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<number, PendingResolve>>(new Map());
  const idCounter = useRef(0);

  useEffect(() => {
    let objectUrl: string | null = null;

    const initWorker = async () => {
      const workerUrl = new URL('./spreadsheet.worker.ts', import.meta.url).toString();
      let worker: Worker;

      try {
        // Fetch the worker script and create a blob URL to work around cross-origin
        // restrictions when assets are served from a CDN (e.g. CloudFront on AWS).
        // Browsers block `new Worker(crossOriginUrl)` with a SecurityError, but a
        // blob: URL is always same-origin so it is allowed.
        const response = await fetch(workerUrl);
        const blob = await response.blob();

        objectUrl = URL.createObjectURL(blob);
        worker = new Worker(objectUrl);
      } catch {
        // Fallback for same-origin environments (local dev, Vercel) where the
        // direct URL already works.
        worker = new Worker(workerUrl);
      }

      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const { id, type, payload, error } = e.data;
        const pending = pendingRef.current.get(id);

        if (!pending) return;

        pendingRef.current.delete(id);

        if (type === 'error') {
          pending.reject(new Error(error ?? 'Worker error'));
        } else {
          pending.resolve(payload);
        }
      };

      worker.onerror = () => {
        pendingRef.current.forEach(({ reject }) => reject(new Error('Worker crashed')));
        pendingRef.current.clear();
        workerRef.current = null;
      };

      workerRef.current = worker;
    };

    initWorker();

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      pendingRef.current.forEach(({ reject }) => reject(new Error('Worker terminated')));
      pendingRef.current.clear();
    };
  }, []);

  const sendMessage = useCallback(
    (type: WorkerRequest['type'], payload: WorkerRequest['payload']): Promise<WorkerResponse['payload']> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'));

          return;
        }

        const id = ++idCounter.current;

        pendingRef.current.set(id, { resolve, reject });

        const message: WorkerRequest = { id, type, payload };

        if (payload.data instanceof ArrayBuffer) {
          workerRef.current.postMessage(message, [payload.data]);
        } else {
          workerRef.current.postMessage(message);
        }
      });
    },
    [],
  );

  const parse = useCallback(
    (data: ArrayBuffer | string, readType: 'array' | 'string') => {
      return sendMessage('parse', { data, readType });
    },
    [sendMessage],
  );

  const switchSheet = useCallback(
    (sheetName: string) => {
      return sendMessage('switchSheet', { sheetName });
    },
    [sendMessage],
  );

  return { parse, switchSheet };
}
