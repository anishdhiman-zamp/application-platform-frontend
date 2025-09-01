'use client';

import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import WidgetCreationForm from 'modules/widgets/create/components/WidgetCreationForm';
import WidgetPreview from 'modules/widgets/create/components/WidgetPreview';
import { useWidgetCreationContext, WidgetCreationProvider } from 'modules/widgets/create/context/WidgetCreationContext';
import { useRouter } from 'next/navigation';
import { withFiltersContext } from '@/components/filter/filters.context';

const WidgetPlaygroundContent = () => {
  const router = useRouter();
  const { clearLocalStorage } = useWidgetCreationContext();

  const handleClose = () => {
    clearLocalStorage();
    router.push(`?isWidget=false`);
  };

  return (
    <div className='h-full overflow-y-auto p-12 [&::-webkit-scrollbar]:hidden'>
      <Button className='absolute top-6 right-6 cursor-pointer' variant='ghost' size='xxsmall' onClick={handleClose}>
        <SvgSpriteLoader id='x-close' size={16} className='text-gray-700' />
      </Button>
      <div className='flex'>
        <div className='mr-12 flex-3'>
          <WidgetPreview />
        </div>
        <div className='flex-1'>
          <WidgetCreationForm handleClose={handleClose} />
        </div>
      </div>
    </div>
  );
};

const WidgetPlayground = () => {
  return (
    <WidgetCreationProvider>
      <WidgetPlaygroundContent />
    </WidgetCreationProvider>
  );
};

export default withFiltersContext(WidgetPlayground);
