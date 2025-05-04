import React, { useEffect, useMemo, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { SelectOption, validateField } from '@zamp-platform/form-builder';
import { Button, Dialog, DialogBody, DialogClose, DialogContent, DialogFooter } from '@zamp-platform/ui';
import { getAttributes, transformFormDataToApiPayload } from 'modules/policies/commons';
import { DEFAULT_APPROVAL_STEP } from 'modules/policies/constants';
import ApprovalFlow from 'modules/policies/create/ApprovalFlow';
import AttributeInputDropdown from 'modules/policies/create/AttributeInputDropdown';
import { attributesMap } from 'modules/policies/create/constants';
import { CreatePolicyDialogProps, PolicyActionType, PolicyFormData, PolicyQuorum } from 'modules/policies/types';
import { useCreatePolicyMutation, useGetPaymentConfigQuery, useUpdatePolicyMutation } from '@/apis/payments';
import { toast } from '@/components/common/toast/Toast';
import AttributeMenuDropdown from '@/modules/policies/create/AttributeMenuDropdown';
import { LOGICAL_OPERATOR_CONDITIONS } from '@/modules/widgets/displayConfig/displayConfig.types';
import { ResourceAudienceType } from '@/types/api/auth.types';
import { CreatePolicyPayloadType } from '@/types/api/paymentApi.types';

const CreatePolicyDialog = ({ type, isOpen, onOpenChange, policyData }: CreatePolicyDialogProps) => {
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

    policyData.policy_configurations.conditions.conditions
      .filter((condition) => condition.field !== 'currency')
      .forEach((condition) => {
        const attribute = updatedMap[condition.field];

        if (attribute) attribute.defaultValue = condition.value;
      });

    return updatedMap;
  }, [policyData, type]);

  const methods = useForm<PolicyFormData>({
    defaultValues: {
      policyName: policyData?.name || '',
      approvalSteps: policyData?.policy_configurations.approval_flow?.steps.map((step) => ({
        logical_operator: step.logical_operator as LOGICAL_OPERATOR_CONDITIONS,
        conditions: step.conditions.map((condition) => ({
          mode: condition.mode as PolicyQuorum,
          approver_details: condition.approver_details.map((approver) => {
            const creatorAttribute = updatedAttributeMap.creator;

            if ('data_source' in creatorAttribute && creatorAttribute.data_source?.valueFormatter) {
              const formatter = creatorAttribute.data_source.valueFormatter;

              return formatter([
                {
                  resource_audience_id: approver.id,
                  resource_audience_type: approver.type,
                  name: approver.id,
                },
              ])[0];
            }

            return {
              type: approver.type as ResourceAudienceType,
              id: approver.id,
              label: approver.id,
            };
          }),
        })),
      })) || [DEFAULT_APPROVAL_STEP],
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

  const onSubmit = (data: PolicyFormData) => {
    console.log('data', data);
    // Validate each field
    const errors: Record<string, string> = {};

    Object.entries(data).forEach(([fieldName]) => {
      const fieldConfig = updatedAttributeMap[fieldName];

      if (fieldConfig?.validations) {
        console.log('fieldConfig', fieldConfig, data[fieldName]);

        const { isValid, errors: fieldErrors } = validateField(data[fieldName], data, fieldConfig.validations);

        console.log('isValid', isValid, fieldErrors);

        if (!isValid) {
          errors[fieldName] = fieldErrors[0];
        }
      }
    });

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
    messageToastId.current = toast.loading('Policy creation in progress');
    const policyConfig = transformFormDataToApiPayload(data);

    if (!paymentConfig?.id) {
      console.log('No payment config found skipping policy creation');

      return;
    }
    const apiPayload: CreatePolicyPayloadType = {
      templateFor: type,
      name: data.policyName,
      resource_id: paymentConfig?.id,
      resource_type: 'payments',
      action_type: type === 'payout' ? PolicyActionType.CREATE_PAYMENT : PolicyActionType.CREATE_TEMPLATE,
      config: policyConfig,
    };

    console.log('API Payload:', apiPayload);
    if (isEdit) {
      updatePolicy({ ...apiPayload, policyId: policyData?.id });
    } else {
      createPolicy(apiPayload);
    }
  };

  useEffect(() => {
    console.log('createPolicyStatus', createPolicySuccess, createPolicyError, createPolicyLoading);
    if (!createPolicyLoading || !updatePolicyLoading) {
      toast.dismiss(messageToastId.current);
    }
    if (createPolicySuccess || updatePolicySuccess) {
      toast.success(isEdit ? 'Policy updated successfully' : 'Policy created successfully');
      resetCreatePolicy();
      resetUpdatePolicy();
      onOpenChange(false);
    } else if (createPolicyError || updatePolicyError) {
      toast.error(isEdit ? 'Failed to update policy' : 'Failed to create policy');
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
                  className='f-22-500 placeholder:text-gray-500 text-primary focus:outline-none border-b border-primary border-dotted [&:not(:placeholder-shown)]:border-transparent w-[120px] [&:not(:placeholder-shown)]:w-fit'
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

                  return actionValue !== 'BLOCK' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0';
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
            <Button size='small' onClick={() => methods.handleSubmit(onSubmit)()}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePolicyDialog;
