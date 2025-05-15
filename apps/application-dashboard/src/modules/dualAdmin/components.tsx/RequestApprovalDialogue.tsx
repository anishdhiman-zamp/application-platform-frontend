import { type FC } from 'react';
import { Button, Dialog, DialogBody, DialogClose, DialogContent, DialogFooter } from '@zamp-platform/ui';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { useCreatePolicyMutation } from '@/apis/payments';
import { toast } from '@/components/common/toast/Toast';
import { transformFormDataToApiPayload } from '@/modules/policies/commons';
import { PolicyActionType, type PolicyFormData } from '@/modules/policies/types';
import type { CreatePolicyPayloadType } from '@/types/api/paymentApi.types';

export type RequestApprovalPolicyConfig = {
  data: PolicyFormData;
  action_type: PolicyActionType;
  resource_id: string;
  resource_type: string;
};

type RequestApprovalDialogueProps = {
  handleOpenChange: (open: boolean) => void;
  isOpen: boolean;
  policyConfig: RequestApprovalPolicyConfig | null;
};

const RequestApprovalDialogue: FC<RequestApprovalDialogueProps> = ({ handleOpenChange, isOpen, policyConfig }) => {
  const [createPolicy, { isLoading: createPolicyLoading }] = useCreatePolicyMutation();

  const handleRequestApproval = () => {
    if (!policyConfig) return;

    const config = transformFormDataToApiPayload(policyConfig?.data, []);

    const apiPayload: CreatePolicyPayloadType = {
      url: API_ENDPOINTS.POLICY_CREATE_POST,
      name: policyConfig?.data.policyName,
      resource_id: policyConfig?.resource_id,
      resource_type: policyConfig?.resource_type,
      action_type: policyConfig?.action_type,
      config: config,
    };

    createPolicy(apiPayload)
      .unwrap()
      .then(() => {
        handleOpenChange(false);
        toast.success('Policy created successfully');
      })
      .catch(() => {
        toast.error('Failed to create policy');
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent size='small' className='max-w-[334px]' showCloseButton onClick={(e) => e.stopPropagation()}>
        <DialogBody className='overflow-y-auto [&::-webkit-scrollbar]:hidden z-[1002]'>
          <div className='f-16-600 text-primary pb-6 pt-5 px-5'>
            {`You'll need other admins to approve enabling/disabling this policy`}
          </div>
        </DialogBody>
        <DialogFooter>
          <div className='flex justify-end gap-2'>
            <DialogClose asChild>
              <Button variant='secondary' size='small'>
                Go Back
              </Button>
            </DialogClose>
            <Button size='small' onClick={handleRequestApproval} isLoading={createPolicyLoading}>
              Request approval
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestApprovalDialogue;
