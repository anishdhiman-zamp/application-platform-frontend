import { useEffect, useRef } from 'react';
import { captureException } from '@sentry/browser';
import { FormBuilder, FormBuilderRef } from '@zamp-platform/form-builder';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from '@zamp-platform/ui';
import { useLazyGetFormConfigQuery, useSubmitFormMutation } from '@/apis/forms';
import { Loader } from '@/components/common/loader/Loader';
import { toast } from '@/components/common/toast/Toast';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { FORM_TYPES } from '@/constants/forms';
import { RecipientDetailsType } from '@/unused/apis/paymentApi.types';
import { useAddRecipientAccountMutation } from '@/unused/apis/payments';
const RenderRecipientDetails = ({ recipientDetails }: { recipientDetails: RecipientDetailsType }) => {
  const details = [
    {
      label: 'Recipient Name',
      value: recipientDetails.name,
    },
    {
      label: 'Contact',
      value: recipientDetails.email,
    },
    ...(recipientDetails.recipient_details || []),
  ];

  return (
    <div className='mb-4 flex flex-col gap-2.5'>
      {details.map((detail) => (
        <div key={detail.label} className='grid grid-cols-[1fr_1fr] items-center'>
          <p className='f-12-400 text-gray-700'>{detail.label}</p>
          <p className='f-12-400 text-primary'>{detail.value}</p>
        </div>
      ))}
    </div>
  );
};

const AddRecipientAccount = ({
  open,
  onOpenChange,
  recipientDetails,
  onRecipientUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientDetails: RecipientDetailsType;
  onRecipientUpdate?: (recipient: RecipientDetailsType) => void;
}) => {
  const [getFormConfig, { data: formConfig, isLoading: isFormConfigLoading }] = useLazyGetFormConfigQuery();
  const messageToastId = useRef<string | number>('');
  const [submitForm, { data: submitFormData, status: submitFormStatus, error: submitFormError }] =
    useSubmitFormMutation();
  const [addRecipientAccount, { status: addRecipientAccountStatus, error: addRecipientAccountError }] =
    useAddRecipientAccountMutation();
  const formRef = useRef<FormBuilderRef>(null);

  const onFailure = (error: any) => {
    captureException(error);
    toast.error(TOAST_MESSAGES.ERROR_RECIPIENT_ACCOUNT_CREATION);
  };
  const onSubmit = async (data: any) => {
    onOpenChange(false);

    messageToastId.current = toast.loading(TOAST_MESSAGES.LOADING_RECIPIENT_ACCOUNT_CREATION);
    await submitForm({
      form_type: FORM_TYPES.RECIPIENT_ACCOUNT,
      payload: data,
    });
  };

  useEffect(() => {
    if (submitFormStatus === 'fulfilled') {
      addRecipientAccount({
        recipient_id: recipientDetails.id,
        form_submission_id: submitFormData.form_submission_id,
      });
    } else if (submitFormStatus === 'rejected') {
      toast.dismiss(messageToastId.current);
      onFailure(submitFormError);
    }
  }, [submitFormStatus]);

  useEffect(() => {
    toast.dismiss(messageToastId.current);
    if (addRecipientAccountStatus === 'fulfilled') {
      toast.success(TOAST_MESSAGES.SUCCESS_RECIPIENT_ACCOUNT_CREATION);
      if (onRecipientUpdate) {
        onRecipientUpdate(recipientDetails);
      }
    } else if (addRecipientAccountStatus === 'rejected') {
      onFailure(addRecipientAccountError);
    }
  }, [addRecipientAccountStatus]);

  const handleSave = () => {
    formRef.current?.submit();
  };

  useEffect(() => {
    if (open && !formConfig) {
      getFormConfig({ form_id: FORM_TYPES.RECIPIENT_ACCOUNT });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>New Recipient Account</DialogHeader>
        <DialogBody className='flex justify-center p-6'>
          <div className='w-[50%] max-w-[400px]'>
            {isFormConfigLoading || !formConfig ? (
              <div className='flex h-full items-center justify-center'>
                <Loader className='border-gray-800 border-b-transparent' />
              </div>
            ) : (
              <>
                <RenderRecipientDetails recipientDetails={recipientDetails} />
                <FormBuilder ref={formRef} schema={formConfig} onSubmit={onSubmit} />
              </>
            )}
          </div>
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

export default AddRecipientAccount;
