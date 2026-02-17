/**
 * File extension to color mapping for file icons
 * Colors are based on official brand colors or commonly associated colors for each file type
 */
export const FILE_EXTENSION_COLORS: Record<string, string> = {
  // Documents
  pdf: '#E53935',
  doc: '#2B579A',
  docx: '#2B579A',
  xls: '#217346',
  xlsx: '#217346',
  ppt: '#D24726',
  pptx: '#D24726',
  odt: '#0066B3',
  ods: '#0066B3',
  odp: '#0066B3',
  rtf: '#6A1B9A',
  txt: '#607D8B',
  csv: '#4CAF50',

  // Code - Web
  html: '#E34C26',
  htm: '#E34C26',
  css: '#264DE4',
  scss: '#CD6799',
  sass: '#CD6799',
  less: '#1D365D',
  js: '#B8A000',
  jsx: '#61DAFB',
  ts: '#3178C6',
  tsx: '#3178C6',
  vue: '#42B883',
  svelte: '#FF3E00',

  // Code - Backend
  py: '#3776AB',
  rb: '#CC342D',
  php: '#777BB4',
  java: '#007396',
  kt: '#7F52FF',
  swift: '#FA7343',
  go: '#00ADD8',
  rs: '#DEA584',
  c: '#A8B9CC',
  cpp: '#00599C',
  cs: '#512BD4',
  r: '#276DC3',
  scala: '#DC322F',

  // Code - Config
  json: '#292929',
  yaml: '#CB171E',
  yml: '#CB171E',
  xml: '#F26522',
  toml: '#9C4121',
  ini: '#6D8086',
  env: '#ECD53F',

  // Code - Shell
  sh: '#4EAA25',
  bash: '#4EAA25',
  zsh: '#4EAA25',
  ps1: '#012456',
  bat: '#5E7A00',

  // Code - Database
  sql: '#336791',
  graphql: '#E10098',
  prisma: '#2D3748',

  // Markdown & Docs
  md: '#083FA1',
  mdx: '#B87800',
  rst: '#141414',
  tex: '#3D6117',

  // Images
  png: '#26A69A',
  jpg: '#26A69A',
  jpeg: '#26A69A',
  gif: '#26A69A',
  webp: '#26A69A',
  bmp: '#26A69A',
  ico: '#26A69A',
  svg: '#FFB13B',
  psd: '#31A8FF',
  ai: '#FF9A00',
  eps: '#FF9A00',
  fig: '#A259FF',
  sketch: '#F7B500',
  xd: '#FF61F6',

  // Video
  mp4: '#9C27B0',
  mov: '#7B1FA2',
  avi: '#673AB7',
  mkv: '#673AB7',
  webm: '#9C27B0',
  wmv: '#673AB7',
  flv: '#E53935',
  m4v: '#9C27B0',

  // Audio
  mp3: '#E91E63',
  wav: '#2196F3',
  flac: '#FF5722',
  aac: '#EC407A',
  m4a: '#EC407A',
  ogg: '#E91E63',
  wma: '#EC407A',
  aiff: '#2196F3',
  mid: '#9C27B0',
  midi: '#9C27B0',

  // Archives
  zip: '#FFC107',
  rar: '#FFC107',
  '7z': '#FFC107',
  tar: '#FFC107',
  gz: '#FFC107',
  bz2: '#FFC107',
  xz: '#FFC107',

  // Fonts
  ttf: '#F44336',
  otf: '#F44336',
  woff: '#F44336',
  woff2: '#F44336',
  eot: '#F44336',

  // Executables
  exe: '#00BCD4',
  msi: '#00BCD4',
  dmg: '#00BCD4',
  app: '#00BCD4',
  deb: '#A80030',
  rpm: '#EE0000',
  apk: '#3DDC84',
  ipa: '#147EFB',

  // 3D & CAD
  obj: '#FFB74D',
  fbx: '#FFB74D',
  stl: '#FFB74D',
  gltf: '#FFB74D',
  glb: '#FFB74D',
  blend: '#F5792A',
  dwg: '#E51050',

  // Ebooks
  epub: '#83B81A',
  mobi: '#FF9900',
  azw: '#FF9900',

  // Special/System
  folder: '#90A4AE',
  folderopen: '#78909C',
  gitignore: '#F05032',
  dockerfile: '#2496ED',
  lock: '#FFCA28',
  log: '#8BC34A',
  license: '#9E9E9E',
};

/**
 * Default color for unknown file extensions
 */
export const DEFAULT_FILE_COLOR = '#78909C';

/**
 * Size configurations for file icons
 * Each size includes dimensions and typography settings
 */
export const FILE_ICON_SIZES = {
  sm: {
    width: 24,
    height: 24,
    fontSize: 6,
    borderRadius: 2,
  },
  lg: {
    width: 100,
    height: 100,
    fontSize: 25,
    borderRadius: 6,
  },
} as const;
