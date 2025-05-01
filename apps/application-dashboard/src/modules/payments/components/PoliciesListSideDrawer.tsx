import { FC } from 'react';
import { Sheet, SheetContent } from '@zamp-platform/ui';
import PolicyCard from 'modules/payments/components/PolicyCard';
import { PolicyDetailsType } from '@/types/api/paymentApi.types';

type PoliciesListSideDrawerProps = {
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  policies: PolicyDetailsType[];
};

const PoliciesListSideDrawer: FC<PoliciesListSideDrawerProps> = ({ onClose, isOpen, policies }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='p-0 h-screen overflow-hidden'>
        <div className='py-6 px-4.5'>
          <h1 className='f-16-600 mb-4.5'>Policies</h1>
          <div className='space-y-3.5 overflow-y-auto h-[calc(100vh-92px)] pb-6 [&::-webkit-scrollbar]:hidden'>
            {policies.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PoliciesListSideDrawer;
