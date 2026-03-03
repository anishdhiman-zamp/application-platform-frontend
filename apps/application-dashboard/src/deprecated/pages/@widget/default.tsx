import { Suspense } from 'react';
import WidgetPageContent from '@/deprecated/pages/@widget/WidgetPageContent';

const WidgetPage = () => {
  return (
    <Suspense>
      <WidgetPageContent />
    </Suspense>
  );
};

export default WidgetPage;
