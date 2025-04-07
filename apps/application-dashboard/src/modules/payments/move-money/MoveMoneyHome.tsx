import AmountDetailsStep from 'modules/payments/move-money/AmountDetailsStep';
import {
  moveMoneyContextActions,
  useMoveMoneyContextStore,
  withMoveMoneyContext,
} from 'modules/payments/move-money/moveMoney.context';
import MoveMoneyMoreInfo from 'modules/payments/move-money/MoveMoneyMoreInfo';
import ReviewMoneyTransfer from 'modules/payments/move-money/ReviewMoneyTransfer';
import SelectBeneficiaryStep from 'modules/payments/move-money/SelectBeneficiaryStep';
import SuccessMoveMoney from 'modules/payments/move-money/SuccessMoveMoney';
import { MOVE_MONEY_TYPE } from 'modules/payments/payments.types';
import { useRouter } from 'next/router';
import { defaultFn } from 'types/commonTypes';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const MoneyTransferHome = () => {
  const router = useRouter();

  const { type } = router.query;
  const {
    state: { currentStep },
    dispatch,
  } = useMoveMoneyContextStore();

  const isSelfTransfer = type === MOVE_MONEY_TYPE.SELF_TRANSFER;

  const handleStepChange = (step: number) => {
    dispatch({
      type: moveMoneyContextActions.CURRENT_STEP,
      payload: { currentStep: step },
    });
  };

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
      {!isSelfTransfer && <SelectBeneficiaryStep handleStepChange={handleStepChange} />}
      <AmountDetailsStep isSelfTransfer={isSelfTransfer} handleStepChange={handleStepChange} />
      <MoveMoneyMoreInfo handleStepChange={handleStepChange} shouldReset={false} />
      <ReviewMoneyTransfer handleStepChange={handleStepChange} />
      <SuccessMoveMoney onReset={defaultFn} />
    </div>
  );
};

export default withMoveMoneyContext(MoneyTransferHome);
