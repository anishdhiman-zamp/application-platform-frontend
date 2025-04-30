import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { SelectOption } from '@zamp-platform/form-builder';
import { Button, Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader } from '@zamp-platform/ui';
import { DEFAULT_APPROVAL_STEP } from 'modules/policies/constants';
import ApprovalFlow from 'modules/policies/create/ApprovalFlow';
import AttributeDropdown from 'modules/policies/create/AttributeDropdown';
import { attributes } from 'modules/policies/create/constants';
import { ApprovalFlowStep } from 'modules/policies/types';

interface PolicyFormData {
  [key: string]: SelectOption[];
}

const CreatePolicyDialog = ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) => {
  const [approvalSteps, setApprovalSteps] = useState<ApprovalFlowStep[]>([DEFAULT_APPROVAL_STEP]);
  const methods = useForm<PolicyFormData>({
    defaultValues: attributes.reduce(
      (acc, attr) => ({
        ...acc,
        [attr.label]: [],
      }),
      {},
    ),
  });

  const onSubmit = (data: PolicyFormData) => {
    console.log('Selected values:', data, approvalSteps);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <h2 className='text-lg font-semibold'>New policy</h2>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <DialogBody>
              <div className='flex gap-2 px-4 py-3'>
                {attributes.map((attribute) => (
                  <AttributeDropdown key={attribute.label} attribute={attribute} name={attribute.label} />
                ))}
              </div>
              <ApprovalFlow approvalSteps={approvalSteps} onChange={setApprovalSteps} />
            </DialogBody>
            <DialogFooter>
              <div className='flex justify-end gap-3'>
                <DialogClose asChild>
                  <Button variant='secondary'>Discard</Button>
                </DialogClose>
                <Button type='submit'>Create</Button>
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePolicyDialog;
