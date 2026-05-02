import { Code, Eye, FileText, Table } from 'lucide-react';
import type {
  FileViewerErrorType,
  HtmlViewMode,
  MarkdownViewMode,
  SpreadsheetViewMode,
  ViewModeOption,
} from '@/modules/pace/components/file-viewer/file-viewer.types';

export const LEGACY_PPT_EXTENSION = 'ppt';
export const LEGACY_DOC_EXTENSION = 'doc';
export const MILKDOWN_SIZE_LIMIT = 75_000;
const ICON_SIZE = 14;

export const MARKDOWN_VIEW_OPTIONS: [ViewModeOption<MarkdownViewMode>, ViewModeOption<MarkdownViewMode>] = [
  { value: 'milkdown', label: 'Preview', icon: <FileText size={ICON_SIZE} /> },
  { value: 'raw', label: 'Source', icon: <Code size={ICON_SIZE} /> },
];

export const HTML_VIEW_OPTIONS: [ViewModeOption<HtmlViewMode>, ViewModeOption<HtmlViewMode>] = [
  { value: 'preview', label: 'Preview', icon: <Eye size={ICON_SIZE} /> },
  { value: 'code', label: 'Source', icon: <Code size={ICON_SIZE} /> },
];

export const SPREADSHEET_VIEW_OPTIONS: [ViewModeOption<SpreadsheetViewMode>, ViewModeOption<SpreadsheetViewMode>] = [
  { value: 'table', label: 'Table', icon: <Table size={ICON_SIZE} /> },
  { value: 'raw', label: 'Source', icon: <Code size={ICON_SIZE} /> },
];

export const FILE_VIEWER_ERROR_CONFIG: Record<
  FileViewerErrorType,
  { title: string; getDescription: (fileName: string) => string }
> = {
  'not-found': {
    title: 'File not found',
    getDescription: (fileName) => `The file ${fileName} may have been moved or deleted.`,
  },
  'load-error': {
    title: 'Failed to load file',
    getDescription: (fileName) => `The file ${fileName} could not be loaded. It may be corrupted or unsupported.`,
  },
};
