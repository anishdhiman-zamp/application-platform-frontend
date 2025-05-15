import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import MembersName from 'modules/team/components/members/MembersName';
import SkeletonLoaderListing from 'modules/team/components/SkeletonLoaderListing';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import useAudienceMembers from '@/hooks/useAudienceMembers';
import { ResourceType } from '@/modules/shareResource';
import { defaultFn } from '@/types/commonTypes';

const ApprovalPendingListing = () => {
  const { data: audienceMembersData, loading } = useAudienceMembers({
    resourceType: ResourceType.PAYMENTS,
    resourceId: '',
  });

  return (
    <div>
      <div className='grid grid-cols-4 gap-4 text-GRAY_700 border-b border-GRAY_100 f-11-450'>
        <div className='py-2.5 px-2'>Name</div>
        <div className='py-2.5 px-2'>Email</div>
        <div className='py-2.5 px-2'>Change</div>
        <div className='py-2.5 px-2'>Approval Status</div>
      </div>
      <CommonWrapper
        isLoading={loading}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<SkeletonLoaderListing length={4} columns={4} />}
      >
        {audienceMembersData?.map((member) => (
          <div key={member.resource_audience_id} className='grid grid-cols-4 gap-4 f-12-450 border-b border-GRAY_100'>
            <div className='flex items-center'>
              <MembersName value={member.user?.name ?? ''} />
            </div>
            <div className='flex items-center'>{member.user?.email}</div>
            <div className='flex items-center'>{member.privilege}</div>
            <div className='flex items-center gap-3 px-2 py-2'>
              <Button variant='outline' size='xsmall' onClick={defaultFn} className='gap-1 min-w-[88px]'>
                <SvgSpriteLoader id='check' size={14} />
                Approve
              </Button>
              <Button variant='outline' size='xsmall' onClick={defaultFn} className='gap-1 min-w-[88px]'>
                <SvgSpriteLoader id='x-close' size={14} />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </CommonWrapper>
    </div>
  );
};

export default ApprovalPendingListing;
