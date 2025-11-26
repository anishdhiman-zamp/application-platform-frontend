import { PolicyDetailsType } from '@/deprecated/apis/paymentApi.types';
import DetailsView from '@/deprecated/modules/policies/listing/DetailsView';
import ListView from '@/deprecated/modules/policies/listing/ListView';
import { PolicyDialogType } from '@/deprecated/modules/policies/types';
import useAudienceMembers from '@/hooks/useAudienceMembers';
import { ResourceType } from '@/modules/shareResource';
import { defaultFnType } from '@/types/commonTypes';
import { Sheet, SheetContent } from '@zamp-platform/ui';
import { AnimatePresence, motion } from 'motion/react';
import { FC, useMemo, useState } from 'react';

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
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyDetailsType | null>(null);
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

  return (
    <Sheet
      open={isOpen}
      onOpenChange={() => {
        setSelectedPolicy(null);
        onClose();
      }}
    >
      <SheetContent className='h-screen overflow-hidden p-0'>
        <div className='px-4.5 py-6'>
          <AnimatePresence mode='wait'>
            {selectedPolicy ? (
              <motion.div
                key='details'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, type: 'spring' }}
              >
                <DetailsView
                  policy={selectedPolicy}
                  audienceMembersData={audienceMembersData}
                  onBack={() => setSelectedPolicy(null)}
                />
              </motion.div>
            ) : (
              <motion.div
                key='list'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, type: 'spring' }}
              >
                <ListView
                  policies={policies}
                  audienceMembersData={audienceMembersData}
                  onPolicyClick={setSelectedPolicy}
                  heading={heading}
                  onNew={handleNewPolicy}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PoliciesListSideDrawer;
