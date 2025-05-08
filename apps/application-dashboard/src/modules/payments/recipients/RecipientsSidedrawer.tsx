import React, { FC, useState } from 'react';
import { Sheet, SheetContent } from '@zamp-platform/ui';
import AddRecipient from 'modules/payments/recipients/AddRecipient';
import AddRecipientAccount from 'modules/payments/recipients/AddRecipientAccount';
import RecipientDetails from 'modules/payments/recipients/RecipientDetails';
import RecipientsList from 'modules/payments/recipients/RecipientsList';
import { RecipientDetailsType } from '@/types/api/paymentApi.types';

type RecipientsSideDrawerProps = {
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
};

const RecipientsSideDrawer: FC<RecipientsSideDrawerProps> = ({ onClose, isOpen }) => {
  const [onRecipientDetails, setOnRecipientDetails] = useState<RecipientDetailsType | null>(null);
  const [isAddRecipient, setIsAddRecipient] = useState<boolean>(false);
  const [isAddRecipientAccount, setIsAddRecipientAccount] = useState<boolean>(false);
  const handleOpenAddRecipientAccount = (recipientDetails?: RecipientDetailsType) => {
    if (recipientDetails) setOnRecipientDetails(recipientDetails);
    setIsAddRecipientAccount(true);
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
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default RecipientsSideDrawer;
