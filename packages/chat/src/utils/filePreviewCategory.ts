import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from '@zamp-platform/utils';

/** Supported file preview categories used to determine rendering strategy. */
export const FILE_PREVIEW_CATEGORY = {
  IMAGE: 'image',
  VIDEO: 'video',
  PDF: 'pdf',
  CODE: 'code',
  OTHER: 'other',
} as const;

/** Union type of all valid file preview category values. */
export type FilePreviewCategory = (typeof FILE_PREVIEW_CATEGORY)[keyof typeof FILE_PREVIEW_CATEGORY];

/** Extracts and normalizes a file extension from a filename or extension string */
const normalizeExtension = (input: string): string => {
  const lastDot = input.lastIndexOf('.');
  const ext = lastDot !== -1 ? input.slice(lastDot + 1) : input;
  return ext.toLowerCase().trim();
};

/** Set view of {@link IMAGE_EXTENSIONS} for O(1) lookups. */
const IMAGE_EXTENSIONS_SET = new Set<string>(IMAGE_EXTENSIONS);

/** Set view of {@link VIDEO_EXTENSIONS} for O(1) lookups. */
const VIDEO_EXTENSIONS_SET = new Set<string>(VIDEO_EXTENSIONS);

/** File extensions treated as source code for preview highlighting. */
const CODE_EXTENSIONS = new Set([
  'js',
  'jsx',
  'ts',
  'tsx',
  'py',
  'java',
  'go',
  'rs',
  'cpp',
  'c',
  'cs',
  'rb',
  'php',
  'swift',
  'kt',
  'scala',
  'sql',
  'html',
  'css',
  'scss',
  'less',
  'json',
  'yaml',
  'yml',
  'toml',
  'xml',
  'sh',
  'bash',
  'zsh',
  'md',
  'txt',
  'env',
  'ini',
  'cfg',
  'conf',
  'vue',
  'svelte',
  'lua',
  'r',
  'dart',
  'zig',
  'ex',
  'exs',
  'erl',
  'hs',
  'ml',
  'dockerfile',
  'makefile',
  'cmake',
  'gradle',
  'graphql',
  'proto',
]);

/** Maps a file extension to lowlight-compatible language identifiers */
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  java: 'java',
  go: 'go',
  rs: 'rust',
  cpp: 'cpp',
  c: 'c',
  cs: 'csharp',
  rb: 'ruby',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  scala: 'scala',
  sql: 'sql',
  html: 'xml',
  css: 'css',
  scss: 'scss',
  less: 'less',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'ini',
  xml: 'xml',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  md: 'markdown',
  lua: 'lua',
  r: 'r',
  dart: 'dart',
  graphql: 'graphql',
};

/**
 * Determines the preview category for a file based on its extension.
 *
 * @param fileName - The file name (or path) to classify.
 * @returns The resolved {@link FilePreviewCategory}.
 */
export const getFilePreviewCategory = (fileName: string): FilePreviewCategory => {
  const ext = normalizeExtension(fileName);

  if (IMAGE_EXTENSIONS_SET.has(ext)) return FILE_PREVIEW_CATEGORY.IMAGE;
  if (VIDEO_EXTENSIONS_SET.has(ext)) return FILE_PREVIEW_CATEGORY.VIDEO;
  if (ext === 'pdf') return FILE_PREVIEW_CATEGORY.PDF;
  if (CODE_EXTENSIONS.has(ext)) return FILE_PREVIEW_CATEGORY.CODE;
  return FILE_PREVIEW_CATEGORY.OTHER;
};

/**
 * Returns the lowlight-compatible language identifier for a given file name.
 *
 * @param fileName - The file name (or path) whose extension is looked up.
 * @returns The language identifier, or `undefined` if no mapping exists.
 */
export const getLanguageForExtension = (fileName: string): string | undefined => {
  const ext = normalizeExtension(fileName);
  return EXTENSION_TO_LANGUAGE[ext];
};
