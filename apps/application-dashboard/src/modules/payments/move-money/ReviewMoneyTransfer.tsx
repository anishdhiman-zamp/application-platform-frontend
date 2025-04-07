import { FC } from 'react';
import { DEFAULT_BANK } from 'constants/icons';
import AccountWithLogo from 'modules/payments/move-money/components/AccountWithLogo';
import { useMoveMoneyContextStore } from 'modules/payments/move-money/moveMoney.context';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { snakeCaseToSentenceCase } from 'utils/common';
import { Button } from 'components/common/button/Button';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

interface ReviewMoneyTransferProps {
  handleStepChange: (step: number) => void;
}

const ReviewMoneyTransfer: FC<ReviewMoneyTransferProps> = ({ handleStepChange }) => {
  const {
    state: { contactDetails, destinationAccountDetails, amountDetails, moreDetails, currentStep },
  } = useMoveMoneyContextStore();

  const onBackClick = () => handleStepChange(currentStep - 1);
  const onNextClick = () => handleStepChange(currentStep + 1);

  return (
    <div className='h-screen overflow-y-scroll py-[136px]'>
      <div className='max-w-75 m-auto'>
        <div className='f-22-550 mb-5'>Review</div>
        <div className='border-b border-GRAY_400 pb-5 mb-5'>
          <div className='mb-4'>
            <div className='f-14-450 mb-1'>Payment to {contactDetails?.label}</div>
            <div className='f-32-500'>
              {amountDetails?.currency?.label} {Number(amountDetails?.amount)?.toLocaleString()}
            </div>
          </div>
          {destinationAccountDetails?.account_name && (
            <div className='flex flex-col gap-4'>
              {Object.keys(destinationAccountDetails).map((key, index) => (
                <div key={index} className='grid grid-cols-2'>
                  <div className='f-12-400 text-GRAY_700'>{snakeCaseToSentenceCase(key)}</div>
                  <div className='f-12-450 whitespace-no-wrap'>
                    {snakeCaseToSentenceCase(
                      destinationAccountDetails[key as keyof typeof destinationAccountDetails] as string,
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className='f-12-400 mb-1.5 text-GRAY_700'>From</div>
          <AccountWithLogo
            className='border border-GRAY_400 mb-5 rounded-md'
            logo={DEFAULT_BANK}
            name={destinationAccountDetails?.account_name}
            subtitle={3123}
          />
        </div>
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
            id='SELF_TRANSFER_REVIEW_BACK'
            onClick={onBackClick}
          >
            Back
          </Button>
          <Button size={SIZE_TYPES.MEDIUM} id='SELF_TRANSFER_REVIEW_SEND_PAYMENT' onClick={onNextClick}>
            Send Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewMoneyTransfer;
