import { FC, useMemo, useState } from 'react';
import { Sheet, SheetContent } from '@zamp-platform/ui';
import DetailsView from 'modules/policies/listing/DetailsView';
import ListView from 'modules/policies/listing/ListView';
import useAudienceMembers from '@/hooks/useAudienceMembers';
import { PolicyDialogType } from '@/modules/policies/types';
import { ResourceType } from '@/modules/shareResource';
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
  const { data: audienceMembersData } = useAudienceMembers({
    resourceType: ResourceType.PAYMENTS,
    resourceId: '',
  });

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

  const [selectedPolicy, setSelectedPolicy] = useState<PolicyDetailsType | null>(null);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='p-0 h-screen overflow-hidden'>
        <div className='py-6 px-4.5'>
          {selectedPolicy ? (
            <DetailsView
              policy={selectedPolicy}
              audienceMembersData={audienceMembersData}
              onBack={() => setSelectedPolicy(null)}
            />
          ) : (
            <ListView
              policies={policies}
              audienceMembersData={audienceMembersData}
              onPolicyClick={setSelectedPolicy}
              heading={heading}
              onNew={handleNewPolicy}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PoliciesListSideDrawer;
