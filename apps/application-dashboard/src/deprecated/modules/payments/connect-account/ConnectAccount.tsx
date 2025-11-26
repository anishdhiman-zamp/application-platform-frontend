import ConnectAccountGetStarted from '@/deprecated/modules/payments/connect-account/components/ConnectAccountGetStarted';
import ConnectAccountSelectDataset from '@/deprecated/modules/payments/connect-account/components/ConnectAccountSelectDataset';
import { CONNECT_ACCOUNT_STEPS } from '@/deprecated/modules/payments/payments.types';
import { useState } from 'react';

const ConnectAccount = () => {
  const [step, setStep] = useState<number>(0);

  const handleStep = (step: number) => {
    setStep(step);
  };

  const renderStep = () => {
    switch (step) {
      case CONNECT_ACCOUNT_STEPS.GET_STARTED:
        return <ConnectAccountGetStarted onNextStep={handleStep} />;
      case CONNECT_ACCOUNT_STEPS.SELECT_DATASET:
        return <ConnectAccountSelectDataset stateChange={handleStep} />;
      default:
        return null;
    }
  };

  return <div className='flex items-center justify-center'>{renderStep()}</div>;
};

export default ConnectAccount;
