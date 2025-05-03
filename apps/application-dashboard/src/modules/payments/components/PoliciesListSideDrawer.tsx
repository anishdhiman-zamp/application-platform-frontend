import { FC, useMemo } from 'react';
import { Button, Sheet, SheetContent } from '@zamp-platform/ui';
import PolicyCard from 'modules/payments/components/PolicyCard';
import { useGetAudiencesByOrganisationIdQuery } from '@/apis/people';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { useAppSelector } from '@/hooks/toolkit';
import { PolicyDialogType } from '@/modules/policies/types';
import { RootState } from '@/store';
import { PolicyDetailsType } from '@/types/api/paymentApi.types';
import { defaultFnType } from '@/types/commonTypes';

type PoliciesListSideDrawerProps = {
  onClose: defaultFnType;
  isOpen: boolean;
  policies: PolicyDetailsType[];
  type: PolicyDialogType;
  handlePolicyDialogOpenChange: (type: PolicyDialogType) => void;
};

const PoliciesListSideDrawer: FC<PoliciesListSideDrawerProps> = ({
  onClose,
  isOpen,
  policies,
  type,
  handlePolicyDialogOpenChange,
}) => {
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const { data: teamMembersData } = useGetAudiencesByOrganisationIdQuery({ organizationId }, { skip: !organizationId });

  const heading = useMemo(() => {
    switch (type) {
      case 'template':
        return 'Template creation policies';
      case 'payout':
        return 'Payout policies';
      default:
        return 'Policies';
    }
  }, [type]);

  const handleNewPolicy = () => {
    handlePolicyDialogOpenChange(type);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='p-0 h-screen overflow-hidden'>
        <div className='py-6 px-4.5'>
          <div className='flex items-center justify-between mb-4.5'>
            <h1 className='f-16-600'>{heading}</h1>
            <Button variant='outline' size='small' onClick={handleNewPolicy} className='gap-1'>
              <SvgSpriteLoader id='plus' size={14} />
              New
            </Button>
          </div>
          <div className='space-y-3.5 overflow-y-auto h-[calc(100vh-92px)] pb-6 [&::-webkit-scrollbar]:hidden'>
            {policies.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} teamMembersData={teamMembersData} />
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PoliciesListSideDrawer;
