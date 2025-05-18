import { useEffect, useState } from 'react';
import RequestApprovalDialogue, {
  type RequestApprovalPolicyConfig,
} from 'modules/dualAdmin/components.tsx/RequestApprovalDialogue';
import DualAdminCard from 'modules/dualAdmin/DualAdminCard';
import SkeletonLoaderListing from 'modules/team/components/SkeletonLoaderListing';
import NoWidgetData from 'modules/widgets/components/NoWidgetData';
import { useGetDualAdminPolicyQuery } from '@/apis/people';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import useAudienceMembers from '@/hooks/useAudienceMembers';
import { resetBreadcrumb } from '@/store/slices/layout-configs';
import { ResourceAudienceType } from '@/types/api/auth.types';
import type { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
import { ResourceType } from '@/types/api/policies.types';

export interface AudienceMembersDataType extends AudiencesByResourceResponse {
  team_name: string;
  team_color: string;
}

const DualAdminHome = () => {
  const { user } = useAppSelector((state) => state.user);
  const appDispatch = useAppDispatch();
  const { data: dualAdminPolicy, isLoading, isError, refetch } = useGetDualAdminPolicyQuery();
  const [requestApprovalPolicyConfig, setRequestApprovalPolicyConfig] = useState<RequestApprovalPolicyConfig | null>(
    null,
  );
  const [approversList, setApproversList] = useState<AudienceMembersDataType[]>([]);

  const {
    data: audiences,
    loading,
    allTeamsData,
  } = useAudienceMembers({
    resourceType: ResourceType.ORGANIZATION,
    resourceId: user?.orgs[0]?.organization_id ?? '',
  });

  useEffect(() => {
    if (!loading && audiences) {
      const formattedTeams =
        allTeamsData?.map((team) => ({
          label: team?.name,
          resource_audience_type: ResourceAudienceType.TEAM,
          resource_audience_id: team?.team_id,
          name: team.name,
          resource_type: ResourceType.ORGANIZATION,
          team_name: team?.name,
          team_color: team?.metadata?.color_hex_code,
          privilege: '',
          resource_id: user?.orgs[0]?.organization_id ?? '',
        })) ?? [];

      const organization = {
        label: user?.orgs[0]?.name ?? '',
        resource_audience_type: ResourceAudienceType.ORGANIZATION,
        resource_audience_id: user?.orgs[0]?.organization_id ?? '',
        name: user?.orgs[0]?.name ?? '',
        resource_type: ResourceType.ORGANIZATION,
        team_name: user?.orgs[0]?.name ?? '',
        team_color: '',
        privilege: '',
        resource_id: user?.orgs[0]?.organization_id ?? '',
      };

      setApproversList([...audiences, ...formattedTeams, organization]);
    }
  }, [audiences, allTeamsData, loading]);

  useEffect(() => {
    appDispatch(resetBreadcrumb([{ title: 'Policies', href: ROUTES_PATH.POLICIES }]));
  }, []);

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
