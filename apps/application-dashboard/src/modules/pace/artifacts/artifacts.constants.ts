import { FileText, Table2 } from 'lucide-react';
import { DYNAMIC_TAB_ICON_MAP } from 'modules/pace/pace.constants';

export const ARTIFACT_ICON_MAP = DYNAMIC_TAB_ICON_MAP;

export const ARTIFACTS_TABS = [
  { id: 'all', label: 'All', icon: null },
  { id: 'pages', label: 'Pages', icon: FileText },
  { id: 'datasets', label: 'Datasets', icon: Table2 },
];

export const ARTIFACTS_PAGE_SIZE = 100;
