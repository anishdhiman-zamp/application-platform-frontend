import React, { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import PolicyCard from 'modules/policies/listing/PolicyCard';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
import { PolicyDetailsType } from '@/types/api/paymentApi.types';

interface ListViewProps {
  policies: PolicyDetailsType[];
  audienceMembersData: AudiencesByResourceResponse[];
  onPolicyClick: (policy: PolicyDetailsType) => void;
  heading: string;
  onNew: () => void;
}

const ListView: FC<ListViewProps> = ({ policies, audienceMembersData, onPolicyClick, heading, onNew }) => (
  <>
    <div className='flex items-center justify-between mb-4.5'>
      <h1 className='f-16-600'>{heading}</h1>
      <Button variant='outline' size='small' onClick={onNew} className='gap-1'>
        <SvgSpriteLoader id='plus' size={14} />
        New
      </Button>
    </div>
    <div className='space-y-3.5 overflow-y-auto h-[calc(100vh-92px)] pb-6 [&::-webkit-scrollbar]:hidden'>
      {policies.map((policy) => (
        <div key={policy.id} onClick={() => onPolicyClick(policy)}>
          <PolicyCard policy={policy} audienceMembersData={audienceMembersData} />
        </div>
      ))}
    </div>
  </>
);

export default ListView;
