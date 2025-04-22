import React, { FC, useState } from 'react';
import { Sheet, SheetContent } from '@zamp-platform/ui';
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

  const renderStep = () => {
    if (onRecipientDetails)
      return <RecipientDetails onBack={() => setOnRecipientDetails(null)} recipientDetails={onRecipientDetails} />;
    if (isAddRecipient) return <AddRecipientAccount />;

    return (
      <RecipientsList
        onRecipientDetails={(recipientDetails) => setOnRecipientDetails(recipientDetails)}
        onAddRecipient={() => setIsAddRecipient(true)}
      />
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='p-0 h-screen overflow-hidden'>
        <div className='overflow-y-scroll h-full'>{renderStep()}</div>
      </SheetContent>
    </Sheet>
  );
};

export default RecipientsSideDrawer;
