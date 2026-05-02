import type { ReactNode } from 'react';

export type ComponentCategoryType =
  | 'Buttons'
  | 'Form Inputs'
  | 'Selection'
  | 'Overlays'
  | 'Tooltips & Disclosure'
  | 'Navigation'
  | 'Feedback'
  | 'Rich Content'
  | 'Animations'
  | 'Specialized'
  | 'Animated Icons'
  | 'Module Components';

export interface VariantSampleType {
  label: string;
  node: ReactNode;
}

export interface ComponentEntryType {
  id: string;
  name: string;
  category: ComponentCategoryType;
  filePath: string;
  description?: string;
  renderable: boolean;
  preview?: ReactNode;
  variantSamples?: VariantSampleType[];
}

export interface CategoryGroupType {
  category: ComponentCategoryType;
  entries: ComponentEntryType[];
}
