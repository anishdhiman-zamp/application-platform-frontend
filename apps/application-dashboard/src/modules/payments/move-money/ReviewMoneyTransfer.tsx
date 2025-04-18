import { FC } from 'react';
import { toast } from 'react-toastify';
import { DEFAULT_BANK } from 'constants/icons';
import AccountWithLogo from 'modules/payments/move-money/components/AccountWithLogo';
import { useMoveMoneyContextStore } from 'modules/payments/move-money/moveMoney.context';
import { MASK_DOTS } from 'modules/payments/payments.constant';
import { MOVE_MONEY_TYPE } from 'modules/payments/payments.types';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { cn, snakeCaseToSentenceCase } from 'utils/common';
import { useInitiatePaymentMutation } from '@/apis/payments';
import { Button } from 'components/common/button/Button';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

interface ReviewMoneyTransferProps {
  handleStepChange: (step: number) => void;
  transferType: MOVE_MONEY_TYPE;
}

const ReviewMoneyTransfer: FC<ReviewMoneyTransferProps> = ({ handleStepChange, transferType }) => {
  const {
    state: {
      recipientDetails,
      sourceAccountDetails,
      destinationAccountDetails,
      amountDetails,
      moreDetails,
      currentStep,
    },
  } = useMoveMoneyContextStore();
  const [initiatePayment, { isLoading }] = useInitiatePaymentMutation();

  const handleBackClick = () => handleStepChange(currentStep - 1);
  const handleNextClick = () => {
    initiatePayment({
      type: transferType,
      source_account_id: sourceAccountDetails?.id ?? '',
      destination_account_id: destinationAccountDetails?.id ?? '',
      amount: Number(amountDetails?.amount),
      payments_processing_mode: (amountDetails?.processingMode?.value as string) ?? '',
      statement_descriptor: moreDetails?.externalMemo ?? '',
      notes: moreDetails?.note ? [moreDetails?.note] : [],
    })
      .unwrap()
      .then(() => {
        handleStepChange(currentStep + 1);
      })
      .catch((err) => {
        toast.error(err?.data?.message ?? 'Something went wrong');
      });
  };

  return (
    <div className='h-screen overflow-y-scroll py-[136px]'>
      <div className='max-w-75 m-auto'>
        <div className='f-22-550 mb-5'>Review</div>
        <div
          className={cn(' mb-5', transferType === MOVE_MONEY_TYPE.SINGLE_TRANSFER && 'border-b border-GRAY_400 pb-5')}
        >
          <div className='mb-4'>
            {recipientDetails?.name && <div className='f-14-450 mb-1'>Payment to {recipientDetails?.name}</div>}
            <div className='f-32-500'>
              {amountDetails?.currency?.label} {Number(amountDetails?.amount)?.toLocaleString()}
            </div>
          </div>
          {transferType === MOVE_MONEY_TYPE.SINGLE_TRANSFER && destinationAccountDetails?.account_number && (
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-4'>
                <div className='grid grid-cols-2'>
                  <div className='f-12-400 text-GRAY_700'>Recipient Bank</div>
                  <div className='f-12-450 whitespace-no-wrap'>
                    {snakeCaseToSentenceCase(destinationAccountDetails?.bank_name ?? '')}
                  </div>
                </div>
              </div>
              <div className='flex flex-col gap-4'>
                <div className='grid grid-cols-2'>
                  <div className='f-12-400 text-GRAY_700'>Account number</div>
                  <div className='f-12-450 whitespace-no-wrap'>
                    {snakeCaseToSentenceCase(destinationAccountDetails?.account_number ?? '')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className='f-12-400 mb-1.5 text-GRAY_700'>Transfer from</div>
          <AccountWithLogo
            className='border border-GRAY_400 mb-5 rounded-md'
            logo={DEFAULT_BANK}
            name={`${sourceAccountDetails?.account_name} ${MASK_DOTS} ${sourceAccountDetails?.masked_account_number}`}
            subtitle={sourceAccountDetails?.bank_name}
          />
        </div>
        {transferType === MOVE_MONEY_TYPE.SELF_TRANSFER && (
          <div>
            <div className='f-12-400 mb-1.5 text-GRAY_700'>Transfer to</div>
            <AccountWithLogo
              className='border border-GRAY_400 mb-5 rounded-md'
              logo={DEFAULT_BANK}
              name={`${destinationAccountDetails?.account_name} ${MASK_DOTS} ${destinationAccountDetails?.masked_account_number}`}
              subtitle={destinationAccountDetails?.bank_name}
            />
          </div>
        )}
        <div className='flex flex-col gap-6'>
          {moreDetails?.externalMemo && (
            <div>
              <div className='f-12-400 mb-1.5 text-GRAY_700'>External memo</div>
              <div className='f-12-450'>{moreDetails?.externalMemo}</div>
            </div>
          )}
          {moreDetails?.note && (
            <div>
              <div className='f-12-400 mb-1.5 text-GRAY_700'>Notes</div>
              <div className='f-12-450'>{moreDetails?.note}</div>
            </div>
          )}
          <div>
            <div className='f-12-400 mb-3 text-GRAY_700'>Attachments</div>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className='flex justify-between mb-2'>
                <div className='flex items-center gap-2 bg-GRAY_100 rounded-md py-1.5 px-2'>
                  <SvgSpriteLoader size={14} id='file-02' />
                  <div className='f-12-400'>file_name_abracadabra.pdf</div>
                </div>
                <SvgSpriteLoader size={14} id='download-02' />
              </div>
            ))}
          </div>
        </div>
        <div className='flex gap-3 mt-10'>
          <Button
            type={BUTTON_TYPES.SECONDARY}
            size={SIZE_TYPES.MEDIUM}
            id='MOVE_MONEY_REVIEW_BACK'
            onClick={handleBackClick}
          >
            Back
          </Button>
          <Button
            type={BUTTON_TYPES.PRIMARY}
            size={SIZE_TYPES.MEDIUM}
            id='MOVE_MONEY_REVIEW_SEND_PAYMENT'
            className='min-w-[120px]'
            onClick={handleNextClick}
            isLoading={isLoading}
          >
            Send Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewMoneyTransfer;
