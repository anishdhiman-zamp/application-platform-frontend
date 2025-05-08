import React, { useMemo, useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { Plus, ShieldCheck } from 'lucide-react';
import { useGetPaymentConfigQuery, useLazyGetPoliciesQuery } from '@/apis/payments';
import CreatePolicyDialog from '@/modules/policies/create';
import PoliciesListSideDrawer from '@/modules/policies/listing/PoliciesListSideDrawer';
import { PolicyActionType, PolicyDialogType } from '@/modules/policies/types';
import { ResourceType } from '@/modules/shareResource';
import { PolicyDetailsType } from '@/types/api/paymentApi.types';

const PaymentActions = () => {
  const { data: paymentConfig } = useGetPaymentConfigQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const [getPolicies, { data: policiesData }] = useLazyGetPoliciesQuery();
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState<boolean>(false);
  const [policyType, setPolicyType] = useState<PolicyDialogType>('template');
  const [sideDrawerConfig, setSideDrawerConfig] = useState<PolicyDialogType>();

  const handlePolicyDialogOpenChange = (type: PolicyDialogType) => {
    setIsPolicyDialogOpen(true);
    setPolicyType(type);
  };

  const handlePolicyListClose = () => {
    setSideDrawerConfig(undefined);
  };

  React.useEffect(() => {
    if (paymentConfig?.id) {
      getPolicies({ resource_id: paymentConfig.id, resource_type: ResourceType.PAYMENTS });
    }
  }, [paymentConfig?.id, getPolicies]);

  const paymentPolicies = useMemo(
    () =>
      policiesData?.data?.filter(
        (policy: PolicyDetailsType) => policy.action_type === PolicyActionType.CREATE_PAYMENT,
      ) ?? [],
    [policiesData?.data],
  );
  const templatePolicies = useMemo(
    () =>
      policiesData?.data?.filter(
        (policy: PolicyDetailsType) => policy.action_type === PolicyActionType.CREATE_TEMPLATE,
      ) ?? [],
    [policiesData?.data],
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-GRAY_900 focus-visible:ring-0 focus-visible:ring-offset-0 hover:text-GRAY_900 data-[state=open]:bg-GRAY_300'
          >
            <ShieldCheck className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='z-[1000]' sideOffset={5}>
          <DropdownMenuItem className='flex items-center justify-between'>
            <span>Templates</span>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='xxsmall'
                className='text-GRAY_600 hover:text-GRAY_900'
                onClick={() => setSideDrawerConfig('template')}
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
                onClick={() => setSideDrawerConfig('payout')}
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
      <CreatePolicyDialog type={policyType} isOpen={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen} />
      {sideDrawerConfig && (
        <PoliciesListSideDrawer
          isOpen={!!sideDrawerConfig}
          onClose={handlePolicyListClose}
          policies={sideDrawerConfig === 'payout' ? paymentPolicies : templatePolicies}
          type={sideDrawerConfig}
          handlePolicyDialogOpenChange={handlePolicyDialogOpenChange}
        />
      )}
    </>
  );
};

export default PaymentActions;
