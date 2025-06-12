import React, { FC, useState } from 'react';
import { Sheet, SheetContent } from '@zamp-platform/ui';
import TemplateApproval from 'modules/payments/templates/components/TemplateApproval';
import TemplateList from 'modules/payments/templates/components/TemplateList';
import { AnimatePresence, motion } from 'motion/react';
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
      <SheetContent size='large' tabIndex={-1} className='h-screen overflow-hidden p-0'>
        <div className='test h-full'>
          <AnimatePresence mode='wait'>
            {templateApprove ? (
              <motion.div
                key='details'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, type: 'spring' }}
                className='h-full'
              >
                <TemplateApproval onBackClick={() => setTemplateApprove(undefined)} template={templateApprove} />
              </motion.div>
            ) : (
              <motion.div
                key='list'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, type: 'spring' }}
              >
                <TemplateList onTemplateClick={setTemplateApprove} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TemplateListSideDrawer;
