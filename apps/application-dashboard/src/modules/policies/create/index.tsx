import React, { useState } from 'react';
import {
  Attribute,
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  StepCard,
} from '@zamp-platform/ui';
import { POLICY_APPROVAL_STEP_MODIFIERS } from 'modules/policies/constants';
import ApproverList from 'modules/policies/create/ApproverList';
import PolicyQuorumDropdown from 'modules/policies/create/PolicyQuorumDropdown';
import { PolicyQuorum } from 'modules/policies/types';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';

const creators = [
  {
    label: 'Chirag',
    value: 'chirag',
  },
  {
    label: 'John',
    value: 'john',
  },
  {
    label: 'Jane',
    value: 'jane',
  },
];

const CreatePolicyDialog = ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) => {
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [approvalStepModifier, setApprovalStepModifier] = useState<PolicyQuorum>(POLICY_APPROVAL_STEP_MODIFIERS[0]);

  const handleApprovalStepModifierChange = (modifier: PolicyQuorum) => {
    setApprovalStepModifier(modifier);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <h2 className='text-lg font-semibold'>New policy</h2>
        </DialogHeader>
        <DialogBody>
          <div className='flex gap-2 px-4 py-3'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div>
                  <Attribute
                    label='Creator'
                    value={selectedCreators.length > 0 ? selectedCreators.join(', ') : 'Any'}
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                    }}
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='z-[1001]' align='start'>
                {creators.map((creator) => (
                  <DropdownMenuCheckboxItem
                    key={creator.value}
                    checked={selectedCreators.includes(creator.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCreators([...selectedCreators, creator.value]);
                      } else {
                        setSelectedCreators(selectedCreators.filter((c) => c !== creator.value));
                      }
                    }}
                  >
                    {creator.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className='bg-BG_GRAY_2 p-4 flex flex-col border-t border-gray-200'>
            <div className='f-11-400 text-GRAY_700 flex items-center gap-1 px-1 pb-2.5'>
              <SvgSpriteLoader id='arrow-down' size={12} />
              Approval steps
            </div>
            <StepCard stepNumber={1}>
              <div className='flex gap-2.5'>
                <PolicyQuorumDropdown modifier={approvalStepModifier} onChange={handleApprovalStepModifierChange} />
                <ApproverList />
              </div>
            </StepCard>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className='flex justify-end gap-3'>
            <DialogClose asChild>
              <Button variant='secondary'>Discard</Button>
            </DialogClose>
            <Button>Create</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePolicyDialog;
