import { type Block, BLOCK_TYPE } from '@zamp-platform/chat';
import { collectOutputFiles } from '@/modules/pace/agent-files.utils';

const outputFilesBlock = (files: { filename: string; s3_path: string; file_type?: string }[], order = 0): Block =>
  ({
    id: `block-${order}`,
    order,
    type: BLOCK_TYPE.OUTPUT_FILES,
    payload: { output_files: files.map((f) => ({ file_type: 'md', ...f })) },
  }) as Block;

const textBlock: Block = {
  id: 'text-1',
  order: 0,
  type: BLOCK_TYPE.TEXT,
  is_complete: true,
  payload: { text: 'Hello' },
};

describe('collectOutputFiles', () => {
  it('returns empty for undefined or empty inputs', () => {
    expect(collectOutputFiles(undefined, 'c1')).toEqual([]);
    expect(collectOutputFiles([], 'c1')).toEqual([]);
  });

  it('skips non-output-file blocks', () => {
    expect(collectOutputFiles([textBlock], 'c1')).toEqual([]);
  });

  it('extracts files in document order across multiple blocks', () => {
    const elements: Block[] = [
      outputFilesBlock([{ filename: 'a.md', s3_path: 'workspace/a.md' }], 1),
      textBlock,
      outputFilesBlock(
        [
          { filename: 'b.md', s3_path: 'workspace/b.md' },
          { filename: 'c.md', s3_path: 'workspace/c.md' },
        ],
        3,
      ),
    ];

    expect(collectOutputFiles(elements, 'c1')).toEqual([
      { key: 'c1::workspace/a.md', path: 'workspace/a.md', name: 'a.md' },
      { key: 'c1::workspace/b.md', path: 'workspace/b.md', name: 'b.md' },
      { key: 'c1::workspace/c.md', path: 'workspace/c.md', name: 'c.md' },
    ]);
  });

  it('namespaces keys by conversationId so the same path in different convos is distinct', () => {
    const elements: Block[] = [outputFilesBlock([{ filename: 'a.md', s3_path: 'workspace/a.md' }])];

    expect(collectOutputFiles(elements, 'c1')[0].key).toBe('c1::workspace/a.md');
    expect(collectOutputFiles(elements, 'c2')[0].key).toBe('c2::workspace/a.md');
  });

  it('falls back to filename when s3_path is missing', () => {
    const elements: Block[] = [outputFilesBlock([{ filename: 'only-name.md', s3_path: '' }])];

    expect(collectOutputFiles(elements, 'c1')).toEqual([
      { key: 'c1::only-name.md', path: 'only-name.md', name: 'only-name.md' },
    ]);
  });

  it('skips entries that have neither path nor filename', () => {
    const elements: Block[] = [outputFilesBlock([{ filename: '', s3_path: '' }])];

    expect(collectOutputFiles(elements, 'c1')).toEqual([]);
  });

  it('treats null conversationId as the literal "unknown" namespace', () => {
    const elements: Block[] = [outputFilesBlock([{ filename: 'a.md', s3_path: 'workspace/a.md' }])];

    expect(collectOutputFiles(elements, null)[0].key).toBe('unknown::workspace/a.md');
  });

  it('ignores OUTPUT_FILES blocks with empty file lists', () => {
    const elements: Block[] = [outputFilesBlock([])];

    expect(collectOutputFiles(elements, 'c1')).toEqual([]);
  });
});
