import React, { FC, useState } from 'react';
import { Sheet, SheetContent } from '@zamp-platform/ui';
import PaymentApprovals from 'modules/payments/payment-details/PaymentApprovals';
import PaymentDetails from 'modules/payments/payment-details/PaymentDetails';
import { PAYMENT_DETAILS_TABS } from 'modules/payments/payments.constant';
import { PAYMENT_TABS } from 'modules/payments/payments.types';
import { defaultFnType } from 'types/commonTypes';
import { useGetPaymentApprovalsInfoQuery } from '@/apis/payments';
import { useApprovePolicyMutation, useRejectPolicyMutation } from '@/apis/people';
import { Button } from '@/components/common/button/Button';
import { toast } from '@/components/common/toast/Toast';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { SIZE_TYPES } from '@/types/common/components';
import { BUTTON_TYPES } from '@/types/components/button.type';
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

  const { data: paymentApprovalsInfo } = useGetPaymentApprovalsInfoQuery('109fa994-2664-419d-8c84-2470e707f320');
  const [approvePolicy, { isLoading: isApprovePolicyLoading }] = useApprovePolicyMutation();
  const [rejectPolicy, { isLoading: isRejectPolicyLoading }] = useRejectPolicyMutation();

  const handleApprove = () => {
    approvePolicy({ ids: [paymentDetailsId] })
      .unwrap()
      .then(() => {
        toast.success(TOAST_MESSAGES.SUCCESS_APPROVED);
      })
      .catch((error: any) => {
        toast.error(`${TOAST_MESSAGES.ERROR_APPROVED}: ${error?.data?.error}`);
      });
  };

  const handleReject = () => {
    rejectPolicy({ ids: [paymentDetailsId] })
      .unwrap()
      .then(() => {
        toast.success(TOAST_MESSAGES.SUCCESS_REJECTED);
      })
      .catch((error: any) => {
        toast.error(`${TOAST_MESSAGES.ERROR_REJECTED}: ${error?.data?.error}`);
      });
  };

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
                {tab.value === 'approvals' && <div className='w-1.5 h-1.5 rounded-full bg-ORANGE_700' />}
              </div>
            ))}
          </div>
          <div className='px-4.5 py-4 flex items-center gap-3 border-b border-GRAY_400'>
            <div className='f-12-500 text-ORANGE_800 flex-1'>Your approval is pending for this payment</div>
            <Button
              id='reject-payment'
              type={BUTTON_TYPES.SECONDARY}
              size={SIZE_TYPES.SMALL}
              onClick={handleReject}
              isLoading={isRejectPolicyLoading}
              className='f-12-500 text-RED_700 border-RED_700 hover:!text-RED_700 min-w-16'
            >
              Reject
            </Button>
            <Button
              id='approve-payment'
              onClick={handleApprove}
              size={SIZE_TYPES.SMALL}
              isLoading={isApprovePolicyLoading}
              className='f-12-500 min-w-[72px]'
            >
              Approve
            </Button>
          </div>
          {renderTabContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentDetailsSideDrawer;
