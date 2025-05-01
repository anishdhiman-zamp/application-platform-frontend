import React, { useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { SelectOption } from '@zamp-platform/form-builder';
import { Button, Dialog, DialogBody, DialogClose, DialogContent, DialogFooter } from '@zamp-platform/ui';
import { getAttributes, transformFormDataToApiPayload } from 'modules/policies/commons';
import { DEFAULT_APPROVAL_STEP } from 'modules/policies/constants';
import ApprovalFlow from 'modules/policies/create/ApprovalFlow';
import AttributeInputDropdown from 'modules/policies/create/AttributeInputDropdown';
import { attributesMap } from 'modules/policies/create/constants';
import { CreatePolicyDialogProps, PolicyFormData } from 'modules/policies/types';
import { useCreatePolicyMutation, useGetPaymentConfigQuery } from '@/apis/payments';
import { toast } from '@/components/common/toast/Toast';
import AttributeMenuDropdown from '@/modules/policies/create/AttributeMenuDropdown';
import { CreatePolicyPayloadType } from '@/types/api/paymentApi.types';

const CreatePolicyDialog = ({ type, isOpen, onOpenChange }: CreatePolicyDialogProps) => {
  const messageToastId = useRef<number | string>(0);
  const { data: paymentConfig } = useGetPaymentConfigQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const [createPolicy, { isLoading: createPolicyLoading, isSuccess: createPolicySuccess, error: createPolicyError }] =
    useCreatePolicyMutation();
  const methods = useForm<PolicyFormData>({
    defaultValues: {
      ...getAttributes(type)
        .filter((attrId) => attributesMap[attrId].formFieldType === 'condition')
        .reduce<Record<string, SelectOption[]>>(
          (acc, attr) => ({
            ...acc,
            [attr]: [],
          }),
          {},
        ),
      creator: [],
      approvalSteps: [DEFAULT_APPROVAL_STEP],
    },
  });

  const onSubmit = (data: PolicyFormData) => {
    console.log('data', data);
    messageToastId.current = toast.loading('Policy creation in progress');
    const policyConfig = transformFormDataToApiPayload(data);

    if (!paymentConfig?.id) {
      console.log('No payment config found');

      return;
    }
    const apiPayload: CreatePolicyPayloadType = {
      templateFor: type,
      name: data.policyName,
      resource_id: paymentConfig?.id,
      resource_type: 'payments',
      action_type: 'CREATE_PAYMENT',
      config: policyConfig,
    };

    console.log('API Payload:', apiPayload);
    createPolicy(apiPayload);
  };

  useEffect(() => {
    console.log('createPolicyStatus', createPolicySuccess, createPolicyError, createPolicyLoading);
    if (!createPolicyLoading) {
      toast.dismiss(messageToastId.current);
    }
    if (createPolicySuccess) {
      toast.success('Policy created successfully');
    } else if (createPolicyError) {
      toast.error(createPolicyError?.data?.error || 'Failed to create policy');
    }
  }, [createPolicySuccess, createPolicyError]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      methods.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton autoFocus>
        <DialogBody className='overflow-y-auto [&::-webkit-scrollbar]:hidden'>
          <div className='f-12-500 text-primary py-3 px-4'>New policy</div>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <div className='px-4 pb-3 pt-6'>
                <input
                  type='text'
                  {...methods.register('policyName')}
                  name='policyName'
                  className='f-22-500 placeholder:text-gray-500 text-primary focus:outline-none border-b border-primary border-dotted [&:not(:placeholder-shown)]:border-transparent w-[120px] [&:not(:placeholder-shown)]:w-fit'
                  placeholder='Policy Title'
                  autoFocus
                />
              </div>
              <div className='flex gap-2 px-4 py-3 overflow-x-auto [&::-webkit-scrollbar]:hidden'>
                {getAttributes(type).map((attributeId) => {
                  const attribute = attributesMap[attributeId];

                  return attribute.type === 'input' ? (
                    <AttributeInputDropdown key={attribute.id} attribute={attribute} name={attribute.id} />
                  ) : (
                    <AttributeMenuDropdown key={attribute.id} attribute={attribute} name={attribute.id} />
                  );
                })}
              </div>

              <ApprovalFlow />
            </form>
          </FormProvider>
        </DialogBody>
        <DialogFooter>
          <div className='flex justify-end gap-2'>
            <DialogClose asChild>
              <Button variant='secondary' size='small'>
                Discard
              </Button>
            </DialogClose>
            <Button size='small' onClick={() => methods.handleSubmit(onSubmit)()}>
              Create
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePolicyDialog;
