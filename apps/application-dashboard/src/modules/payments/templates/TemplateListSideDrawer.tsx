import React, { FC, useState } from 'react';
import { Sheet, SheetContent } from '@zamp-platform/ui';
import TemplateApproval from 'modules/payments/templates/components/TemplateApproval';
import TemplateList from 'modules/payments/templates/components/TemplateList';
import { defaultFnType } from 'types/commonTypes';
import { TemplateDetailsType } from '@/types/api/paymentApi.types';

type TemplateListSideDrawerProps = {
  onClose: defaultFnType;
  isOpen: boolean;
};

const TemplateListSideDrawer: FC<TemplateListSideDrawerProps> = ({ onClose, isOpen }) => {
  const [templateApprove, setTemplateApprove] = useState<TemplateDetailsType>();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent size='large' tabIndex={-1} className='p-0 h-screen overflow-hidden'>
        {templateApprove ? (
          <TemplateApproval onBackClick={() => setTemplateApprove(undefined)} template={templateApprove} />
        ) : (
          <TemplateList onTemplateClick={setTemplateApprove} />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TemplateListSideDrawer;
