import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { SelectOption } from '@zamp-platform/form-builder';
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  StepCard,
} from '@zamp-platform/ui';
import AttributeInputDropdown from 'modules/policies/create/AttributeInputDropdown';
import { payoutAttributes } from 'modules/policies/create/constants';
import AttributeMenuDropdown from '@/modules/policies/create/AttributeMenuDropdown';

interface PolicyFormData {
  [key: string]: SelectOption[];
}

const CreatePolicyDialog = ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) => {
  const methods = useForm<PolicyFormData>({
    defaultValues: payoutAttributes.reduce(
      (acc, attr) => ({
        ...acc,
        [attr.label]: [],
      }),
      {},
    ),
  });

  const onSubmit = (data: PolicyFormData) => {
    console.log('Selected values:', data);
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
              <div className='flex gap-2 px-4 py-3 overflow-x-auto [&::-webkit-scrollbar]:hidden'>
                {payoutAttributes.map((attribute) =>
                  attribute.type === 'input' ? (
                    <AttributeInputDropdown key={attribute.label} attribute={attribute} name={attribute.label} />
                  ) : (
                    <AttributeMenuDropdown key={attribute.label} attribute={attribute} name={attribute.label} />
                  ),
                )}
              </div>
              <div className='bg-BG_GRAY_2 p-4 flex flex-col border-t border-gray-200'>
                <StepCard stepNumber={1}>
                  <div>
                    <h3 className='f-16-700'>Step 1</h3>
                    <p className='f-14-400'>Select the creator you want to create a policy for.</p>
                  </div>
                </StepCard>
              </div>
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
