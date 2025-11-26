import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useGetPaymentApprovalsInfoQuery } from '@/deprecated/apis/payments';
import ApproveActionCard from '@/deprecated/modules/payments/payment-details/components/ApproveActionCard';
import PaymentApprovals from '@/deprecated/modules/payments/payment-details/PaymentApprovals';
import PaymentDetails from '@/deprecated/modules/payments/payment-details/PaymentDetails';
import { PAYMENT_DETAILS_TABS } from '@/deprecated/modules/payments/payments.constant';
import { PAYMENT_TABS } from '@/deprecated/modules/payments/payments.types';
import { cn } from '@/utils/common';
import { Sheet, SheetContent } from '@zamp-platform/ui';
import { FC, useMemo, useState } from 'react';
import { defaultFnType } from 'types/commonTypes';

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
              <div className='border-GRAY_400 flex animate-pulse items-center gap-3 border-b px-4.5 py-6'>
                <div className='bg-GRAY_100 h-6 w-30 rounded-md' />
                <div className='bg-GRAY_100 h-6 w-30 rounded-md' />
              </div>
            }
            skeletonType={SkeletonTypes.CUSTOM}
          >
            <div className='border-GRAY_400 flex items-center gap-3 border-b px-4.5 py-6'>
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
