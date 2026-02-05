import { Suspense } from 'react';
import WidgetPageContent from 'app/(authenticated)/pages/@widget/WidgetPageContent';

const WidgetPage = () => {
  return (
    <Suspense>
      <WidgetPageContent />
    </Suspense>
  );
};

export default WidgetPage;
