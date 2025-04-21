import { FC, useMemo, useState } from 'react';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useMoveMoneyContextStore } from 'modules/payments/move-money/moveMoney.context';
import { useRouter } from 'next/router';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFnType } from 'types/commonTypes';
import { BUTTON_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import Input from 'components/common/input';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

interface SuccessSingleTransferStepProps {
  onReset: defaultFnType;
}

const SuccessMoveMoney: FC<SuccessSingleTransferStepProps> = ({ onReset }) => {
  const router = useRouter();
  const {
    state: { currentStep, transactionDetails, destinationAccountDetails, recipientDetails },
  } = useMoveMoneyContextStore();
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  const isActiveStep = useMemo(() => currentStep === 4, [currentStep]);

  return (
    <div className='max-w-[400px] m-auto pt-10 h-screen overflow-y-scroll'>
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
      <div className='rounded-md border border-GRAY_400 bg-BG_GRAY_2 p-5 flex flex-col gap-4'>
        <div className='f-16-550'>Save this as payment template</div>
        <Input
          placeholder='Name'
          size={SIZE_TYPES.MEDIUM}
          label='Template name'
          onChange={(e) => setTemplateName(e.target.value)}
          value={templateName}
        />
        <Input
          placeholder='Description'
          size={SIZE_TYPES.MEDIUM}
          label='Template description'
          onChange={(e) => setTemplateDescription(e.target.value)}
          value={templateDescription}
        />
        <div className='flex justify-end f-13-500'>
          <Button
            onClick={onReset}
            type={BUTTON_TYPES.TEXT_NAV}
            size={SIZE_TYPES.MEDIUM}
            id='SAVE_TEMPLATE'
            className='!text-GRAY_1000 disabled:!text-GRAY_700'
            disabled={!templateName || !templateDescription}
          >
            Save
          </Button>
        </div>
      </div>
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
          onClick={onReset}
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
