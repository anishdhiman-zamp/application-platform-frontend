const FILE_CREATED_EVENT = 'pace:file-created';

const pendingFiles = new Set<string>();

/**
 * Registers a file path as pending creation. The file viewer will defer
 * loading and polling until {@link dispatchFileCreated} is called for this path.
 */
export const markFileCreationPending = (path: string): void => {
  pendingFiles.add(path);
};

/**
 * Returns `true` if the given path has been marked as pending creation
 * via {@link markFileCreationPending} and has not yet been resolved.
 */
export const isFileCreationPending = (path: string): boolean => {
  return pendingFiles.has(path);
};

/**
 * Signals that the file at the given path has been created (or the creation
 * attempt has finished). Removes the path from the pending set and dispatches
 * a `pace:file-created` custom event so listeners can begin loading content.
 */
export const dispatchFileCreated = (path: string): void => {
  pendingFiles.delete(path);
  window.dispatchEvent(new CustomEvent(FILE_CREATED_EVENT, { detail: { path } }));
};

/**
 * Subscribes to the creation event for a specific file path. The callback
 * fires once {@link dispatchFileCreated} is called with a matching path.
 *
 * @returns A cleanup function that removes the event listener.
 */
export const onFileCreated = (path: string, callback: () => void): (() => void) => {
  const handler = (e: Event) => {
    if ((e as CustomEvent).detail?.path === path) {
      callback();
    }
  };

  window.addEventListener(FILE_CREATED_EVENT, handler);

  return () => window.removeEventListener(FILE_CREATED_EVENT, handler);
};
