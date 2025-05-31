import React, { useEffect, useMemo, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { validateField } from '@zamp-platform/form-builder';
import { Button, Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, SelectOption } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { defaultConditions, getAttributes, transformFormDataToApiPayload } from 'modules/policies/commons';
import { DEFAULT_APPROVAL_STEP } from 'modules/policies/constants';
import ApprovalFlow from 'modules/policies/create/ApprovalFlow';
import AttributeInputDropdown from 'modules/policies/create/AttributeInputDropdown';
import { attributesMap } from 'modules/policies/create/constants';
import {
  CreatePolicyDialogProps,
  PolicyActionType,
  PolicyAttributeAction,
  PolicyDialogType,
  PolicyFormData,
} from 'modules/policies/types';
import { useParams, useSearchParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { useCreatePolicyMutation, useGetPaymentConfigQuery, useUpdatePolicyMutation } from '@/apis/payments';
import { toast } from '@/components/common/toast/Toast';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import AttributeMenuDropdown from '@/modules/policies/create/AttributeMenuDropdown';
import { CreatePolicyPayloadType } from '@/types/api/paymentApi.types';
import { formRequestUrlWithParams } from '@/utils/common';
const CreatePolicyDialog = ({ type: argType, isOpen, onOpenChange, policiesData }: CreatePolicyDialogProps) => {
  const params = useParams();
  const policyId = params?.policyId as string;
  const searchParams = useSearchParams();
  const type = argType || (searchParams?.get('type') as PolicyDialogType) || 'template';
  const policyData = useMemo(
    () => (isOpen ? policiesData?.find((policy) => policy.id === policyId) : null),
    [isOpen, policiesData, policyId],
  );

  const messageToastId = useRef<number | string>(0);
  const isEdit = !!policyData;
  const { data: paymentConfig } = useGetPaymentConfigQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const [
    createPolicy,
    {
      isLoading: createPolicyLoading,
      isSuccess: createPolicySuccess,
      error: createPolicyError,
      reset: resetCreatePolicy,
    },
  ] = useCreatePolicyMutation();
  const [
    updatePolicy,
    {
      isLoading: updatePolicyLoading,
      isSuccess: updatePolicySuccess,
      error: updatePolicyError,
      reset: resetUpdatePolicy,
    },
  ] = useUpdatePolicyMutation();

  const updatedAttributeMap = useMemo(() => {
    if (!policyData) return attributesMap;

    const updatedMap = { ...attributesMap };

    updatedMap.action.defaultValue = [policyData.policy_configurations.action];
    updatedMap.creator.defaultValue = policyData.policy_configurations.creator;
    updatedMap.initiator.defaultValue = policyData.policy_configurations.creator;

    policyData.policy_configurations.conditions?.conditions
      .filter((condition) => condition.field !== 'currency')
      .forEach((condition) => {
        const attribute = updatedMap[condition.field];

        if (attribute) attribute.defaultValue = condition.value;
      });

    return updatedMap;
  }, [policyData, type]);

  const methods = useForm<PolicyFormData>({
    defaultValues: {
      policyName: '',
      approvalSteps: [DEFAULT_APPROVAL_STEP],
      creator: [],
      ...getAttributes(type)
        .filter((attrId) => updatedAttributeMap[attrId].formFieldType === 'condition')
        .reduce<Record<string, SelectOption[]>>(
          (acc, attr) => ({
            ...acc,
            [attr]: [],
          }),
          {},
        ),
    },
  });

  useEffect(() => {
    methods.reset({
      policyName: policyData?.name || '',
      approvalSteps: policyData?.policy_configurations.approval_flow?.steps || [DEFAULT_APPROVAL_STEP],
      creator: policyData?.policy_configurations.creator || [],
      ...getAttributes(type)
        .filter((attrId) => updatedAttributeMap[attrId].formFieldType === 'condition')
        .reduce<Record<string, SelectOption[]>>((acc, attr) => {
          const condition = policyData?.policy_configurations.conditions?.conditions.find((c) => c.field === attr);

          return {
            ...acc,
            [attr]: condition ? [condition.value] : [],
          };
        }, {}),
    });
  }, [policyData, type, methods, updatedAttributeMap]);

  const onSubmit = (data: PolicyFormData) => {
    // Validate each field
    const errors: Record<string, string> = {};

    Object.entries(data).forEach(([fieldName]) => {
      const fieldConfig = updatedAttributeMap[fieldName];

      if (fieldConfig?.validations) {
        const { isValid, errors: fieldErrors } = validateField(data[fieldName], data, fieldConfig.validations);

        if (!isValid) {
          errors[fieldName] = fieldErrors[0];
        }
      }
    });

    if (!data.policyName.length) {
      errors.policyName = 'Policy name is required';
    }

    if (Object.keys(errors).length > 0) {
      let errorMessage = '';

      // Set form errors
      Object.entries(errors).forEach(([field, message]) => {
        errorMessage += `${message}\n`;
        methods.setError(field, { type: 'validate', message });
      });
      toast.error(errorMessage);

      return;
    }
    messageToastId.current = toast.loading(
      isEdit ? TOAST_MESSAGES.LOADING_POLICY_UPDATE : TOAST_MESSAGES.LOADING_POLICY_CREATION,
    );
    const policyConfig = transformFormDataToApiPayload(data, type === 'payout' ? defaultConditions : []);

    if (!paymentConfig?.id) {
      return;
    }
    const apiPayload: CreatePolicyPayloadType = {
      url: type === 'payout' ? API_ENDPOINTS.POLICY_CREATE_POST_PAYMENTS : API_ENDPOINTS.POLICY_CREATE_POST,
      name: data.policyName,
      resource_id: paymentConfig?.id,
      resource_type: 'payments',
      action_type: type === 'payout' ? PolicyActionType.CREATE_PAYMENT : PolicyActionType.CREATE_TEMPLATE,
      config: policyConfig,
    };

    if (isEdit) {
      updatePolicy({
        ...apiPayload,
        url: formRequestUrlWithParams(
          type === 'payout' ? API_ENDPOINTS.POLICY_UPDATE_POST_PAYMENTS : API_ENDPOINTS.POLICY_UPDATE_POST,
          { policyId: policyData?.id },
        ),
      })
        .unwrap()
        .then((res) => {
          toast.success(res?.message ?? TOAST_MESSAGES.SUCCESS_POLICY_UPDATE, {
            autoClose: 2000,
          });
        })
        .catch((err) => {
          toast.error(err?.data?.error ?? TOAST_MESSAGES.ERROR_POLICY_UPDATE, {
            autoClose: 2000,
          });
        });
    } else {
      createPolicy(apiPayload)
        .unwrap()
        .then((res) => {
          toast.success(res?.message ?? TOAST_MESSAGES.SUCCESS_POLICY_CREATION, {
            autoClose: 2000,
          });
        })
        .catch((err) => {
          console.log('err', err.data.error);
          toast.error(err.data.error ?? TOAST_MESSAGES.ERROR_POLICY_CREATION, {
            autoClose: 2000,
          });
        });
    }
  };

  useEffect(() => {
    if (!createPolicyLoading && !updatePolicyLoading) {
      toast.dismiss(messageToastId.current);
    }
    if (createPolicySuccess || updatePolicySuccess) {
      resetCreatePolicy();
      resetUpdatePolicy();
      handleOpenChange(false);
    } else if (createPolicyError || updatePolicyError) {
      resetCreatePolicy();
      resetUpdatePolicy();
    }
  }, [
    createPolicySuccess,
    createPolicyError,
    createPolicyLoading,
    onOpenChange,
    updatePolicySuccess,
    updatePolicyError,
    updatePolicyLoading,
  ]);

  const handleOpenChange = (open: boolean) => {
    methods.reset();
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton onClick={(e) => e.stopPropagation()}>
        <DialogBody className='overflow-y-auto [&::-webkit-scrollbar]:hidden z-[1002]'>
          <div className='f-12-500 text-primary py-3 px-4 pb-0'>{isEdit ? 'Edit policy' : 'New policy'}</div>
          <FormProvider {...methods}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className='px-4 pb-3 pt-6'>
                <input
                  type='text'
                  {...methods.register('policyName')}
                  name='policyName'
                  className={cn(
                    'f-22-500 placeholder:text-gray-500 text-primary focus:outline-none border-b border-primary border-dotted [&:not(:placeholder-shown)]:border-transparent w-[120px] [&:not(:placeholder-shown)]:w-fit',
                    methods.formState.errors.policyName && 'border-red-500',
                  )}
                  placeholder='Policy Title'
                  onFocus={(e) => e.stopPropagation()}
                />
              </div>
              <div className='flex gap-2 px-4 py-3 overflow-x-auto [&::-webkit-scrollbar]:hidden'>
                {getAttributes(type).map((attributeId) => {
                  const attribute = updatedAttributeMap[attributeId];
                  const error = methods.formState.errors[attributeId]?.message;

                  return attribute.type === 'input' ? (
                    <AttributeInputDropdown
                      key={attribute.id}
                      attribute={attribute}
                      name={attribute.id}
                      error={error}
                    />
                  ) : (
                    <AttributeMenuDropdown
                      key={attribute.id}
                      attribute={attribute}
                      name={attribute.id}
                      error={error}
                      isMultiSelect={attribute.type === 'multi-select'}
                    />
                  );
                })}
              </div>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${(() => {
                  const actionValue = (methods.watch('action') as SelectOption[])?.[0]?.value;

                  return actionValue !== PolicyAttributeAction.BLOCK
                    ? 'max-h-[1000px] opacity-100'
                    : 'max-h-0 opacity-0';
                })()}`}
              >
                <ApprovalFlow />
              </div>
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
            <Button
              isLoading={createPolicyLoading || updatePolicyLoading}
              size='small'
              onClick={() => methods.handleSubmit(onSubmit)()}
            >
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePolicyDialog;
