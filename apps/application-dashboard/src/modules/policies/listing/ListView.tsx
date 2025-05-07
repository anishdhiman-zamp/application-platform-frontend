import React, { FC, useMemo, useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import PolicyCard from 'modules/policies/listing/PolicyCard';
import { AnimatePresence, motion } from 'motion/react';
import { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
import { PolicyDetailsType } from '@/types/api/paymentApi.types';

interface ListViewProps {
  policies: PolicyDetailsType[];
  audienceMembersData: AudiencesByResourceResponse[];
  onPolicyClick: (policy: PolicyDetailsType) => void;
  heading: string;
  onNew: () => void;
}

const STATUS_OPTIONS = [
  { label: 'All', value: 'ALL' },
  { label: 'Active policies', value: 'ACTIVE' },
  { label: 'Approval pending', value: 'APPROVAL_PENDING' },
];

const ListView: FC<ListViewProps> = ({ policies, audienceMembersData, onPolicyClick, heading, onNew }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      const matchesSearch = policy.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        status === 'ALL' ||
        (status === 'ACTIVE' && policy.status === 'ACTIVE') ||
        (status === 'APPROVAL_PENDING' && policy.status === 'APPROVAL_PENDING');

      return matchesSearch && matchesStatus;
    });
  }, [policies, search, status]);

  const currentStatusLabel = STATUS_OPTIONS.find((opt) => opt.value === status)?.label || 'All';

  return (
    <>
      <div className='flex items-center justify-between mb-4.5'>
        <h1 className='f-16-600'>{heading}</h1>
        <Button variant='outline' size='small' onClick={onNew} className='gap-1'>
          <SvgSpriteLoader id='plus' size={14} />
          New
        </Button>
      </div>
      <div className='flex items-center justify-between mb-3.5'>
        <input
          type='text'
          placeholder='Search'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='f-12-400 text-primary placeholder:text-gray-500 w-60 focus:outline-none'
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className='f-12-400 cursor-pointer flex items-center justify-between gap-1 focus:outline-none '
              type='button'
            >
              {currentStatusLabel}
              <SvgSpriteLoader id='chevron-down' size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='z-[1002]'>
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => setStatus(option.value)}
                className={status === option.value ? 'bg-gray-100' : ''}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='space-y-3.5 overflow-y-auto h-[calc(100vh-125px)] pb-6 [&::-webkit-scrollbar]:hidden'>
        <AnimatePresence mode='popLayout'>
          {filteredPolicies.map((policy) => (
            <motion.div
              key={policy.id}
              onClick={() => onPolicyClick(policy)}
              initial={{ opacity: 1, height: 'auto' }}
              exit={{
                opacity: 0,
                height: 0,
                marginBottom: 0,
                transition: { duration: 0.3 },
              }}
              layout
            >
              <PolicyCard policy={policy} audienceMembersData={audienceMembersData} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ListView;
