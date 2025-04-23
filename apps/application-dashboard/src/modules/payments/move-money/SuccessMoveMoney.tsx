import { FC, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ROUTES_PATH } from 'constants/routeConfig';
import { moveMoneyContextActions, useMoveMoneyContextStore } from 'modules/payments/move-money/moveMoney.context';
import { FAILED_TO_CREATE_TEMPLATE } from 'modules/payments/payments.constant';
import { MOVE_MONEY_TYPE } from 'modules/payments/payments.types';
import { useRouter } from 'next/router';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFnType } from 'types/commonTypes';
import { BUTTON_TYPES } from 'types/components/button.type';
import { useCreateTemplateMutation } from '@/apis/payments';
import { Button } from 'components/common/button/Button';
import Input from 'components/common/input';
import SvgSpriteLoader from 'components/SvgSpriteLoader';
interface SuccessSingleTransferStepProps {
  onReset: defaultFnType;
  transferType: MOVE_MONEY_TYPE;
}

const SuccessMoveMoney: FC<SuccessSingleTransferStepProps> = ({ onReset, transferType }) => {
  const router = useRouter();
  const {
    state: { currentStep, transactionDetails, destinationAccountDetails, sourceAccountDetails, recipientDetails },
    dispatch,
  } = useMoveMoneyContextStore();
  const [templateName, setTemplateName] = useState('');
  const [isTemplateCreated, setIsTemplateCreated] = useState(false);

  const [createTemplate, { isLoading: isCreateTemplateLoading }] = useCreateTemplateMutation();

  const isActiveStep = useMemo(() => currentStep === 4, [currentStep]);

  const handleSubmit = () => {
    createTemplate({
      template_name: templateName,
      details: [
        {
          order: '1',
          source_account_id: sourceAccountDetails?.id ?? '',
          destination_account_id: destinationAccountDetails?.id ?? '',
        },
      ],
      description: 'NA',
      type: transferType,
    })
      .unwrap()
      .then(() => {
        setIsTemplateCreated(true);
      })
      .catch(() => {
        toast.error(FAILED_TO_CREATE_TEMPLATE);
        setIsTemplateCreated(false);
      });
  };

  const handleReset = () => {
    dispatch({
      type: moveMoneyContextActions.RESET,
    });
    onReset();
  };

  return (
    <div className='max-w-[410px] m-auto pt-12 h-screen overflow-y-scroll'>
      <div className='text-GREEN_1 mb-4'>
        <SvgSpriteLoader size={66} id='check-circle' color='#5AB570' />
      </div>
      <div className='f-32-500 mb-6'>
        {recipientDetails?.name ??
          `${destinationAccountDetails?.account_name} ${destinationAccountDetails?.masked_account_number}`}
      </div>
      <div className='flex flex-col gap-4 mb-4'>
        {!!transactionDetails?.estimated_time && (
          <div className='grid grid-cols-2'>
            <div className='text-GRAY_700 f-12-400'>Estimated time of arrival</div>
            <div className='f-12-450'>{transactionDetails?.estimated_time}</div>
          </div>
        )}
      </div>
      {isTemplateCreated ? (
        <div className='flex gap-1.5 p-5 f-14-400 border border-GRAY_400 bg-BG_GRAY_2 rounded-md'>
          <SvgSpriteLoader size={16} id='check-circle' className='text-GREEN_800' />
          <div className='f-14-400 text-GRAY_950'>Your template have been submitted for approval</div>
        </div>
      ) : (
        <div className='rounded-md border border-GRAY_400 bg-BG_GRAY_2 p-5 flex flex-col gap-4'>
          <div className='f-16-550'>Save this as payment template</div>
          <Input
            placeholder='Name'
            size={SIZE_TYPES.MEDIUM}
            label='Template name'
            onChange={(e) => setTemplateName(e.target.value)}
            value={templateName}
          />
          <div className='flex justify-end f-13-500'>
            <Button
              onClick={handleSubmit}
              type={BUTTON_TYPES.TEXT_NAV}
              size={SIZE_TYPES.MEDIUM}
              id='SAVE_TEMPLATE'
              className='!text-GRAY_1000 disabled:!text-GRAY_700'
              disabled={!templateName}
              isLoading={isCreateTemplateLoading}
            >
              Save
            </Button>
          </div>
        </div>
      )}
      <div className='flex gap-3 mt-10'>
        <Button
          type={BUTTON_TYPES.SECONDARY}
          size={SIZE_TYPES.MEDIUM}
          id='VIEW_ALL_PAYMENTS'
          className='px-6'
          onClick={() => router.push(ROUTES_PATH.PAYMENTS)}
          tabIndex={isActiveStep ? 0 : -1}
        >
          View all payments
        </Button>
        <Button
          onClick={handleReset}
          size={SIZE_TYPES.MEDIUM}
          id='MAKE_ANOTHER_PAYMENT'
          className='px-6'
          tabIndex={isActiveStep ? 0 : -1}
        >
          Make another payment
        </Button>
      </div>
    </div>
  );
};

export default SuccessMoveMoney;
