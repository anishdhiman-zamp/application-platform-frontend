import { Brain } from 'lucide-react';
import { SectionType } from '@/modules/macs/types';

export const SECTION_ICONS: Record<SectionType, React.ComponentType<{ size?: number; className?: string }>> = {
  [SectionType.Skills]: Brain,
};
