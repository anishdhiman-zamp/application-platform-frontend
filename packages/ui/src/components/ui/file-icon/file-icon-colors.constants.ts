export interface FileTypeColors {
  bg: string;
  primary: string;
}

/**
 * Color mappings for file types.
 * bg: chip/badge background color
 * primary: icon color
 */
export const FILE_TYPE_COLORS: Record<string, FileTypeColors> = {
  // Documents & Office
  pdf: { bg: '#FAEAEA', primary: '#C0392B' },
  doc: { bg: '#E8F0FE', primary: '#2B5FBF' },
  docx: { bg: '#E8F0FE', primary: '#2B5FBF' },
  xls: { bg: '#E6F4EA', primary: '#1E7E45' },
  xlsx: { bg: '#E6F4EA', primary: '#1E7E45' },
  ppt: { bg: '#FDF0E8', primary: '#C4611A' },
  pptx: { bg: '#FDF0E8', primary: '#C4611A' },
  txt: { bg: '#F0F0F2', primary: '#5A5A72' },
  text: { bg: '#F0F0F2', primary: '#5A5A72' },
  md: { bg: '#EEECF9', primary: '#5746AF' },
  mdx: { bg: '#EEECF9', primary: '#5746AF' },
  markdown: { bg: '#EEECF9', primary: '#5746AF' },
  mdown: { bg: '#EEECF9', primary: '#5746AF' },
  mkd: { bg: '#EEECF9', primary: '#5746AF' },
  mkdn: { bg: '#EEECF9', primary: '#5746AF' },
  rtf: { bg: '#EDF2F7', primary: '#3A6A9A' },
  odt: { bg: '#E8F0FE', primary: '#2B5FBF' },
  ods: { bg: '#E6F4EA', primary: '#1E7E45' },
  odp: { bg: '#FDF0E8', primary: '#C4611A' },

  // Code & Development - JavaScript
  js: { bg: '#FDF8E1', primary: '#B5860D' },
  mjs: { bg: '#FDF8E1', primary: '#B5860D' },
  cjs: { bg: '#FDF8E1', primary: '#B5860D' },
  coffee: { bg: '#FDF8E1', primary: '#B5860D' },
  litcoffee: { bg: '#FDF8E1', primary: '#B5860D' },

  // Code & Development - TypeScript (includes .tsx per spec)
  ts: { bg: '#E8F4FB', primary: '#1A6FA0' },
  tsx: { bg: '#E8F4FB', primary: '#1A6FA0' },
  mts: { bg: '#E8F4FB', primary: '#1A6FA0' },
  cts: { bg: '#E8F4FB', primary: '#1A6FA0' },

  // Code & Development - JSX
  jsx: { bg: '#EAF5F0', primary: '#1C7A56' },

  // Code & Development - Python
  py: { bg: '#E6F5F4', primary: '#1A7F79' },
  pyw: { bg: '#E6F5F4', primary: '#1A7F79' },
  pyi: { bg: '#E6F5F4', primary: '#1A7F79' },
  pyx: { bg: '#E6F5F4', primary: '#1A7F79' },

  // Code & Development - HTML
  html: { bg: '#FCEEE8', primary: '#B84A28' },
  htm: { bg: '#FCEEE8', primary: '#B84A28' },
  xhtml: { bg: '#FCEEE8', primary: '#B84A28' },
  shtml: { bg: '#FCEEE8', primary: '#B84A28' },

  // Code & Development - CSS
  css: { bg: '#FDF4E3', primary: '#C07820' },
  less: { bg: '#FDF4E3', primary: '#C07820' },
  styl: { bg: '#FDF4E3', primary: '#C07820' },
  stylus: { bg: '#FDF4E3', primary: '#C07820' },
  postcss: { bg: '#FDF4E3', primary: '#C07820' },

  // Code & Development - SCSS/Sass
  scss: { bg: '#FAECF2', primary: '#A83060' },
  sass: { bg: '#FAECF2', primary: '#A83060' },

  // Code & Development - JSON
  json: { bg: '#FDF6E3', primary: '#8A6A10' },
  jsonc: { bg: '#FDF6E3', primary: '#8A6A10' },
  json5: { bg: '#FDF6E3', primary: '#8A6A10' },
  jsonl: { bg: '#FDF6E3', primary: '#8A6A10' },
  ndjson: { bg: '#FDF6E3', primary: '#8A6A10' },
  geojson: { bg: '#FDF6E3', primary: '#8A6A10' },

  // Code & Development - YAML
  yaml: { bg: '#EAF3EC', primary: '#3A7A50' },
  yml: { bg: '#EAF3EC', primary: '#3A7A50' },

  // Code & Development - XML
  xml: { bg: '#F0EEF8', primary: '#6650A4' },
  xsl: { bg: '#F0EEF8', primary: '#6650A4' },
  xsd: { bg: '#F0EEF8', primary: '#6650A4' },
  xslt: { bg: '#F0EEF8', primary: '#6650A4' },
  dtd: { bg: '#F0EEF8', primary: '#6650A4' },

  // Code & Development - Shell/Bash
  sh: { bg: '#EEEEEE', primary: '#3C3C4A' },
  bash: { bg: '#EEEEEE', primary: '#3C3C4A' },
  zsh: { bg: '#EEEEEE', primary: '#3C3C4A' },
  fish: { bg: '#EEEEEE', primary: '#3C3C4A' },
  ksh: { bg: '#EEEEEE', primary: '#3C3C4A' },
  csh: { bg: '#EEEEEE', primary: '#3C3C4A' },
  tcsh: { bg: '#EEEEEE', primary: '#3C3C4A' },
  ash: { bg: '#EEEEEE', primary: '#3C3C4A' },
  dash: { bg: '#EEEEEE', primary: '#3C3C4A' },
  ps1: { bg: '#EEEEEE', primary: '#3C3C4A' },
  psm1: { bg: '#EEEEEE', primary: '#3C3C4A' },
  psd1: { bg: '#EEEEEE', primary: '#3C3C4A' },
  bat: { bg: '#EEEEEE', primary: '#3C3C4A' },
  cmd: { bg: '#EEEEEE', primary: '#3C3C4A' },
  btm: { bg: '#EEEEEE', primary: '#3C3C4A' },

  // Code & Development - Go
  go: { bg: '#E3F4F8', primary: '#0E7490' },

  // Code & Development - Rust
  rs: { bg: '#FAEEE8', primary: '#B04A1A' },

  // Code & Development - Ruby
  rb: { bg: '#FAEAED', primary: '#A8293C' },
  rake: { bg: '#FAEAED', primary: '#A8293C' },
  erb: { bg: '#FAEAED', primary: '#A8293C' },

  // Code & Development - Java
  java: { bg: '#FDF0E6', primary: '#B05820' },
  class: { bg: '#FDF0E6', primary: '#B05820' },
  jar: { bg: '#FDF0E6', primary: '#B05820' },

  // Code & Development - PHP
  php: { bg: '#F0ECF8', primary: '#6040A8' },
  phtml: { bg: '#F0ECF8', primary: '#6040A8' },

  // Code & Development - C/C++
  c: { bg: '#EDF1F7', primary: '#2A4A80' },
  cpp: { bg: '#EDF1F7', primary: '#2A4A80' },
  cc: { bg: '#EDF1F7', primary: '#2A4A80' },
  cxx: { bg: '#EDF1F7', primary: '#2A4A80' },
  h: { bg: '#EDF1F7', primary: '#2A4A80' },
  hpp: { bg: '#EDF1F7', primary: '#2A4A80' },
  hh: { bg: '#EDF1F7', primary: '#2A4A80' },
  hxx: { bg: '#EDF1F7', primary: '#2A4A80' },
  ino: { bg: '#EDF1F7', primary: '#2A4A80' },

  // Code & Development - Swift
  swift: { bg: '#FEF0EA', primary: '#C0521A' },

  // Code & Development - Kotlin
  kt: { bg: '#EEEAF8', primary: '#5535A0' },
  kts: { bg: '#EEEAF8', primary: '#5535A0' },

  // Code & Development - SQL
  sql: { bg: '#EBF1F7', primary: '#3A608A' },
  ddl: { bg: '#EBF1F7', primary: '#3A608A' },
  dml: { bg: '#EBF1F7', primary: '#3A608A' },
  mysql: { bg: '#EBF1F7', primary: '#3A608A' },
  pgsql: { bg: '#EBF1F7', primary: '#3A608A' },
  plsql: { bg: '#EBF1F7', primary: '#3A608A' },
  plpgsql: { bg: '#EBF1F7', primary: '#3A608A' },

  // Code & Development - Other languages (use generic code colors)
  cs: { bg: '#F0EEF8', primary: '#6040A8' },
  csx: { bg: '#F0EEF8', primary: '#6040A8' },
  vue: { bg: '#EAF5F0', primary: '#1C7A56' },
  svelte: { bg: '#FEF0EA', primary: '#C0521A' },
  astro: { bg: '#F0EEF8', primary: '#6650A4' },
  r: { bg: '#E8F4FB', primary: '#1A6FA0' },
  scala: { bg: '#FAEAED', primary: '#A8293C' },
  groovy: { bg: '#E8F4FB', primary: '#1A6FA0' },
  dart: { bg: '#E3F4F8', primary: '#0E7490' },
  ex: { bg: '#EEECF9', primary: '#5746AF' },
  exs: { bg: '#EEECF9', primary: '#5746AF' },
  lua: { bg: '#E8F4FB', primary: '#1A6FA0' },
  hs: { bg: '#EEECF9', primary: '#5746AF' },
  erl: { bg: '#FAEAED', primary: '#A8293C' },
  ml: { bg: '#FEF0EA', primary: '#C0521A' },
  nim: { bg: '#FDF8E1', primary: '#B5860D' },
  zig: { bg: '#FEF0EA', primary: '#C0521A' },
  cr: { bg: '#F0F0F2', primary: '#5A5A72' },
  d: { bg: '#FAEAED', primary: '#A8293C' },
  jl: { bg: '#EEECF9', primary: '#5746AF' },
  clj: { bg: '#EAF5F0', primary: '#1C7A56' },
  cljs: { bg: '#EAF5F0', primary: '#1C7A56' },
  sol: { bg: '#F0F0F2', primary: '#5A5A72' },
  v: { bg: '#EAF5F0', primary: '#1C7A56' },
  vhd: { bg: '#EAF5F0', primary: '#1C7A56' },
  vhdl: { bg: '#EAF5F0', primary: '#1C7A56' },
  asm: { bg: '#F0F0F2', primary: '#5A5A72' },
  s: { bg: '#F0F0F2', primary: '#5A5A72' },
  pl: { bg: '#E3F4F8', primary: '#0E7490' },
  pm: { bg: '#E3F4F8', primary: '#0E7490' },
  pas: { bg: '#E8F4FB', primary: '#1A6FA0' },
  f90: { bg: '#F0EEF8', primary: '#6650A4' },
  cob: { bg: '#E8F4FB', primary: '#1A6FA0' },
  lisp: { bg: '#F0F0F2', primary: '#5A5A72' },
  el: { bg: '#EEECF9', primary: '#5746AF' },
  rkt: { bg: '#FAEAED', primary: '#A8293C' },
  tcl: { bg: '#FEF0EA', primary: '#C0521A' },
  vb: { bg: '#E8F4FB', primary: '#1A6FA0' },
  vbs: { bg: '#E8F4FB', primary: '#1A6FA0' },
  ada: { bg: '#EAF5F0', primary: '#1C7A56' },

  // Images & Media - Raster images
  jpg: { bg: '#E8F3FB', primary: '#1C6FA8' },
  jpeg: { bg: '#E8F3FB', primary: '#1C6FA8' },
  png: { bg: '#E8F3FB', primary: '#1C6FA8' },
  webp: { bg: '#E8F3FB', primary: '#1C6FA8' },
  bmp: { bg: '#E8F3FB', primary: '#1C6FA8' },
  ico: { bg: '#E8F3FB', primary: '#1C6FA8' },

  // Images & Media - SVG
  svg: { bg: '#E6F6F2', primary: '#1A8060' },

  // Images & Media - GIF
  gif: { bg: '#F0ECFB', primary: '#6040B0' },

  // Images & Media - Video
  mp4: { bg: '#FAECEC', primary: '#A82030' },
  mov: { bg: '#FAECEC', primary: '#A82030' },
  avi: { bg: '#FAECEC', primary: '#A82030' },
  webm: { bg: '#FAECEC', primary: '#A82030' },
  mkv: { bg: '#FAECEC', primary: '#A82030' },
  wmv: { bg: '#FAECEC', primary: '#A82030' },
  flv: { bg: '#FAECEC', primary: '#A82030' },
  m4v: { bg: '#FAECEC', primary: '#A82030' },

  // Images & Media - Audio
  mp3: { bg: '#F4EEFA', primary: '#7830A8' },
  wav: { bg: '#F4EEFA', primary: '#7830A8' },
  flac: { bg: '#F4EEFA', primary: '#7830A8' },
  aac: { bg: '#F4EEFA', primary: '#7830A8' },
  ogg: { bg: '#F4EEFA', primary: '#7830A8' },
  m4a: { bg: '#F4EEFA', primary: '#7830A8' },
  wma: { bg: '#F4EEFA', primary: '#7830A8' },
  aiff: { bg: '#F4EEFA', primary: '#7830A8' },
  mid: { bg: '#F4EEFA', primary: '#7830A8' },
  midi: { bg: '#F4EEFA', primary: '#7830A8' },

  // Images & Media - Design tools
  psd: { bg: '#E6EEF9', primary: '#2850A0' },
  psb: { bg: '#E6EEF9', primary: '#2850A0' },
  fig: { bg: '#FAECF4', primary: '#A02870' },
  sketch: { bg: '#FDF5E2', primary: '#9A6E10' },
  ai: { bg: '#FAEEF0', primary: '#B03050' },
  eps: { bg: '#FAEEF0', primary: '#B03050' },
  indd: { bg: '#EAF0F8', primary: '#2C5490' },
  idml: { bg: '#EAF0F8', primary: '#2C5490' },
  xd: { bg: '#FAECF4', primary: '#A02870' },

  // Archives & Data
  zip: { bg: '#F2EEEA', primary: '#7A5840' },
  tar: { bg: '#F2EEEA', primary: '#7A5840' },
  gz: { bg: '#F2EEEA', primary: '#7A5840' },
  rar: { bg: '#F2EEEA', primary: '#7A5840' },
  '7z': { bg: '#F2EEEA', primary: '#7A5840' },
  bz2: { bg: '#F2EEEA', primary: '#7A5840' },
  xz: { bg: '#F2EEEA', primary: '#7A5840' },

  // Archives & Data - Database
  db: { bg: '#EAF0F8', primary: '#2C5880' },
  sqlite: { bg: '#EAF0F8', primary: '#2C5880' },
  sqlite3: { bg: '#EAF0F8', primary: '#2C5880' },
  graphql: { bg: '#EAF0F8', primary: '#2C5880' },
  gql: { bg: '#EAF0F8', primary: '#2C5880' },
  prisma: { bg: '#EAF0F8', primary: '#2C5880' },
  cql: { bg: '#EAF0F8', primary: '#2C5880' },
  hql: { bg: '#EAF0F8', primary: '#2C5880' },
  cypher: { bg: '#EAF0F8', primary: '#2C5880' },
  sparql: { bg: '#EAF0F8', primary: '#2C5880' },
  rq: { bg: '#EAF0F8', primary: '#2C5880' },
  redis: { bg: '#EAF0F8', primary: '#2C5880' },

  // Archives & Data - CSV/Tabular
  csv: { bg: '#E6F4EA', primary: '#217A3C' },
  tsv: { bg: '#E6F4EA', primary: '#217A3C' },
  tab: { bg: '#E6F4EA', primary: '#217A3C' },

  // Config & Infrastructure - ENV/Config
  env: { bg: '#FDFAE8', primary: '#727010' },
  dotenv: { bg: '#FDFAE8', primary: '#727010' },
  config: { bg: '#FDFAE8', primary: '#727010' },
  ini: { bg: '#FDFAE8', primary: '#727010' },
  cfg: { bg: '#FDFAE8', primary: '#727010' },
  conf: { bg: '#FDFAE8', primary: '#727010' },
  properties: { bg: '#FDFAE8', primary: '#727010' },
  toml: { bg: '#FDFAE8', primary: '#727010' },
  plist: { bg: '#FDFAE8', primary: '#727010' },

  // Config & Infrastructure - Docker
  dockerfile: { bg: '#E6F2FB', primary: '#1060A8' },
  dockerignore: { bg: '#E6F2FB', primary: '#1060A8' },

  // Config & Infrastructure - Terraform
  tf: { bg: '#EEEAF8', primary: '#5038A0' },
  tfvars: { bg: '#EEEAF8', primary: '#5038A0' },

  // Config & Infrastructure - Lock files
  lock: { bg: '#EBEBED', primary: '#5C5C70' },

  // Config & Infrastructure - Git
  gitignore: { bg: '#EEF4EC', primary: '#3A6830' },
  gitattributes: { bg: '#EEF4EC', primary: '#3A6830' },

  // Config & Infrastructure - Package manifests (use purple tones)
  // Note: package.json, composer.json, Gemfile are matched by full filename, not extension
  // These are handled as special cases

  // Communication & Notebooks
  eml: { bg: '#E8EEF8', primary: '#3050A0' },
  msg: { bg: '#E8EEF8', primary: '#3050A0' },
  ics: { bg: '#E8F4EA', primary: '#2A7A40' },
  ical: { bg: '#E8F4EA', primary: '#2A7A40' },
  ipynb: { bg: '#FDF2E6', primary: '#B86010' },

  // Other document types
  rst: { bg: '#EDF2F7', primary: '#3A6A9A' },
  tex: { bg: '#EDF2F7', primary: '#3A6A9A' },
  latex: { bg: '#EDF2F7', primary: '#3A6A9A' },
  log: { bg: '#F0F0F2', primary: '#5A5A72' },
  license: { bg: '#F0F0F2', primary: '#5A5A72' },
};

export const DEFAULT_FILE_COLORS: FileTypeColors = {
  bg: '#EEEEEE',
  primary: '#666680',
};
