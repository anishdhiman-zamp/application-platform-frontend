import { type FC } from 'react';
import { Button, Dialog, DialogBody, DialogClose, DialogContent, DialogFooter } from '@zamp-platform/ui';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { useCreatePolicyMutation, useDeletePolicyMutation } from '@/apis/payments';
import { toast } from '@/components/common/toast/Toast';
import { transformFormDataToApiPayload } from '@/modules/policies/commons';
import { PolicyActionType, type PolicyFormData } from '@/modules/policies/types';
import type { CreatePolicyPayloadType } from '@/types/api/paymentApi.types';
import { PolicyResultStatus } from '@/types/api/policies.types';
import {
  APPROVAL_REQUEST_FAIL_TOAST,
  APPROVAL_REQUEST_TOAST,
} from '@/utils/accessPermission/accessPermission.constants';

export type RequestApprovalPolicyConfig = {
  data: PolicyFormData;
  action_type: PolicyActionType;
  resource_id: string;
  resource_type: string;
  status: string;
  policy_id: string;
};

type RequestApprovalDialogueProps = {
  handleOpenChange: (open: boolean) => void;
  isOpen: boolean;
  policyConfig: RequestApprovalPolicyConfig | null;
};

const RequestApprovalDialogue: FC<RequestApprovalDialogueProps> = ({ handleOpenChange, isOpen, policyConfig }) => {
  const [createPolicy, { isLoading: createPolicyLoading }] = useCreatePolicyMutation();
  const [deletePolicy, { isLoading: deletePolicyLoading }] = useDeletePolicyMutation();

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

    if (policyConfig?.status !== PolicyResultStatus.APPROVED) {
      createPolicy(apiPayload)
        .unwrap()
        .then(() => {
          handleOpenChange(false);
          toast.success(APPROVAL_REQUEST_TOAST);
        })
        .catch(() => {
          toast.error(APPROVAL_REQUEST_FAIL_TOAST);
        });
    } else {
      deletePolicy(policyConfig?.policy_id)
        .unwrap()
        .then(() => {
          handleOpenChange(false);
          toast.success(APPROVAL_REQUEST_TOAST);
        })
        .catch(() => {
          toast.error(APPROVAL_REQUEST_FAIL_TOAST);
        });
    }
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
            <Button
              size='small'
              className='min-w-[124px]'
              onClick={handleRequestApproval}
              isLoading={createPolicyLoading || deletePolicyLoading}
            >
              Request approval
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestApprovalDialogue;
