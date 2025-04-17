import { useMemo, useState } from 'react';
import AmountDetailsStep from 'modules/payments/move-money/AmountDetailsStep';
import { TEMPLATES } from 'modules/payments/move-money/move-money.dummy';
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
import { TemplateDetailsType } from '@/types/api/paymentApi.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const MoneyTransferHome = () => {
  const router = useRouter();
  const { type, templateId } = router.query;
  const isSelfTransfer = type === MOVE_MONEY_TYPE.SELF_TRANSFER;
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

  const defaultTemplate = useMemo(() => {
    return TEMPLATES.find((template: TemplateDetailsType) => template?.id === templateId);
  }, [templateId]);

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
        transferType={isSelfTransfer ? MOVE_MONEY_TYPE.SELF_TRANSFER : MOVE_MONEY_TYPE.SINGLE_TRANSFER}
        handleStepChange={handleStepChange}
      />
      {!isSelfTransfer && (
        <SelectBeneficiaryStep defaultTemplate={defaultTemplate} handleStepChange={handleStepChange} />
      )}
      <AmountDetailsStep isSelfTransfer={isSelfTransfer} handleStepChange={handleStepChange} />
      <MoveMoneyMoreInfo handleStepChange={handleStepChange} shouldReset={false} />
      <ReviewMoneyTransfer handleStepChange={handleStepChange} />
      <SuccessMoveMoney onReset={defaultFn} />
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
