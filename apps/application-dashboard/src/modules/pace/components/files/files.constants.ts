import {
  Clipboard,
  Copy,
  Download,
  ExternalLink,
  FilePlus,
  FolderPlus,
  FolderUp,
  Pencil,
  Scissors,
  Trash2,
  Upload,
} from 'lucide-react';
import { type ContextMenuAction, type SortOption } from '@/modules/pace/components/files/file-tree.types';

export const DATE_FORMAT = "EEEE, d MMMM yyyy 'at' h:mm a";

export const DIRECT_UPLOAD_THRESHOLD_BYTES = 1 * 1024 * 1024; // 1MB
export const DEFAULT_CHUNK_SIZE = 6 * 1024 * 1024; // 6MB chunk size
export const PARALLEL_CHUNK_CONCURRENCY = 6; // Upload 6 chunks in parallel
export const MAX_CHUNK_RETRIES = 3; // Retry failed chunks up to 3 times
export const MAX_FOLDER_UPLOAD_FILES = 200;

export const FILE_TOAST_MESSAGES = {
  CANNOT_RENAME_PROTECTED: 'Cannot rename protected folders',
  CANNOT_DELETE_PROTECTED: 'Cannot delete protected folders',
  CANNOT_CUT_PROTECTED: 'Cannot cut protected folders',
  CANNOT_PASTE_INTO_ITSELF: 'Cannot paste a folder into itself',
  CANNOT_MOVE_PROTECTED: 'Cannot move protected folders',
  CANNOT_MOVE_PROTECTED_INTO_EACH_OTHER: 'Cannot move protected folders into each other',
  FAILED_TO_CREATE_ITEM: 'Failed to create item',
  FAILED_TO_RENAME: 'Failed to rename',
  FAILED_TO_MOVE_COPY: 'Failed to move/copy',
  FAILED_TO_RESOLVE_CONFLICT: 'Failed to resolve conflict',
  FAILED_TO_SAVE_FILE: 'Failed to save file',
  FAILED_TO_DELETE_FILE: 'Failed to delete file',
  FILE_DELETED: 'File deleted',
  FOLDER_DELETED: 'Folder deleted',
} as const;

export const CONTEXT_MENU_ACTION_IDS = {
  CREATE_FILE: 'create-file',
  CREATE_FOLDER: 'create-folder',
  UPLOAD_FILE: 'upload-file',
  UPLOAD_FOLDER: 'upload-folder',
  OPEN_IN_TAB: 'open-in-tab',
  DOWNLOAD: 'download',
  RENAME: 'rename',
  DUPLICATE: 'duplicate',
  COPY: 'copy',
  CUT: 'cut',
  PASTE: 'paste',
  DELETE: 'delete',
} as const;

export const FILE_VIEWER_HEADER_ACTION_IDS = {
  DOWNLOAD: 'download',
  DELETE: 'delete',
} as const;

export const SAVE_STATUS = {
  IDLE: 'idle',
  SAVING: 'saving',
  SAVED: 'saved',
} as const;

export type SaveStatus = (typeof SAVE_STATUS)[keyof typeof SAVE_STATUS];

export type FileViewerHeaderActionId =
  (typeof FILE_VIEWER_HEADER_ACTION_IDS)[keyof typeof FILE_VIEWER_HEADER_ACTION_IDS];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date_modified', label: 'Date modified' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
  { value: 'type', label: 'Type' },
];

