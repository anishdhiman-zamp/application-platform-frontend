import { FC, ReactNode, Suspense } from 'react';
import LayoutWrapperContent from 'components/layouts/LayoutWrapperContent';

const LayoutWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Suspense>
      <LayoutWrapperContent>{children}</LayoutWrapperContent>
    </Suspense>
  );
};

export default LayoutWrapper;
