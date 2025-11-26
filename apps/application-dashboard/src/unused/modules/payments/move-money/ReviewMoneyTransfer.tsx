import { FC, useMemo } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { DEFAULT_BANK } from 'constants/icons';
import { useRouter } from 'next/navigation';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { cn, getCommaSeparatedNumber, snakeCaseToSentenceCase } from 'utils/common';
import { useLazyDownloadFileQuery } from '@/apis/dataset';
import ProgressBar from '@/components/common/RingProgress';
import { COLORS } from '@/constants/colors';
import { useInitiatePaymentMutation } from '@/unused/apis/payments';
import AccountWithLogo from '@/unused/modules/payments/move-money/components/AccountWithLogo';
import { useMoveMoneyContextStore } from '@/unused/modules/payments/move-money/moveMoney.context';
import { MASK_DOTS } from '@/unused/modules/payments/payments.constant';
import { MOVE_MONEY_TYPE } from '@/unused/modules/payments/payments.types';
import { Button } from 'components/common/button/Button';
import { toast } from 'components/common/toast/Toast';

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
      templateDetails,
    },
  } = useMoveMoneyContextStore();
  const [initiatePayment, { isLoading }] = useInitiatePaymentMutation();
  const router = useRouter();
  const showRecipientDetails = useMemo(() => {
    return transferType === MOVE_MONEY_TYPE.SINGLE_TRANSFER && destinationAccountDetails?.account_number;
  }, [transferType, destinationAccountDetails?.account_number]);
  const [downloadFile, { isLoading: isDownloading }] = useLazyDownloadFileQuery();

  const sourceAccountName = useMemo(
    () => `${sourceAccountDetails?.account_name} ${MASK_DOTS} ${sourceAccountDetails?.masked_account_number}`,
    [sourceAccountDetails],
  );
  const destinationAccountName = useMemo(
    () => `${destinationAccountDetails?.account_name} ${MASK_DOTS} ${destinationAccountDetails?.masked_account_number}`,
    [destinationAccountDetails],
  );

  const handleDownloadFile = (fileImportId: string) => {
    downloadFile({ fileImportId })
      .unwrap()
      .then((res) => {
        router.push(res.download_url);
      })
      .catch(() => {
        toast.error('Failed to download file');
      });
  };

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
      attachments: moreDetails?.attachments?.map((attachment) => ({ file_upload_id: attachment?.identifier })),
      template_id: templateDetails?.id,
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
    <div className='h-screen overflow-y-scroll py-20'>
      <div className='m-auto max-w-75'>
        <div className='f-22-550 mb-5'>Review</div>
        <div
          className={cn('mb-5', transferType === MOVE_MONEY_TYPE.SINGLE_TRANSFER && 'border-GRAY_400 border-b pb-5')}
        >
          <div className='mb-4'>
            {recipientDetails?.name && <div className='f-14-450 mb-1'>Payment to {recipientDetails?.name}</div>}
            <div className='f-32-500'>
              {amountDetails?.currency?.label} {getCommaSeparatedNumber(Number(amountDetails?.amount), 2)}
            </div>
          </div>
          {showRecipientDetails && (
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
          <div className='f-12-400 text-GRAY_700 mb-1.5'>Transfer from {sourceAccountDetails?.account_holder_name}</div>
          <AccountWithLogo
            className='border-GRAY_400 mb-5 rounded-md border'
            logo={sourceAccountDetails?.banking_partner ?? DEFAULT_BANK}
            name={sourceAccountName}
            subtitle={sourceAccountDetails?.bank_name}
          />
        </div>
        {transferType === MOVE_MONEY_TYPE.SELF_TRANSFER && (
          <div>
            <div className='f-12-400 text-GRAY_700 mb-1.5'>Transfer to</div>
            <AccountWithLogo
              className='border-GRAY_400 mb-5 rounded-md border'
              logo={destinationAccountDetails?.banking_partner ?? DEFAULT_BANK}
              name={destinationAccountName}
              subtitle={destinationAccountDetails?.bank_name}
            />
          </div>
        )}
        <div className='flex flex-col gap-6'>
          {moreDetails?.externalMemo && (
            <div>
              <div className='f-12-400 text-GRAY_700 mb-1.5'>Memo for recipient</div>
              <div className='f-12-450'>{moreDetails?.externalMemo}</div>
            </div>
          )}
          {moreDetails?.note && (
            <div>
              <div className='f-12-400 text-GRAY_700 mb-1.5'>Notes</div>
              <div className='f-12-450'>{moreDetails?.note}</div>
            </div>
          )}
          {!!moreDetails?.attachments.length && (
            <div>
              <div className='f-12-400 text-GRAY_700 mb-3'>Attachments</div>
              {moreDetails?.attachments?.map((attachment, index) => (
                <div key={index} className='mb-2 flex justify-between'>
                  <div className='bg-GRAY_100 flex items-center gap-2 rounded-md px-2 py-1.5'>
                    <SvgSpriteLoader size={14} id='file-02' />
                    <div className='f-12-400'>{attachment?.fileName}</div>
                  </div>
                  {isDownloading ? (
                    <ProgressBar
                      trackColor={COLORS.BLACK}
                      indicatorColor={COLORS.WHITE}
                      indicatorWidth={2.5}
                      trackWidth={2.5}
                      size={14}
                      className='animate-spin'
                      progress={30}
                    />
                  ) : (
                    <SvgSpriteLoader
                      size={14}
                      id='download-02'
                      onClick={() => handleDownloadFile(attachment?.identifier)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='mt-10 flex gap-3'>
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
