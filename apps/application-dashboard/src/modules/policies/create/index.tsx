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
import ApprovalStep from 'modules/policies/create/ApprovalStep';
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
  const [approvalSteps, setApprovalSteps] = useState<number[]>([1]);

  const handleAddApprovalStep = () => {
    setApprovalSteps((prev) => [...prev, prev.length + 1]);
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
          <div className='bg-BG_GRAY_2 p-4 border-t border-gray-200'>
            <div className='f-11-400 text-GRAY_700 flex items-center gap-1 px-1 pb-2.5'>
              <SvgSpriteLoader id='arrow-down' size={12} />
              Approval steps
            </div>
            <div className='space-y-3'>
              {approvalSteps.map((step) => (
                <ApprovalStep key={step} stepNumber={step} />
              ))}
              <Button
                variant='outline'
                onClick={handleAddApprovalStep}
                size='xxs'
                className='flex items-center gap-1.5'
              >
                <SvgSpriteLoader id='layers-two-02' size={14} />
                Add step
              </Button>
            </div>
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
