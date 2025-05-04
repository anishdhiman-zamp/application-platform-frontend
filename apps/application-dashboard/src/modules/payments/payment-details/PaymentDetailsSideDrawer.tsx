import React, { FC, useState } from 'react';
import { Sheet, SheetContent } from '@zamp-platform/ui';
import ApproveActionCard from 'modules/payments/payment-details/components/ApproveActionCard';
import PaymentApprovals from 'modules/payments/payment-details/PaymentApprovals';
import PaymentDetails from 'modules/payments/payment-details/PaymentDetails';
import { PAYMENT_DETAILS_TABS } from 'modules/payments/payments.constant';
import { PAYMENT_TABS } from 'modules/payments/payments.types';
import { defaultFnType } from 'types/commonTypes';
import { useGetPaymentApprovalsInfoQuery } from '@/apis/payments';
import { cn } from '@/utils/common';

type PaymentDetailsSideDrawerProps = {
  onClose: defaultFnType;
  paymentDetailsId: string;
};

const PaymentDetailsSideDrawer: FC<PaymentDetailsSideDrawerProps> = ({ onClose, paymentDetailsId }) => {
  const [currentTab, setCurrentTab] = useState<string>(PAYMENT_DETAILS_TABS[0].value);
  const handleTabSelect = (value: string) => {
    if (value) setCurrentTab(value);
  };

  const { data: paymentApprovalsInfo } = useGetPaymentApprovalsInfoQuery(paymentDetailsId);

  const renderTabContent = () => {
    switch (currentTab) {
      case PAYMENT_TABS.APPROVALS:
        return <PaymentApprovals paymentApprovalsInfo={paymentApprovalsInfo} />;
      default:
        return <PaymentDetails paymentDetailsId={paymentDetailsId} />;
    }
  };

  return (
    <Sheet open={!!paymentDetailsId} onOpenChange={onClose}>
      <SheetContent size='medium' tabIndex={-1} className='p-0 h-screen overflow-hidden'>
        <div className='h-full flex flex-col' tabIndex={-1}>
          <div className='px-4.5 py-6 flex items-center gap-3 border-b border-GRAY_400'>
            {PAYMENT_DETAILS_TABS.map((tab) => (
              <div
                key={tab.value}
                className={cn(
                  'px-1.5 py-1 rounded-md flex gap-1.5 items-center',
                  currentTab === tab.value ? 'f-12-500 bg-GRAY_100' : 'f-12-450',
                  'cursor-pointer',
                )}
                onClick={() => handleTabSelect(tab.value)}
              >
                <div className='f-12-500'>{tab.label}</div>
                {tab.value === 'approvals' && paymentApprovalsInfo?.approval_id && (
                  <div className='w-1.5 h-1.5 rounded-full bg-ORANGE_700' />
                )}
              </div>
            ))}
          </div>
          {paymentApprovalsInfo?.approval_id && <ApproveActionCard approvalId={paymentApprovalsInfo?.approval_id} />}
          {renderTabContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentDetailsSideDrawer;
