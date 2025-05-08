import React, { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { Ellipsis } from 'lucide-react';
import CreatePolicyDialog from 'modules/policies/create';
import PolicyDeleteConfirmPopup from 'modules/policies/listing/PolicyDeleteConfirmPopup';
import { PolicyActionType } from 'modules/policies/types';
import { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
import { PolicyDetailsType } from '@/types/api/paymentApi.types';

const PolicyActionsDropdown = ({
  policy,
  audienceMembersData,
}: {
  policy: PolicyDetailsType;
  audienceMembersData?: AudiencesByResourceResponse[];
}) => {
  const [isDeleteConfirmPopupOpen, setIsDeleteConfirmPopupOpen] = useState(false);
  const [isEditPolicyDialogOpen, setIsEditPolicyDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className='focus-visible:ring-0 focus-visible:ring-offset-0'
          onClick={(e) => e.stopPropagation()}
        >
          <Ellipsis size={14} className='cursor-pointer' />
        </DropdownMenuTrigger>
        <DropdownMenuContent className='z-[1001] max-h-60 overflow-y-auto' align='end'>
          <DropdownMenuItem
            className='hover:bg-gray-100 rounded-md flex gap-1.5 text-primary flex-1 f-12-500 items-center'
            onClick={(e) => {
              e.stopPropagation();
              setIsEditPolicyDialogOpen(true);
            }}
          >
            <SvgSpriteLoader id='edit-03' size={12} />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className='hover:bg-gray-100 rounded-md flex gap-1.5 text-red-800 flex-1 f-12-500 items-center'
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteConfirmPopupOpen(true);
            }}
          >
            <SvgSpriteLoader id='trash-03' size={12} />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <PolicyDeleteConfirmPopup
        isOpen={isDeleteConfirmPopupOpen}
        onClose={() => setIsDeleteConfirmPopupOpen(false)}
        policy={policy}
        audienceMembersData={audienceMembersData}
      />
      <CreatePolicyDialog
        type={policy.action_type === PolicyActionType.CREATE_PAYMENT ? 'payout' : 'template'}
        isOpen={isEditPolicyDialogOpen}
        onOpenChange={setIsEditPolicyDialogOpen}
        policy={policy}
      />
    </>
  );
};

export default PolicyActionsDropdown;
