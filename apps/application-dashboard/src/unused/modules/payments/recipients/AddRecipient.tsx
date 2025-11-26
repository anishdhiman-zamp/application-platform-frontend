import { useEffect, useRef } from 'react';
import { captureException } from '@sentry/browser';
import { FormBuilder, FormBuilderRef } from '@zamp-platform/form-builder';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from '@zamp-platform/ui';
import { useLazyGetFormConfigQuery, useSubmitFormMutation } from '@/apis/forms';
import { Loader } from '@/components/common/loader/Loader';
import { toast } from '@/components/common/toast/Toast';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { FORM_TYPES } from '@/constants/forms';
import { useAddRecipientMutation } from '@/unused/apis/payments';
const AddRecipient = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [getFormConfig, { data: formConfig, isLoading: isFormConfigLoading }] = useLazyGetFormConfigQuery();
  const messageToastId = useRef<string | number>('');
  const [
    submitForm,
    { data: submitFormData, status: submitFormStatus, error: submitFormError, reset: resetSubmitForm },
  ] = useSubmitFormMutation();
  const [addRecipient, { status: addRecipientStatus, error: addRecipientError, reset: resetAddRecipient }] =
    useAddRecipientMutation();
  const formRef = useRef<FormBuilderRef>(null);

  const onFailure = (error: any) => {
    captureException(error);
    toast.error(TOAST_MESSAGES.ERROR_RECIPIENT_CREATION);
  };
  const onSubmit = async (data: any) => {
    onOpenChange(false);

    messageToastId.current = toast.loading(TOAST_MESSAGES.LOADING_RECIPIENT_CREATION);
    submitForm({
      form_type: FORM_TYPES.RECIPIENT,
      payload: data,
    });
  };

  useEffect(() => {
    if (submitFormStatus === 'fulfilled') {
      resetSubmitForm();
      addRecipient(submitFormData.form_submission_id);
    } else if (submitFormStatus === 'rejected') {
      resetSubmitForm();
      toast.dismiss(messageToastId.current);
      onFailure(submitFormError);
    }
  }, [submitFormStatus]);

  useEffect(() => {
    toast.dismiss(messageToastId.current);
    if (addRecipientStatus === 'fulfilled') {
      resetAddRecipient();
      toast.success(TOAST_MESSAGES.SUCCESS_RECIPIENT_CREATION);
    } else if (addRecipientStatus === 'rejected') {
      resetAddRecipient();
      onFailure(addRecipientError);
    }
  }, [addRecipientStatus]);

  useEffect(() => {
    if (open && !formConfig) {
      getFormConfig({ form_id: FORM_TYPES.RECIPIENT });
    }
  }, [open]);

  const handleSave = () => {
    formRef.current?.submit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>New Recipient</DialogHeader>
        <DialogBody className='flex justify-center p-6'>
          {isFormConfigLoading || !formConfig ? (
            <div className='flex h-full items-center justify-center'>
              <Loader className='border-gray-800 border-b-transparent' />
            </div>
          ) : (
            <div className='w-[50%] max-w-[400px]'>
              <FormBuilder ref={formRef} schema={formConfig} onSubmit={onSubmit} />
            </div>
          )}
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2'>
          <Button size='small' variant='secondary' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size='small' onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecipient;
