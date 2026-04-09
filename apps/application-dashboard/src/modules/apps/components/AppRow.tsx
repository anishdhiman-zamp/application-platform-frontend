'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { formatPlural } from '@zamp-platform/utils';
import { Globe, Lock, Sticker } from 'lucide-react';
import { APP_VISIBILITY, type AppType } from '@/modules/apps/apps.types';
import ShareAppPopup from '@/modules/apps/components/ShareAppPopup';
import { getIconTheme, APP_ICON_THEMES } from '@/modules/apps/utils/iconTheme';

interface AppRowProps {
  app: AppType;
}

const AppRow = ({ app }: AppRowProps) => {
  const theme = getIconTheme(app.name, APP_ICON_THEMES);
  const isPublic = app.visibility === APP_VISIBILITY.PUBLIC;
  const serviceCount = app.services?.length ?? 0;

  return (
    <div className='flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors'>
      <div className={cn('flex items-center rounded-[5px] p-0.5', theme.lightBg, theme.darkBg)}>
        <Sticker size={17} strokeWidth={1.5} style={{ color: theme.color }} />
      </div>

      <span className='text-GRAY_1000 flex-1 truncate text-sm font-[550]'>{app.name}</span>

      <span className='text-GRAY_600 text-xs'>{app.slug}</span>

      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className='flex-shrink-0'>
              {isPublic ? (
                <Globe size={13} className='text-green-600' strokeWidth={1.5} />
              ) : (
                <Lock size={13} className='text-GRAY_700' strokeWidth={1.5} />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent side='top' className='text-xs'>
            {isPublic ? 'Public' : 'Private'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <span className='text-GRAY_600 text-xs'>
        {formatPlural(serviceCount, 'service')}
      </span>

      <div onClick={(e) => e.stopPropagation()}>
        <ShareAppPopup appId={app.id} />
      </div>
    </div>
  );
};

export default AppRow;
