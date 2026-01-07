'use client';

import { cn } from '@zamp-platform/ui/utils';
import { SECTION_ICONS } from 'modules/macs/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { SectionType } from '@/modules/macs/types';

interface SectionIconButtonProps {
  section: SectionType;
}

const SECTION_ROUTES: Record<SectionType, string> = {
  [SectionType.Skills]: ROUTES_PATH.CHAT_SKILLS,
};

const SectionIconButton = ({ section }: SectionIconButtonProps) => {
  const pathname = usePathname();
  const Icon = SECTION_ICONS[section];
  const sectionRoute = SECTION_ROUTES[section];
  const isActive = pathname === sectionRoute;

  return (
    <Link
      href={isActive ? ROUTES_PATH.CHAT : sectionRoute}
      className={cn(
        'text-GRAY_900 hover:text-GRAY_900 flex h-7 w-7 items-center justify-center rounded-lg p-2',
        isActive && 'border-GRAY_400 text-GRAY_1000 hover:text-GRAY_1000 border bg-white hover:bg-white',
      )}
    >
      <Icon size={14} />
    </Link>
  );
};

export default SectionIconButton;
