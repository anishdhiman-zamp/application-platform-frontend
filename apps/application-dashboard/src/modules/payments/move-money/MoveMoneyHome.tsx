import { useEffect, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import AmountDetailsStep from 'modules/payments/move-money/AmountDetailsStep';
import {
  moveMoneyContextActions,
  useMoveMoneyContextStore,
  withMoveMoneyContext,
} from 'modules/payments/move-money/moveMoney.context';
import MoveMoneyMoreInfo from 'modules/payments/move-money/MoveMoneyMoreInfo';
import ReviewMoneyTransfer from 'modules/payments/move-money/ReviewMoneyTransfer';
import SelectBeneficiaryStep from 'modules/payments/move-money/SelectBeneficiaryStep';
import SelectSourceAccount from 'modules/payments/move-money/SelectSourceAccount';
import SuccessMoveMoney from 'modules/payments/move-money/SuccessMoveMoney';
import { MOVE_MONEY_TYPE } from 'modules/payments/payments.types';
import CreateTemplatePopover from 'modules/payments/templates/components/CreateTemplatePopover';
import { useRouter } from 'next/router';
import { defaultFn } from 'types/commonTypes';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch } from '@/hooks/toolkit';
import { resetBreadcrumb } from '@/store/slices/layout-configs';
import { capitalizeFirstLetter } from '@/utils/common';

const MoneyTransferHome = () => {
  const router = useRouter();
  const appDispatch = useAppDispatch();
  const { type, templateId, recipientId } = router.query;
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

  useEffect(() => {
    appDispatch(
      resetBreadcrumb([
        { title: 'Payments', href: ROUTES_PATH.PAYMENTS },
        { title: `${capitalizeFirstLetter(transferType)} transfer` },
      ]),
    );
  }, []);

  return (
    <div
      style={{ marginTop: `calc(-${currentStep * 100}vh)` }}
      className='w-full transition-all overflow-hidden duration-700 ease-in-out z-100 '
    >
      <SvgSpriteLoader
        id='x-close'
        size={14}
        className='fixed top-[72px] right-6 hover:bg-GRAY_100 p-1 rounded-md'
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
