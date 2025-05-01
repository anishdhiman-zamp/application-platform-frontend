import { FC } from 'react';
import { ListCard, Sheet, SheetContent, Tag } from '@zamp-platform/ui';
import { format } from 'date-fns';
import { DATE_FORMATS } from '@/constants/date.constants';
import { PolicyDetailsType } from '@/types/api/paymentApi.types';

type PoliciesListSideDrawerProps = {
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  policies: PolicyDetailsType[];
};

const PoliciesListSideDrawer: FC<PoliciesListSideDrawerProps> = ({ onClose, isOpen, policies }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='p-0 h-screen overflow-hidden'>
        <div className='py-6 px-4.5'>
          <h1 className='f-16-600 mb-4.5'>Policies</h1>
          <div className='space-y-3.5 overflow-y-auto h-[calc(100vh-92px)] pb-6 [&::-webkit-scrollbar]:hidden'>
            {policies.map((policy) => (
              <ListCard
                key={policy.id}
                header={
                  <div className='flex items-center gap-2'>
                    <span className='f-11-400 text-gray-700'>
                      Created on {format(new Date(policy.created_at), DATE_FORMATS.ddMMMyyyy)} by {policy.created_by}
                    </span>
                    {policy.status && (
                      <>
                        <span className='w-1 h-1 bg-orange-800 rounded-full' />
                        <span className='f-11-450 text-orange-800'>Approval pending</span>
                      </>
                    )}
                  </div>
                }
              >
                <div className='space-y-2'>
                  <h2 className='f-13-550'>{policy.name}</h2>
                  <div className='flex gap-1.5 flex-wrap'>
                    <Tag variant='gray'>{policy.policy_configurations.creator?.length ?? 'Any'} Creator</Tag>
                    <Tag variant='gray'>5 Source accounts</Tag>
                    <Tag variant='gray'>Any Recipient</Tag>
                  </div>
                </div>
              </ListCard>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PoliciesListSideDrawer;
