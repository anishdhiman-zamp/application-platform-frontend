import { type Block, BLOCK_TYPE, type OutputFileType } from '@zamp-platform/chat';

export interface AgentOutputFileType {
  key: string;
  path: string;
  name: string;
}

const fileKey = (conversationId: string | null, file: OutputFileType): string => {
  const id = file?.s3_path || file?.filename;

  return `${conversationId ?? 'unknown'}::${id ?? ''}`;
};

/**
 * Walks a list of message-content blocks and returns each output file the
 * agent emitted, in document order. Skips files missing both `s3_path` and
 * `filename` so callers don't open empty tabs.
 */
export const collectOutputFiles = (
  elements: Block[] | undefined,
  conversationId: string | null,
): AgentOutputFileType[] => {
  if (!elements?.length) return [];

  const result: AgentOutputFileType[] = [];

  for (const element of elements) {
    if (element?.type !== BLOCK_TYPE.OUTPUT_FILES) continue;

    const files = element.payload?.output_files;

    if (!files?.length) continue;

    for (const file of files) {
      if (!file) continue;

      const path = file.s3_path || file.filename;
      const name = file.filename || file.s3_path;

      if (!path || !name) continue;

      result.push({ key: fileKey(conversationId, file), path, name });
    }
  }

  return result;
};
