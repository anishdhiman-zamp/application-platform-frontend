import { useEffect, useRef } from 'react';
import { toast as reactToastify } from 'react-toastify';
import { FormBuilder, FormBuilderRef, schema } from '@zamp-platform/form-builder';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from '@zamp-platform/ui';
import { SIZE_TYPES } from '@zamp-platform/ui/types';
import { useGetFormConfigQuery, useSubmitFormMutation } from '@/apis/forms';
import { useAddRecipientMutation } from '@/apis/payments';
import { toast } from '@/components/common/toast/Toast';
import { FORM_TYPES } from '@/constants/forms';

const AddRecipientAccount = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { data: formConfig } = useGetFormConfigQuery({
    form_id: FORM_TYPES.RECIPIENT_ACCOUNTS_ROBINHOOD,
  });
  const messageToastId = useRef<string | number>('');
  const [submitForm, { data: submitFormData, status: submitFormStatus, error: submitFormError }] =
    useSubmitFormMutation();
  const [addRecipient, { status: addRecipientStatus, error: addRecipientError }] = useAddRecipientMutation();
  const formRef = useRef<FormBuilderRef>(null);

  const onFailure = (error: any) => {
    console.log('zzz', error);
    toast.error('Failed to add recipient account');
  };
  const onSubmit = async (data: any) => {
    onOpenChange(false);

    console.log(data);

    messageToastId.current = toast.loading('Recipient creation in progress');
    await submitForm({
      form_type: FORM_TYPES.RECIPIENT_ACCOUNTS_ROBINHOOD,
      payload: data,
    });
  };

  useEffect(() => {
    if (submitFormStatus === 'fulfilled') {
      addRecipient(submitFormData);
    } else if (submitFormStatus === 'rejected') {
      reactToastify.dismiss(messageToastId.current);
      onFailure(submitFormError);
    }
  }, [submitFormStatus]);

  useEffect(() => {
    reactToastify.dismiss(messageToastId.current);
    if (addRecipientStatus === 'fulfilled') {
      toast.success('Recipient account added successfully');
    } else if (addRecipientStatus === 'rejected') {
      onFailure(addRecipientError);
    }
  }, [addRecipientStatus]);

  const handleSave = () => {
    formRef.current?.submit();
  };

  if (!formConfig) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton size={SIZE_TYPES.LARGE}>
        <DialogHeader>New Recipient Account</DialogHeader>
        <DialogBody className='p-6 flex justify-center'>
          <div className='max-w-[400px] w-[45%]'>
            <FormBuilder ref={formRef} schema={schema} onSubmit={onSubmit} />
          </div>
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2'>
          <Button size={SIZE_TYPES.SMALL} variant='secondary' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size={SIZE_TYPES.SMALL} onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecipientAccount;
