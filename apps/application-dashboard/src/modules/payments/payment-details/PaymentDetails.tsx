import { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { format } from 'date-fns';
import PaymentDetailsSkeleton from 'modules/payments/payment-details/PaymentDetailsSkeleton';
import { PAYMENT_STATUS_TYPES } from 'modules/payments/payments.types';
import { useRouter } from 'next/router';
import { useLazyDownloadFileQuery } from '@/apis/dataset';
import { useGetPaymentDetailsQuery } from '@/apis/payments';
import ProgressBar from '@/components/common/RingProgress';
import { toast } from '@/components/common/toast/Toast';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { COLORS } from '@/constants/colors';
import { DATE_FORMATS } from '@/constants/date.constants';
import { cn, createDateObjectFromUTCString, getCommaSeparatedNumber } from '@/utils/common';

type PaymentDetailsProps = {
  paymentDetailsId: string;
};

const cardStyleByStatus = {
  [PAYMENT_STATUS_TYPES.APPROVAL_PENDING]: {
    backgroundColor: 'bg-[#FFFCED]',
    borderColor: 'border-ORANGE_800',
    textColor: 'text-ORANGE_800',
  },
  [PAYMENT_STATUS_TYPES.SENT_TO_BANK]: {
    backgroundColor: 'bg-[#FFFCED]',
    borderColor: 'border-ORANGE_800',
    textColor: 'text-ORANGE_800',
  },
  [PAYMENT_STATUS_TYPES.PENDING]: {
    backgroundColor: 'bg-[#FFFCED]',
    borderColor: 'border-ORANGE_800',
    textColor: 'text-ORANGE_800',
  },
  [PAYMENT_STATUS_TYPES.SUCCEEDED]: {
    backgroundColor: 'bg-[#E6F9F2]',
    borderColor: 'border-GREEN_800',
    textColor: 'text-GREEN_800',
  },
  [PAYMENT_STATUS_TYPES.FAILED]: {
    backgroundColor: 'bg-[#FFE6E6]',
    borderColor: 'border-RED_800',
    textColor: 'text-RED_800',
  },
  [PAYMENT_STATUS_TYPES.BLOCKED]: {
    backgroundColor: 'bg-[#FFE6E6]',
    borderColor: 'border-RED_800',
    textColor: 'text-RED_800',
  },
  [PAYMENT_STATUS_TYPES.REJECTED]: {
    backgroundColor: 'bg-[#FFE6E6]',
    borderColor: 'border-RED_800',
    textColor: 'text-RED_800',
  },
};

const PaymentDetails: FC<PaymentDetailsProps> = ({ paymentDetailsId }) => {
  const {
    data: paymentDetails,
    isFetching,
    isError,
    refetch,
  } = useGetPaymentDetailsQuery(paymentDetailsId, {
    refetchOnMountOrArgChange: false,
    skip: !paymentDetailsId,
  });
  const router = useRouter();

  const [downloadFile, { isLoading: isDownloading }] = useLazyDownloadFileQuery();

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

  return (
    <CommonWrapper
      isError={isError}
      isLoading={isFetching}
      refetchFunction={refetch}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<PaymentDetailsSkeleton />}
      className='overflow-auto pb-10'
    >
      <div>
        <div className='f-12-450 pt-6 pb-5 px-6 border-b border-GRAY_400'>
          <div className=' mb-1 text-GRAY_700'>
            {format(
              paymentDetails?.date ? createDateObjectFromUTCString(paymentDetails?.date) : new Date(),
              `${DATE_FORMATS.dd_MMM_yyyy} 'at' ${DATE_FORMATS.HMMAAA}`,
            )}
          </div>
          <div className='f-28-450'>
            {paymentDetails?.currency} {getCommaSeparatedNumber(paymentDetails?.amount, 2)}
          </div>
          <div
            className={cn(
              'mt-5 border rounded-md overflow-hidden',
              cardStyleByStatus[paymentDetails?.status as keyof typeof cardStyleByStatus]?.borderColor,
            )}
          >
            <div className='p-3'>
              <span className='text-GRAY_700'>From</span> {paymentDetails?.header?.SourceAccountDetails}
            </div>
            <div
              className={cn(
                'p-3 flex justify-between gap-2 border-t',
                cardStyleByStatus[paymentDetails?.status as keyof typeof cardStyleByStatus]?.borderColor,
                cardStyleByStatus[paymentDetails?.status as keyof typeof cardStyleByStatus]?.backgroundColor,
              )}
            >
              <div>
                <span className='text-GRAY_700'>To</span> {paymentDetails?.header?.Recipient}
              </div>
              <div
                className={cn(
                  'f-11-500',
                  cardStyleByStatus[paymentDetails?.status as keyof typeof cardStyleByStatus]?.textColor,
                )}
              >
                {paymentDetails?.status}
              </div>
            </div>
          </div>
        </div>
        <div>
          {paymentDetails?.sections?.map((section) => (
            <div key={section.title} className='flex flex-col gap-5 border-b border-GRAY_400 py-5 px-6'>
              <div className='f-14-500'>{section.title}</div>
              {section?.values?.map((item) => (
                <div key={item.label} className='grid grid-cols-2 gap-2'>
                  <div className='f-12-400 text-GRAY_700 min-w-44'>{item.label}</div>
                  <div className='f-12-450'>{item.value}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        {!!paymentDetails?.descriptors?.length && (
          <div className='px-6 py-4 flex flex-col gap-6'>
            {paymentDetails?.descriptors?.map((descriptor) => (
              <div key={descriptor.title}>
                <div className='f-12-400 text-GRAY_700 w-44 mb-1.5'>{descriptor.title}</div>
                {descriptor?.description?.map((description) => (
                  <div className='f-12-450' key={description}>
                    {description}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {!!paymentDetails?.attachments?.length && (
          <div className='px-6 py-4'>
            <div className='f-12-400 mb-3'>Attachments</div>
            <div className='flex flex-col gap-2'>
              {paymentDetails?.attachments?.map((attachment) => (
                <div key={attachment?.file_name} className='flex justify-between items-center gap-4'>
                  <div className='flex gap-1.5 items-center f-12-400 min-w-60 bg-GRAY_100 rounded-md px-2 py-1.5'>
                    <SvgSpriteLoader id='file-05' size={14} />
                    <div className='truncate'>{attachment?.file_name}</div>
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
                      id='download-02'
                      size={14}
                      onClick={() => handleDownloadFile(attachment?.file_import_id)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CommonWrapper>
  );
};

export default PaymentDetails;
