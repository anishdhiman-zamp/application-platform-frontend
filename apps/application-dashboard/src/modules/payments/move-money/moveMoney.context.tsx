import React, { createContext, Dispatch, FC, ReactElement, useContext, useReducer } from 'react';
import { AccountDetailsType, ContactType, MOVE_MONEY_TYPE } from 'modules/payments/payments.types';
import { UploadFileResponseType } from 'types/api/fileUpload.types';
import { MenuItem } from 'types/common/components';
import { MapAny } from 'types/commonTypes';
import { RecipientDetailsType, TemplateDetailsType } from '@/types/api/paymentApi.types';

enum moveMoneyContextActions {
  CURRENT_STEP = 'CURRENT_STEP',
  DESTINATION_ACCOUNT_DETAILS = 'DESTINATION_ACCOUNT_DETAILS',
  SET_ATTACHMENTS = 'SET_ATTACHMENTS',
  MORE_DETAILS = 'MORE_DETAILS',
  TRANSACTION_DETAILS = 'TRANSACTION_DETAILS',
  AMOUNT_DETAILS = 'AMOUNT_DETAILS',
  RECIPIENT_DETAILS = 'RECIPIENT_DETAILS',
  POOLED_FUND_DETAILS = 'POOLED_FUND_DETAILS',
  COUNTER_PARTIES = 'COUNTER_PARTIES',
  RESET_STATE = 'RESET_STATE',
  TEMPLATE_DETAILS = 'TEMPLATE_DETAILS',
  SOURCE_ACCOUNT_DETAILS = 'SOURCE_ACCOUNT_DETAILS',
  RESET = 'RESET',
}
interface InitialStateType {
  currentStep: number;
  destinationAccountDetails?: AccountDetailsType;
  sourceAccountDetails?: AccountDetailsType;
  templateDetails?: TemplateDetailsType | undefined;
  moreDetails?: {
    note: string;
    externalMemo: string;
    attachments: UploadFileResponseType[];
  };
  transactionDetails?: MapAny;
  amountDetails?: {
    amount: string;
    currency: MenuItem | null;
    sourceAccountDetails?: AccountDetailsType;
    processingMode?: MenuItem;
  };
  recipientDetails?: RecipientDetailsType | undefined;
  counterParties?: ContactType[];
  reset: boolean;
}

export interface ActionType {
  type: keyof typeof moveMoneyContextActions;
  payload?: MapAny;
}

const initialState: InitialStateType = {
  currentStep: 0,
  reset: false,
};

const context = createContext<{
  state: InitialStateType;
  dispatch: Dispatch<ActionType>;
}>({
  state: initialState,
  dispatch: () => null,
});

const { Provider } = context;

/* eslint-disable react/display-name */
export const StateProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [state, dispatch] = useReducer((state: InitialStateType, action: ActionType): InitialStateType => {
    switch (action.type) {
      case moveMoneyContextActions.CURRENT_STEP:
        return { ...state, currentStep: action?.payload?.currentStep };
      case moveMoneyContextActions.DESTINATION_ACCOUNT_DETAILS:
        return { ...state, destinationAccountDetails: action?.payload?.destinationAccountDetails };
      case moveMoneyContextActions.SOURCE_ACCOUNT_DETAILS:
        return {
          ...state,
          sourceAccountDetails: action?.payload?.sourceAccountDetails,
          templateDetails: undefined,
          destinationAccountDetails: undefined,
          recipientDetails: undefined,
          reset: false,
        };
      case moveMoneyContextActions.MORE_DETAILS:
        return { ...state, moreDetails: action?.payload?.moreDetails };
      case moveMoneyContextActions.RECIPIENT_DETAILS:
        return {
          ...state,
          recipientDetails: action?.payload?.recipientDetails,
          templateDetails: undefined,
          destinationAccountDetails: undefined,
        };
      case moveMoneyContextActions.RESET_STATE:
        return initialState;
      case moveMoneyContextActions.RESET:
        return {
          ...initialState,
          currentStep: 0,
          reset: true,
        };
      case moveMoneyContextActions.AMOUNT_DETAILS:
        return { ...state, amountDetails: action?.payload?.amountDetails };
      case moveMoneyContextActions.TEMPLATE_DETAILS: {
        const templateDetails: TemplateDetailsType = action?.payload?.templateDetails;
        const destinationAccountDetails = templateDetails?.details[0]?.destination_account;
        const sourceAccountDetails = templateDetails?.details[0]?.source_account;
        const recipientDetails: RecipientDetailsType | undefined =
          templateDetails?.type === MOVE_MONEY_TYPE.SINGLE_TRANSFER
            ? {
                name: destinationAccountDetails?.recipient_name ?? '',
                id: destinationAccountDetails?.recipient_id ?? '',
                accounts: [destinationAccountDetails],
              }
            : undefined;

        return {
          ...state,
          templateDetails: templateDetails,
          destinationAccountDetails: destinationAccountDetails,
          sourceAccountDetails: sourceAccountDetails,
          recipientDetails: recipientDetails,
          currentStep: templateDetails?.type === MOVE_MONEY_TYPE.SINGLE_TRANSFER ? 2 : 1,
        };
      }

      default:
        return state;
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}> {children} </Provider>;
};

const withMoveMoneyContext = (WrappedComponent: FC<any>) => {
  return (props: MapAny) => (
    <StateProvider>
      <WrappedComponent {...props} />
    </StateProvider>
  );
};

const useMoveMoneyContextStore = () => useContext(context);

export { moveMoneyContextActions, useMoveMoneyContextStore, withMoveMoneyContext };
