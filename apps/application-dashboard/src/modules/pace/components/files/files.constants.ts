import {
  Clipboard,
  Copy,
  ExternalLink,
  FilePlus,
  FolderPlus,
  FolderUp,
  Pencil,
  Scissors,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  type ContextMenuAction,
  FILE_TYPE,
  type FileItem,
  type SortOption,
} from '@/modules/pace/components/files/file-tree.types';

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
} as const;

export const CONTEXT_MENU_ACTION_IDS = {
  CREATE_FILE: 'create-file',
  CREATE_FOLDER: 'create-folder',
  UPLOAD_FILE: 'upload-file',
  UPLOAD_FOLDER: 'upload-folder',
  OPEN_IN_TAB: 'open-in-tab',
  RENAME: 'rename',
  DUPLICATE: 'duplicate',
  COPY: 'copy',
  CUT: 'cut',
  PASTE: 'paste',
  DELETE: 'delete',
} as const;

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
  // { id: 'work-with-zamp', label: 'Work with Zamp', icon: Link },
  { id: CONTEXT_MENU_ACTION_IDS.RENAME, label: 'Rename', icon: Pencil },
  { id: CONTEXT_MENU_ACTION_IDS.DUPLICATE, label: 'Duplicate', icon: Copy },
  { id: CONTEXT_MENU_ACTION_IDS.COPY, label: 'Copy', icon: Copy },
  { id: CONTEXT_MENU_ACTION_IDS.CUT, label: 'Cut', icon: Scissors },
  { id: CONTEXT_MENU_ACTION_IDS.PASTE, label: 'Paste', icon: Clipboard, folderOnly: true },
  // { id: 'share', label: 'Share', icon: Share },
  // { id: 'download', label: 'Download', icon: Download },
  { id: CONTEXT_MENU_ACTION_IDS.DELETE, label: 'Delete', icon: Trash2, isDestructive: true },
];

// File types that can be edited with Monaco editor
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

export const MOCK_FILES: FileItem[] = [
  {
    path: 'Budget spreadsheet',
    name: 'Budget spreadsheet',
    type: FILE_TYPE.DIRECTORY,
    size: null,
    mtime_ms: 1771349214794,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/first_dance_song.mp3',
    name: 'first_dance_song.mp3',
    type: FILE_TYPE.FILE,
    size: 4500000,
    mtime_ms: 1771354001854,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/venue_options.md',
    name: 'venue_options.md',
    type: FILE_TYPE.FILE,
    size: 2048,
    mtime_ms: 1771354001843,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/guest_addresses.xlsx',
    name: 'guest_addresses.xlsx',
    type: FILE_TYPE.FILE,
    size: 15360,
    mtime_ms: 1771354001865,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/vendor_contacts.docx',
    name: 'vendor_contacts.docx',
    type: FILE_TYPE.FILE,
    size: 8192,
    mtime_ms: 1770790929081,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/rsvp_form.css',
    name: 'rsvp_form.css',
    type: FILE_TYPE.FILE,
    size: 1024,
    mtime_ms: 1770816275272,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/rsvp_form.html',
    name: 'rsvp_form.html',
    type: FILE_TYPE.FILE,
    size: 2048,
    mtime_ms: 1770816275770,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/Guest list',
    name: 'Guest list',
    type: FILE_TYPE.DIRECTORY,
    size: null,
    mtime_ms: 1770816275290,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/Guest list/ceremony_songs.zip',
    name: 'ceremony_songs.zip',
    type: FILE_TYPE.FILE,
    size: 52428800,
    mtime_ms: 1770986876296,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/Guest list/Flowers',
    name: 'Flowers',
    type: FILE_TYPE.DIRECTORY,
    size: null,
    mtime_ms: 1770986877373,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/Guest list/Flowers/dress_inspiration.mp4',
    name: 'dress_inspiration.mp4',
    type: FILE_TYPE.FILE,
    size: 104857600,
    mtime_ms: 1770986876590,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/Guest list/Flowers/bouquet_design.psd',
    name: 'bouquet_design.psd',
    type: FILE_TYPE.FILE,
    size: 25600000,
    mtime_ms: 1770986877100,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/Guest list/Flowers/flower_arrangement.png',
    name: 'flower_arrangement.png',
    type: FILE_TYPE.FILE,
    size: 2048000,
    mtime_ms: 1770986877200,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/seating_chart.pdf',
    name: 'seating_chart.pdf',
    type: FILE_TYPE.FILE,
    size: 512000,
    mtime_ms: 1771354002000,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/wedding_timeline.json',
    name: 'wedding_timeline.json',
    type: FILE_TYPE.FILE,
    size: 4096,
    mtime_ms: 1771354002100,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/invitation_template.svg',
    name: 'invitation_template.svg',
    type: FILE_TYPE.FILE,
    size: 8192,
    mtime_ms: 1771354002200,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/Scripts',
    name: 'Scripts',
    type: FILE_TYPE.DIRECTORY,
    size: null,
    mtime_ms: 1771354002300,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/Scripts/rsvp_handler.py',
    name: 'rsvp_handler.py',
    type: FILE_TYPE.FILE,
    size: 3072,
    mtime_ms: 1771354002400,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/Scripts/email_sender.ts',
    name: 'email_sender.ts',
    type: FILE_TYPE.FILE,
    size: 2560,
    mtime_ms: 1771354002500,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/Scripts/database_backup.sql',
    name: 'database_backup.sql',
    type: FILE_TYPE.FILE,
    size: 102400,
    mtime_ms: 1771354002600,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/config.yaml',
    name: 'config.yaml',
    type: FILE_TYPE.FILE,
    size: 1536,
    mtime_ms: 1771354002700,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/ceremony_photos.rar',
    name: 'ceremony_photos.rar',
    type: FILE_TYPE.FILE,
    size: 157286400,
    mtime_ms: 1771354002800,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/speech_notes.txt',
    name: 'speech_notes.txt',
    type: FILE_TYPE.FILE,
    size: 2048,
    mtime_ms: 1771354002900,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/wedding_logo.ai',
    name: 'wedding_logo.ai',
    type: FILE_TYPE.FILE,
    size: 5120000,
    mtime_ms: 1771354003000,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/background_music.wav',
    name: 'background_music.wav',
    type: FILE_TYPE.FILE,
    size: 45000000,
    mtime_ms: 1771354003100,
    owner: 'user',
  },
  {
    path: 'Budget spreadsheet/venue_3d_model.gltf',
    name: 'venue_3d_model.gltf',
    type: FILE_TYPE.FILE,
    size: 8500000,
    mtime_ms: 1771354003200,
    owner: 'user',
  },
];
