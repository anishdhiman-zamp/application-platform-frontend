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
} from '@zamp-platform/ui';
import { DEFAULT_APPROVAL_STEP } from 'modules/policies/constants';
import ApprovalFlow from 'modules/policies/create/ApprovalFlow';
import { ApprovalFlowStep } from 'modules/policies/types';

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
  const [approvalSteps, setApprovalSteps] = useState<ApprovalFlowStep[]>([DEFAULT_APPROVAL_STEP]);

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
          <ApprovalFlow approvalSteps={approvalSteps} onChange={setApprovalSteps} />
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