export const CONTEXT_MENU_ACTIONS: ContextMenuAction[] = [
  { id: CONTEXT_MENU_ACTION_IDS.CREATE_FILE, label: 'Create File', icon: FilePlus, folderOnly: true },
  { id: CONTEXT_MENU_ACTION_IDS.CREATE_FOLDER, label: 'Create Folder', icon: FolderPlus, folderOnly: true },
  { id: CONTEXT_MENU_ACTION_IDS.UPLOAD_FILE, label: 'Upload File', icon: Upload, folderOnly: true },
  { id: CONTEXT_MENU_ACTION_IDS.UPLOAD_FOLDER, label: 'Upload Folder', icon: FolderUp, folderOnly: true },
  { id: CONTEXT_MENU_ACTION_IDS.OPEN_IN_TAB, label: 'Open in Tab', icon: ExternalLink, fileOnly: true },
  { id: CONTEXT_MENU_ACTION_IDS.DOWNLOAD, label: 'Download', icon: Download, fileOnly: true },
  { id: CONTEXT_MENU_ACTION_IDS.RENAME, label: 'Rename', icon: Pencil },
  { id: CONTEXT_MENU_ACTION_IDS.DUPLICATE, label: 'Duplicate', icon: Copy },
  { id: CONTEXT_MENU_ACTION_IDS.COPY, label: 'Copy', icon: Copy },
  { id: CONTEXT_MENU_ACTION_IDS.CUT, label: 'Cut', icon: Scissors },
  { id: CONTEXT_MENU_ACTION_IDS.PASTE, label: 'Paste', icon: Clipboard, folderOnly: true },
  { id: CONTEXT_MENU_ACTION_IDS.DELETE, label: 'Delete', icon: Trash2, isDestructive: true },
];

export const FILE_VIEWER_HEADER_ACTIONS: ContextMenuAction[] = [
  { id: FILE_VIEWER_HEADER_ACTION_IDS.DOWNLOAD, label: 'Download', icon: Download },
  { id: FILE_VIEWER_HEADER_ACTION_IDS.DELETE, label: 'Delete', icon: Trash2, isDestructive: true },
];

// File categories for viewer selection
export const FILE_CATEGORY = {
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  PDF: 'pdf',
  MARKDOWN: 'markdown',
  CODE: 'code',
  UNKNOWN: 'unknown',
} as const;

export type FileCategory = (typeof FILE_CATEGORY)[keyof typeof FILE_CATEGORY];

export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'] as const;

export const AUDIO_EXTENSIONS = ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'wma', 'aiff'] as const;

export const VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv', 'm4v'] as const;

export const PDF_EXTENSIONS = ['pdf'] as const;

export const MARKDOWN_EXTENSIONS = ['md', 'mdx'] as const;

export const EXTENSION_TO_MONACO_LANGUAGE: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  rb: 'ruby',
  php: 'php',
  java: 'java',
  kt: 'kotlin',
  swift: 'swift',
  go: 'go',
  rs: 'rust',
  c: 'c',
  cpp: 'cpp',
  cs: 'csharp',
  r: 'r',
  scala: 'scala',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'scss',
  less: 'less',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
  toml: 'toml',
  ini: 'ini',
  env: 'plaintext',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  ps1: 'powershell',
  bat: 'bat',
  sql: 'sql',
  graphql: 'graphql',
  prisma: 'prisma',
  md: 'markdown',
  mdx: 'markdown',
  txt: 'plaintext',
  csv: 'plaintext',
  vue: 'vue',
  svelte: 'svelte',
};

export const MONACO_EDITABLE_EXTENSIONS = [
  // Plain text & Markdown
  'txt',
  'md',
  'mdx',
  // Web
  'html',
  'css',
  'scss',
  'sass',
  'less',
  'js',
  'jsx',
  'ts',
  'tsx',
  'vue',
  'svelte',
  // Backend
  'py',
  'rb',
  'php',
  'java',
  'kt',
  'swift',
  'go',
  'rs',
  'c',
  'cpp',
  'cs',
  'r',
  'scala',
  // Config
  'json',
  'yaml',
  'yml',
  'xml',
  'toml',
  'ini',
  'env',
  // Shell
  'sh',
  'bash',
  'zsh',
  'ps1',
  'bat',
  // Database
  'sql',
  'graphql',
  'prisma',
  // Data
  'csv',
] as const;

export const MONACO_FILE_TYPE_OPTIONS: { label: string; value: string }[] = MONACO_EDITABLE_EXTENSIONS.map((ext) => ({
  label: `.${ext}`,
  value: ext,
}));

