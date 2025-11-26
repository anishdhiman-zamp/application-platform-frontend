import { useEffect, useMemo, useState } from 'react';
import SkeletonLoaderListing from 'modules/team/components/SkeletonLoaderListing';
import { TEAM_MEMBERS_PRIVILEGES } from 'modules/team/people.types';
import NoWidgetData from 'modules/widgets/components/NoWidgetData';
import { useGetDualAdminPolicyQuery } from '@/apis/people';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useAppSelector } from '@/hooks/toolkit';
import useAudienceMembers from '@/hooks/useAudienceMembers';
import type { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
import { ResourceType } from '@/unused/apis/policies.types';
import RequestApprovalDialogue, {
  type RequestApprovalPolicyConfig,
} from '@/unused/modules/dualAdmin/components.tsx/RequestApprovalDialogue';
import DualAdminCard from '@/unused/modules/dualAdmin/DualAdminCard';
import { PolicyActionType } from '@/unused/modules/policies/types';

export interface AudienceMembersDataType extends AudiencesByResourceResponse {
  team_name: string;
  team_color: string;
}

const DualAdminHome = () => {
  const { user } = useAppSelector((state) => state.user);
  const { data: dualAdminPolicy, isLoading, isError, refetch } = useGetDualAdminPolicyQuery();
  const [requestApprovalPolicyConfig, setRequestApprovalPolicyConfig] = useState<RequestApprovalPolicyConfig | null>(
    null,
  );
  const [approversList, setApproversList] = useState<AudienceMembersDataType[]>([]);

  const { data: audiences, loading } = useAudienceMembers({
    resourceType: ResourceType.ORGANIZATION,
    resourceId: user?.orgs[0]?.organization_id ?? '',
  });

  const hasPolicy = useMemo(() => {
    return !!dualAdminPolicy?.find((policy) => policy.action_type === PolicyActionType.MUTATE_POLICY)?.policy;
  }, [dualAdminPolicy]);

  useEffect(() => {
    if (!loading && audiences) {
      const systemAdmin = audiences?.filter((audience) => audience?.privilege === TEAM_MEMBERS_PRIVILEGES.SYSTEM_ADMIN);

      setApproversList(systemAdmin ?? []);
    }
  }, [audiences, loading]);

  return (
    <div className='p-10'>
      <div className='mb-5'>
        <div className='f-20-600 text-GRAY_1000 mb-1'>Dual-admin policies</div>
        <div className='f-11-450 text-GRAY_700'>
          Enable dual-admin policies for critical actions like managing policies, and access control
        </div>
      </div>
      <div>
        <table className='f-11-450 text-GRAY_700 w-full text-left'>
          <thead>
            <tr className='border-GRAY_400 border-b'>
              <th className='f-11-450 px-2 py-2.5'>Resource</th>
              <th className='f-11-450 px-2 py-2.5'>Approvers</th>
              <th className='f-11-450 px-2 py-2.5'></th>
              <th className='f-11-450 px-2 py-2.5'>Status</th>
              <th className='f-11-450 px-2 py-2.5'> </th>
            </tr>
          </thead>
          <tbody>
            {dualAdminPolicy?.map((policy, index) => (
              <DualAdminCard
                setRequestApprovalPolicyConfig={setRequestApprovalPolicyConfig}
                key={index}
                item={policy}
                hasPolicy={hasPolicy}
                approversList={approversList}
              />
            ))}
          </tbody>
        </table>
        <CommonWrapper
          isLoading={isLoading}
          skeletonType={SkeletonTypes.CUSTOM}
          loader={<SkeletonLoaderListing columns={4} length={4} />}
          noDataBanner={<NoWidgetData className='h-[400px]' text='No policies found' />}
          isNoData={dualAdminPolicy?.length === 0}
          isError={isError}
          refetchFunction={refetch}
        >
          <></>
        </CommonWrapper>
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
