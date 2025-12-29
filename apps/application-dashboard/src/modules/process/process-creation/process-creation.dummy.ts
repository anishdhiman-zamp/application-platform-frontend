import type { LucideIcon } from 'lucide-react';
import { Database, Link2, Zap } from 'lucide-react';
import { CARD_TYPES } from 'modules/process/process-creation/components/IntegrationsCard';

export interface ProcessSectionCard {
  type: keyof typeof CARD_TYPES;
  title: string;
  isFirstCard: boolean;
  isLastCard: boolean;
}

export interface ProcessSection {
  icon: LucideIcon;
  label: string;
  iconClassName?: string;
  cards: ProcessSectionCard[];
  showAddButton: boolean;
}

export const PROCESS_CREATION_DUMMY_DATA: ProcessSection[] = [
  {
    icon: Zap,
    label: 'Trigger',
    cards: [
      {
        type: 'TEXT',
        title: 'Siddharth@zamp.ai',
        isFirstCard: true,
        isLastCard: false,
      },
      {
        type: 'LINK',
        title: '1',
        isFirstCard: false,
        isLastCard: true,
      },
    ],
    showAddButton: true,
  },
  {
    icon: Link2,
    label: 'Integrations',
    iconClassName: 'rotate-125',
    cards: [
      {
        type: 'LINK',
        title: '1',
        isFirstCard: true,
        isLastCard: false,
      },
    ],
    showAddButton: true,
  },
  {
    icon: Database,
    label: 'Datasets',
    cards: [
      {
        type: 'DATASET',
        title: 'Invoices',
        isFirstCard: true,
        isLastCard: true,
      },
    ],
    showAddButton: true,
  },
];
