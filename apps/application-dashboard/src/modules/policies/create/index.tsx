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
            <Button>Create</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePolicyDialog;
