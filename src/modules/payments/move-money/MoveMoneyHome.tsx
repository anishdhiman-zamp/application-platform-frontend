import AmountDetailsStep from 'modules/payments/move-money/AmountDetailsStep';
import { useMoveMoneyContextStore, withMoveMoneyContext } from 'modules/payments/move-money/moveMoney.context';
import MoveMoneyMoreInfo from 'modules/payments/move-money/MoveMoneyMoreInfo';
import ReviewMoneyTransfer from 'modules/payments/move-money/ReviewMoneyTransfer';
import SelectBeneficiaryStep from 'modules/payments/move-money/SelectBeneficiaryStep';
import SuccessMoveMoney from 'modules/payments/move-money/SuccessMoveMoney';
import { defaultFn } from 'types/commonTypes';

const MoneyTransferHome = () => {
  const {
    state: { currentStep },
  } = useMoveMoneyContextStore();

  return (
    <div
      style={{ marginTop: `calc(-${currentStep * 100}vh)` }}
      className='w-full transition-all overflow-hidden duration-700 ease-in-out z-100'
    >
      <SelectBeneficiaryStep shouldReset={false} />
      <AmountDetailsStep />
      <MoveMoneyMoreInfo shouldReset={false} />
      <ReviewMoneyTransfer />
      <SuccessMoveMoney onReset={defaultFn} />
    </div>
  );
};

export default withMoveMoneyContext(MoneyTransferHome);
