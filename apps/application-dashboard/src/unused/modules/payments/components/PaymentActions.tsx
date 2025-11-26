'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { Plus, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TooltipV2 from '@/components/common/TooltipV2';
import { DialogWithRoute } from '@/components/DialogWithRoute';
import { ResourceType } from '@/modules/shareResource';
import { PolicyDetailsType } from '@/unused/apis/paymentApi.types';
import { useGetPaymentConfigQuery, useLazyGetPoliciesQuery } from '@/unused/apis/payments';
import CreatePolicyDialog from '@/unused/modules/policies/create';
import PoliciesListSideDrawer from '@/unused/modules/policies/listing/PoliciesListSideDrawer';
import PolicyDeleteConfirmPopup from '@/unused/modules/policies/listing/PolicyDeleteConfirmPopup';
import { PolicyActionType, PolicyDialogType } from '@/unused/modules/policies/types';

const PaymentActions = () => {
  const { data: paymentConfig } = useGetPaymentConfigQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [getPolicies, { data: policiesData, currentData: currentPoliciesData }] = useLazyGetPoliciesQuery();

  const router = useRouter();
  const [sideDrawerConfigType, setSideDrawerConfigType] = useState<PolicyDialogType>();

  const handlePolicyDialogOpenChange = (type?: PolicyDialogType) => {
    router.push(`/payments/policies/create?type=${type}`);
  };

  const handlePolicyListClose = () => {
    document.body.style.pointerEvents = 'auto';
    setSideDrawerConfigType(undefined);
  };

  const handlePolicyListOpen = (type: PolicyDialogType) => {
    setIsDropdownOpen(false);
    setSideDrawerConfigType(type);
  };

  useEffect(() => {
    if (paymentConfig?.id && !currentPoliciesData?.data) {
      getPolicies({ resource_id: paymentConfig.id, resource_type: ResourceType.PAYMENTS }, true);
    }
  }, [paymentConfig?.id, getPolicies, currentPoliciesData?.data]);

  const paymentPolicies = useMemo(
    () =>
      (currentPoliciesData?.data ?? policiesData?.data)?.filter(
        (policy: PolicyDetailsType) => policy.action_type === PolicyActionType.CREATE_PAYMENT,
      ) ?? [],
    [currentPoliciesData?.data, policiesData?.data],
  );
  const templatePolicies = useMemo(
    () =>
      (currentPoliciesData?.data ?? policiesData?.data)?.filter(
        (policy: PolicyDetailsType) => policy.action_type === PolicyActionType.CREATE_TEMPLATE,
      ) ?? [],
    [currentPoliciesData?.data, policiesData?.data],
  );

  return (
    <>
      <DropdownMenu
        open={isDropdownOpen}
        onOpenChange={(open) => {
          if (!open) {
            document.body.style.pointerEvents = 'auto';
          }
        }}
      >
        <TooltipV2 tooltipBody='Policies' asChildTrigger>
          <DropdownMenuTrigger asChild>
            <Button
              onClick={() => setIsDropdownOpen(true)}
              variant='ghost'
              size='icon'
              className='text-GRAY_900 hover:text-GRAY_900 data-[state=open]:bg-GRAY_300 h-8 w-8 focus-visible:ring-0 focus-visible:ring-offset-0'
            >
              <ShieldCheck className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
        </TooltipV2>
        <DropdownMenuContent align='end' className='z-[1000]' sideOffset={5}>
          <DropdownMenuItem className='flex items-center justify-between'>
            <span>Templates</span>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='xxsmall'
                className='text-GRAY_600 hover:text-GRAY_900'
                onClick={() => handlePolicyListOpen('template')}
                disabled={templatePolicies.length === 0}
              >
                {templatePolicies.length} {templatePolicies.length > 1 ? 'policies' : 'policy'}
              </Button>
              <Button
                variant='ghost'
                size='xxsmall'
                className=''
                onClick={() => handlePolicyDialogOpenChange('template')}
              >
                <Plus className='h-3 w-3' />
              </Button>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className='flex items-center justify-between'>
            <span>Payouts</span>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='xxsmall'
                className='text-GRAY_600 hover:text-GRAY_900'
                disabled={paymentPolicies.length === 0}
                onClick={() => handlePolicyListOpen('payout')}
              >
                {paymentPolicies.length} {paymentPolicies.length > 1 ? 'policies' : 'policy'}
              </Button>
              <Button variant='ghost' size='xxsmall' onClick={() => handlePolicyDialogOpenChange('payout')}>
                <Plus className='h-3 w-3' />
              </Button>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogWithRoute routes={['/payments/policies/delete/:policyId']}>
        {({ open, onOpenChange }) => (
          <PolicyDeleteConfirmPopup
            policiesData={currentPoliciesData?.data ?? policiesData?.data ?? []}
            isOpen={open}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogWithRoute>

      <DialogWithRoute routes={['/payments/policies/create', '/payments/policies/create/:policyId']}>
        {({ open, onOpenChange }) => (
          <CreatePolicyDialog
            type={sideDrawerConfigType}
            policiesData={currentPoliciesData?.data ?? policiesData?.data ?? []}
            isOpen={open}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogWithRoute>

      {sideDrawerConfigType && (
        <PoliciesListSideDrawer
          isOpen={!!sideDrawerConfigType}
          onClose={handlePolicyListClose}
          policies={sideDrawerConfigType === 'payout' ? paymentPolicies : templatePolicies}
          type={sideDrawerConfigType}
          handlePolicyDialogOpenChange={handlePolicyDialogOpenChange}
        />
      )}
    </>
  );
};

export default PaymentActions;
