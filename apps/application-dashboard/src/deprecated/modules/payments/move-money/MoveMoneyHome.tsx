'use client';

import AmountDetailsStep from '@/deprecated/modules/payments/move-money/AmountDetailsStep';
import {
  moveMoneyContextActions,
  useMoveMoneyContextStore,
  withMoveMoneyContext,
} from '@/deprecated/modules/payments/move-money/moveMoney.context';
import MoveMoneyMoreInfo from '@/deprecated/modules/payments/move-money/MoveMoneyMoreInfo';
import ReviewMoneyTransfer from '@/deprecated/modules/payments/move-money/ReviewMoneyTransfer';
import SelectBeneficiaryStep from '@/deprecated/modules/payments/move-money/SelectBeneficiaryStep';
import SelectSourceAccount from '@/deprecated/modules/payments/move-money/SelectSourceAccount';
import SuccessMoveMoney from '@/deprecated/modules/payments/move-money/SuccessMoveMoney';
import { MOVE_MONEY_TYPE } from '@/deprecated/modules/payments/payments.types';
import CreateTemplatePopover from '@/deprecated/modules/payments/templates/components/CreateTemplatePopover';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { defaultFn } from 'types/commonTypes';

const MoneyTransferHome = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams?.get('type');
  const templateId = searchParams?.get('templateId');
  const recipientId = searchParams?.get('recipientId');
  const isSelfTransfer = type === MOVE_MONEY_TYPE.SELF_TRANSFER;
  const transferType = isSelfTransfer ? MOVE_MONEY_TYPE.SELF_TRANSFER : MOVE_MONEY_TYPE.SINGLE_TRANSFER;
  const [createTemplateType, setCreateTemplateType] = useState<MOVE_MONEY_TYPE | null>(null);
  const {
    state: { currentStep },
    dispatch,
  } = useMoveMoneyContextStore();

  const handleStepChange = (step: number) => {
    dispatch({
      type: moveMoneyContextActions.CURRENT_STEP,
      payload: { currentStep: step },
    });
  };

  return (
    <div
      style={{ marginTop: `calc(-${currentStep * 100}vh)` }}
      className='z-100 w-full overflow-hidden transition-all duration-700 ease-in-out'
    >
      <SvgSpriteLoader
        id='x-close'
        size={14}
        className='hover:bg-GRAY_100 fixed top-[72px] right-6 rounded-md p-1'
        onClick={() => router.back()}
      />
      <SelectSourceAccount
        transferType={transferType}
        handleStepChange={handleStepChange}
        recipientId={(recipientId as string) ?? ''}
        templateId={(templateId as string) ?? ''}
      />
      {!isSelfTransfer && (
        <SelectBeneficiaryStep handleStepChange={handleStepChange} recipientId={(recipientId as string) ?? ''} />
      )}
      <AmountDetailsStep isSelfTransfer={isSelfTransfer} handleStepChange={handleStepChange} />
      <MoveMoneyMoreInfo handleStepChange={handleStepChange} />
      <ReviewMoneyTransfer transferType={transferType} handleStepChange={handleStepChange} />
      <SuccessMoveMoney onReset={defaultFn} transferType={transferType} />
      {!!createTemplateType && (
        <CreateTemplatePopover
          paymentType={createTemplateType}
          isOpen={!!createTemplateType}
          onClose={() => setCreateTemplateType(null)}
        />
      )}
    </div>
  );
};

export default withMoveMoneyContext(MoneyTransferHome);
