import { FILE_TYPE, type FileItem } from 'modules/pace/components/files/file-tree.types';

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
  },
  {
    path: 'Budget spreadsheet/first_dance_song.mp3',
    name: 'first_dance_song.mp3',
    type: FILE_TYPE.FILE,
    size: 4500000,
    mtime_ms: 1771354001854,
  },
  {
    path: 'Budget spreadsheet/venue_options.md',
    name: 'venue_options.md',
    type: FILE_TYPE.FILE,
    size: 2048,
    mtime_ms: 1771354001843,
  },
  {
    path: 'Budget spreadsheet/guest_addresses.xlsx',
    name: 'guest_addresses.xlsx',
    type: FILE_TYPE.FILE,
    size: 15360,
    mtime_ms: 1771354001865,
  },
  {
    path: 'Budget spreadsheet/vendor_contacts.docx',
    name: 'vendor_contacts.docx',
    type: FILE_TYPE.FILE,
    size: 8192,
    mtime_ms: 1770790929081,
  },
  {
    path: 'Budget spreadsheet/rsvp_form.css',
    name: 'rsvp_form.css',
    type: FILE_TYPE.FILE,
    size: 1024,
    mtime_ms: 1770816275272,
  },
  {
    path: 'Budget spreadsheet/rsvp_form.html',
    name: 'rsvp_form.html',
    type: FILE_TYPE.FILE,
    size: 2048,
    mtime_ms: 1770816275770,
  },
  {
    path: 'Budget spreadsheet/Guest list',
    name: 'Guest list',
    type: FILE_TYPE.DIRECTORY,
    size: null,
    mtime_ms: 1770816275290,
  },
  {
    path: 'Budget spreadsheet/Guest list/ceremony_songs.zip',
    name: 'ceremony_songs.zip',
    type: FILE_TYPE.FILE,
    size: 52428800,
    mtime_ms: 1770986876296,
  },
  {
    path: 'Budget spreadsheet/Guest list/Flowers',
    name: 'Flowers',
    type: FILE_TYPE.DIRECTORY,
    size: null,
    mtime_ms: 1770986877373,
  },
  {
    path: 'Budget spreadsheet/Guest list/Flowers/dress_inspiration.mp4',
    name: 'dress_inspiration.mp4',
    type: FILE_TYPE.FILE,
    size: 104857600,
    mtime_ms: 1770986876590,
  },
];
