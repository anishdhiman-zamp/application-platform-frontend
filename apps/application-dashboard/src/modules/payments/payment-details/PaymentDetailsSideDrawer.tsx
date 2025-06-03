import React, { FC, useMemo, useState } from 'react';
import { Sheet, SheetContent } from '@zamp-platform/ui';
import ApproveActionCard from 'modules/payments/payment-details/components/ApproveActionCard';
import PaymentApprovals from 'modules/payments/payment-details/PaymentApprovals';
import PaymentDetails from 'modules/payments/payment-details/PaymentDetails';
import { PAYMENT_DETAILS_TABS } from 'modules/payments/payments.constant';
import { PAYMENT_TABS } from 'modules/payments/payments.types';
import { defaultFnType } from 'types/commonTypes';
import { useGetPaymentApprovalsInfoQuery } from '@/apis/payments';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
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

  const { data: paymentApprovalsInfo, isFetching } = useGetPaymentApprovalsInfoQuery(paymentDetailsId);

  const renderTabContent = () => {
    switch (currentTab) {
      case PAYMENT_TABS.APPROVALS:
        return <PaymentApprovals paymentApprovalsInfo={paymentApprovalsInfo} />;
      default:
        return <PaymentDetails paymentDetailsId={paymentDetailsId} />;
    }
  };

  const tabsList = useMemo(() => {
    return PAYMENT_DETAILS_TABS.filter(
      (tab) =>
        (tab.value === PAYMENT_TABS.APPROVALS &&
          !!paymentApprovalsInfo?.policy_evaluation_data?.approval_flow?.steps?.length) ||
        tab.value !== PAYMENT_TABS.APPROVALS,
    );
  }, [paymentApprovalsInfo]);

  return (
    <Sheet open={!!paymentDetailsId} onOpenChange={onClose}>
      <SheetContent size='medium' tabIndex={-1} className='h-screen overflow-hidden p-0'>
        <div className='flex h-full flex-col' tabIndex={-1}>
          <CommonWrapper
            isLoading={isFetching}
            loader={
              <div className='px-4.5 border-GRAY_400 flex animate-pulse items-center gap-3 border-b py-6'>
                <div className='w-30 bg-GRAY_100 h-6 rounded-md' />
                <div className='w-30 bg-GRAY_100 h-6 rounded-md' />
              </div>
            }
            skeletonType={SkeletonTypes.CUSTOM}
          >
            <div className='px-4.5 border-GRAY_400 flex items-center gap-3 border-b py-6'>
              {tabsList?.map((tab) => (
                <div
                  key={tab.value}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-1.5 py-1',
                    currentTab === tab.value ? 'f-12-500 bg-GRAY_100' : 'f-12-450',
                    'cursor-pointer',
                  )}
                  onClick={() => handleTabSelect(tab.value)}
                >
                  <div className='f-12-500'>{tab.label}</div>
                  {tab.value === 'approvals' && paymentApprovalsInfo?.approval_id && (
                    <div className='bg-ORANGE_700 h-1.5 w-1.5 rounded-full' />
                  )}
                </div>
              ))}
            </div>
          </CommonWrapper>
          {paymentApprovalsInfo?.approval_id && <ApproveActionCard approvalId={paymentApprovalsInfo?.approval_id} />}
          {renderTabContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentDetailsSideDrawer;
