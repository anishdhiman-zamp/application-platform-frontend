import { type ReactNode } from 'react';

export type MarkdownViewMode = 'milkdown' | 'raw';
export type HtmlViewMode = 'preview' | 'code';
export type SpreadsheetViewMode = 'table' | 'raw';

export interface ViewModeOption<T extends string> {
  value: T;
  label: string;
  icon: ReactNode;
}

export interface ViewModeToggleProps<T extends string> {
  value: T;
  options: [ViewModeOption<T>, ViewModeOption<T>];
  onChange: (value: T) => void;
}

export type FileViewerErrorType = 'not-found' | 'load-error';