export const FILE_TYPE_LABELS: Record<string, string> = {
  // Documents
  PDF: 'PDF file',
  DOC: 'Word document',
  DOCX: 'Word document',
  XLS: 'Excel spreadsheet',
  XLSX: 'Excel spreadsheet',
  PPT: 'PowerPoint presentation',
  PPTX: 'PowerPoint presentation',
  ODT: 'OpenDocument text',
  ODS: 'OpenDocument spreadsheet',
  ODP: 'OpenDocument presentation',
  RTF: 'Rich text file',
  TXT: 'Text file',
  CSV: 'CSV file',

  // Code - Web
  HTML: 'HTML file',
  HTM: 'HTML file',
  CSS: 'CSS file',
  SCSS: 'SCSS file',
  SASS: 'Sass file',
  LESS: 'Less file',
  JS: 'JavaScript file',
  JSX: 'JSX file',
  TS: 'TypeScript file',
  TSX: 'TSX file',
  VUE: 'Vue file',
  SVELTE: 'Svelte file',

  // Code - Backend
  PY: 'Python file',
  RB: 'Ruby file',
  PHP: 'PHP file',
  JAVA: 'Java file',
  KT: 'Kotlin file',
  SWIFT: 'Swift file',
  GO: 'Go file',
  RS: 'Rust file',
  C: 'C file',
  CPP: 'C++ file',
  CS: 'C# file',
  R: 'R file',
  SCALA: 'Scala file',

  // Code - Config
  JSON: 'JSON file',
  YAML: 'YAML file',
  YML: 'YAML file',
  XML: 'XML file',
  TOML: 'TOML file',
  INI: 'INI file',
  ENV: 'Environment file',

  // Code - Shell
  SH: 'Shell script',
  BASH: 'Bash script',
  ZSH: 'Zsh script',
  PS1: 'PowerShell script',
  BAT: 'Batch file',

  // Code - Database
  SQL: 'SQL file',
  GRAPHQL: 'GraphQL file',
  PRISMA: 'Prisma file',

  // Markdown & Docs
  MD: 'Markdown file',
  MDX: 'MDX file',
  RST: 'reStructuredText file',
  TEX: 'LaTeX file',

  // Images
  PNG: 'PNG image',
  JPG: 'JPEG image',
  JPEG: 'JPEG image',
  GIF: 'GIF image',
  WEBP: 'WebP image',
  BMP: 'Bitmap image',
  ICO: 'Icon file',
  SVG: 'SVG image',
  PSD: 'Photoshop file',
  AI: 'Illustrator file',
  EPS: 'EPS file',
  FIG: 'Figma file',
  SKETCH: 'Sketch file',
  XD: 'Adobe XD file',

  // Video
  MP4: 'MP4 video',
  MOV: 'QuickTime video',
  AVI: 'AVI video',
  MKV: 'MKV video',
  WEBM: 'WebM video',
  WMV: 'WMV video',
  FLV: 'Flash video',
  M4V: 'M4V video',

  // Audio
  MP3: 'MP3 audio',
  WAV: 'WAV audio',
  FLAC: 'FLAC audio',
  AAC: 'AAC audio',
  M4A: 'M4A audio',
  OGG: 'OGG audio',
  WMA: 'WMA audio',
  AIFF: 'AIFF audio',
  MID: 'MIDI file',
  MIDI: 'MIDI file',

  // Archives
  ZIP: 'ZIP archive',
  RAR: 'RAR archive',
  '7Z': '7-Zip archive',
  TAR: 'TAR archive',
  GZ: 'Gzip archive',
  BZ2: 'Bzip2 archive',
  XZ: 'XZ archive',

  // Fonts
  TTF: 'TrueType font',
  OTF: 'OpenType font',
  WOFF: 'Web font',
  WOFF2: 'Web font',
  EOT: 'Embedded font',

  // Executables
  EXE: 'Windows executable',
  MSI: 'Windows installer',
  DMG: 'macOS disk image',
  APP: 'macOS application',
  DEB: 'Debian package',
  RPM: 'RPM package',
  APK: 'Android package',
  IPA: 'iOS application',

  // 3D & CAD
  OBJ: '3D object file',
  FBX: 'FBX file',
  STL: 'STL file',
  GLTF: 'glTF file',
  GLB: 'GLB file',
  BLEND: 'Blender file',
  DWG: 'AutoCAD file',

  // Ebooks
  EPUB: 'EPUB ebook',
  MOBI: 'Kindle ebook',
  AZW: 'Kindle ebook',

  // Special/System
  GITIGNORE: 'Git ignore file',
  DOCKERFILE: 'Dockerfile',
  LOCK: 'Lock file',
  LOG: 'Log file',
  LICENSE: 'License file',
};
