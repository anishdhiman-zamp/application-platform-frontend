import React, { FC, useState } from 'react';
import { Sheet, SheetContent } from '@zamp-platform/ui';
import AddRecipient from 'modules/payments/recipients/AddRecipient';
import AddRecipientAccount from 'modules/payments/recipients/AddRecipientAccount';
import RecipientDetails from 'modules/payments/recipients/RecipientDetails';
import RecipientsList from 'modules/payments/recipients/RecipientsList';
import { useGetRecipientListQuery } from '@/apis/payments';
import { RecipientDetailsType } from '@/types/api/paymentApi.types';

type RecipientsSideDrawerProps = {
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
};

const RecipientsSideDrawer: FC<RecipientsSideDrawerProps> = ({ onClose, isOpen }) => {
  const [onRecipientDetails, setOnRecipientDetails] = useState<RecipientDetailsType | null>(null);
  const [isAddRecipient, setIsAddRecipient] = useState<boolean>(false);
  const [isAddRecipientAccount, setIsAddRecipientAccount] = useState<boolean>(false);

  // Add recipient list query to get fresh data
  const { refetch: refetchRecipientList } = useGetRecipientListQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const handleOpenAddRecipientAccount = (recipientDetails?: RecipientDetailsType) => {
    if (recipientDetails) setOnRecipientDetails(recipientDetails);
    setIsAddRecipientAccount(true);
  };

  const handleRecipientUpdate = (recipient: RecipientDetailsType) => {
    // Refetch the recipient list to get updated data
    refetchRecipientList().then(({ data }) => {
      if (data) {
        // Find the updated recipient in the new data
        const updatedRecipient = data.find((r) => r.id === recipient.id);

        if (updatedRecipient) {
          // Update the selected recipient details
          setOnRecipientDetails(updatedRecipient);
        }
      }
    });
  };

  const renderStep = () => {
    if (onRecipientDetails)
      return (
        <RecipientDetails
          onBack={() => setOnRecipientDetails(null)}
          recipientDetails={onRecipientDetails}
          onAddRecipientAccount={handleOpenAddRecipientAccount}
        />
      );

    return (
      <RecipientsList
        onRecipientDetails={(recipientDetails) => setOnRecipientDetails(recipientDetails)}
        onAddRecipient={() => setIsAddRecipient(true)}
        onAddRecipientAccount={handleOpenAddRecipientAccount}
      />
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='p-0 h-screen overflow-hidden'>
        <div className='overflow-y-scroll h-full'>{renderStep()}</div>
        <AddRecipient open={isAddRecipient} onOpenChange={setIsAddRecipient} />
        {onRecipientDetails && (
          <AddRecipientAccount
            recipientDetails={onRecipientDetails}
            open={isAddRecipientAccount}
            onOpenChange={setIsAddRecipientAccount}
            onRecipientUpdate={handleRecipientUpdate}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default RecipientsSideDrawer;
