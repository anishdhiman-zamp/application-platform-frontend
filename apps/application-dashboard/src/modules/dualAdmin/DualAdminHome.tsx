import { useState } from 'react';
import RequestApprovalDialogue, {
  type RequestApprovalPolicyConfig,
} from 'modules/dualAdmin/components.tsx/RequestApprovalDialogue';
import DualAdminCard from 'modules/dualAdmin/DualAdminCard';
import SkeletonLoaderListing from 'modules/team/components/SkeletonLoaderListing';
import { useGetDualAdminPolicyQuery } from '@/apis/people';
const DualAdminHome = () => {
  const { data: dualAdminPolicy, isLoading } = useGetDualAdminPolicyQuery();
  const [requestApprovalPolicyConfig, setRequestApprovalPolicyConfig] = useState<RequestApprovalPolicyConfig | null>(
    null,
  );

  return (
    <div className='p-10'>
      <div className='mb-5'>
        <div className='f-20-600 text-GRAY_1000 mb-1'>Dual-admin approval policy</div>
        <div className='f-11-450 text-GRAY_700'>
          Enable dual-admin approval for critical actions like creating or modifying pages, policies, teams, and
          datasets
        </div>
      </div>
      <div>
        <table className='w-full text-left f-11-450 text-GRAY_700'>
          <thead>
            <tr className='border-b border-GRAY_400'>
              <th className='px-2 py-2.5 f-11-450'>Resource</th>
              <th className='px-2 py-2.5 f-11-450'>Approvers</th>
              <th className='px-2 py-2.5 f-11-450'></th>
              <th className='px-2 py-2.5 f-11-450'>Status</th>
              <th className='px-2 py-2.5 f-11-450'> </th>
            </tr>
          </thead>
          <tbody>
            {dualAdminPolicy?.map((policy, index) => (
              <DualAdminCard
                setRequestApprovalPolicyConfig={setRequestApprovalPolicyConfig}
                key={index}
                item={policy}
              />
            ))}
          </tbody>
        </table>
        {isLoading && <SkeletonLoaderListing columns={4} length={4} />}
      </div>

      <RequestApprovalDialogue
        isOpen={!!requestApprovalPolicyConfig}
        handleOpenChange={() => setRequestApprovalPolicyConfig(null)}
        policyConfig={requestApprovalPolicyConfig}
      />
    </div>
  );
};

export default DualAdminHome;
