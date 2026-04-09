'use client';

import { cn } from '@zamp-platform/ui/utils';
import { ExternalLink, Package } from 'lucide-react';
import Link from 'next/link';
import type { ServiceSummaryType } from '@/modules/apps/apps.types';
import { getIconTheme, SERVICE_ICON_THEMES } from '@/modules/apps/utils/iconTheme';

interface ServiceCardProps {
  service: ServiceSummaryType;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const theme = getIconTheme(service.name, SERVICE_ICON_THEMES);
  const displayUrl = service.url ? service.url.replace('https://', '') : '';

  return (
    <div className='border-GRAY_400 bg-BG_WHITE flex h-24 flex-col items-start justify-between rounded-lg border p-3 transition-shadow hover:shadow-sm'>
      <div className='flex w-full items-center gap-1.5'>
        <div className={cn('flex items-center rounded-[4px] p-0.5', theme.lightBg, theme.darkBg)}>
          <Package size={14} strokeWidth={1.5} style={{ color: theme.color }} />
        </div>
        <span className='text-GRAY_1000 flex-1 truncate text-xs font-[550]'>{service.name}</span>
        <span className='bg-GRAY_100 text-GRAY_700 rounded px-1.5 py-0.5 text-[10px]'>{service.type}</span>
      </div>

      {displayUrl && (
        <Link
          href={service.url}
          target='_blank'
          rel='noopener noreferrer'
          className='text-GRAY_700 hover:text-GRAY_1000 hover:bg-GRAY_100 dark:hover:bg-GRAY_800 flex items-center gap-1 rounded px-1 py-0.5 text-[11px] transition-colors'
        >
          <ExternalLink size={10} strokeWidth={1.5} />
          <span className='max-w-[160px] truncate'>{displayUrl}</span>
        </Link>
      )}
    </div>
  );
};

export default ServiceCard;
