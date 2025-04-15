import React, { createContext, Dispatch, FC, ReactElement, useContext, useReducer } from 'react';
import { defaultAccountData, defaultContactDetails } from 'modules/payments/payments.constant';
import { AccountDetailsType, ContactType, TemplateDetailsType } from 'modules/payments/payments.types';
import { UploadFileResponseType } from 'types/api/fileUpload.types';
import { MenuItem } from 'types/common/components';
import { MapAny, OptionsType } from 'types/commonTypes';

enum moveMoneyContextActions {
  CURRENT_STEP = 'CURRENT_STEP',
  DESTINATION_ACCOUNT_DETAILS = 'DESTINATION_ACCOUNT_DETAILS',
  SET_ATTACHMENTS = 'SET_ATTACHMENTS',
  MORE_DETAILS = 'MORE_DETAILS',
  TRANSACTION_DETAILS = 'TRANSACTION_DETAILS',
  AMOUNT_DETAILS = 'AMOUNT_DETAILS',
  CONTACT_DETAILS = 'CONTACT_DETAILS',
  POOLED_FUND_DETAILS = 'POOLED_FUND_DETAILS',
  COUNTER_PARTIES = 'COUNTER_PARTIES',
  RESET_STATE = 'RESET_STATE',
  TEMPLATE_DETAILS = 'TEMPLATE_DETAILS',
  SOURCE_ACCOUNT_DETAILS = 'SOURCE_ACCOUNT_DETAILS',
}
interface InitialStateType {
  currentStep: number;
  destinationAccountDetails?: AccountDetailsType;
  sourceAccountDetails?: AccountDetailsType;
  templateDetails: TemplateDetailsType | undefined;
  moreDetails?: {
    note: string;
    externalMemo: string;
    attachments: UploadFileResponseType[];
  };
  transactionDetails: MapAny;
  amountDetails: {
    amount: string;
    currency: MenuItem | null;
    sourceAccountDetails?: AccountDetailsType;
    processingMode?: string;
  };
  contactDetails: MenuItem;
  selectedPooledFund: OptionsType;
  counterParties: ContactType[];
}

export interface ActionType {
  type: keyof typeof moveMoneyContextActions;
  payload?: MapAny;
}

const initialState: InitialStateType = {
  currentStep: 0,
  destinationAccountDetails: undefined,
  templateDetails: undefined,
  moreDetails: {
    note: '',
    externalMemo: '',
    attachments: [],
  },
  transactionDetails: {
    payment_send_text: 'You’ve sent money to Raghav Saraf',
    estimated_time: '24hrs',
  },
  amountDetails: {
    amount: '',
    currency: null,
    sourceAccountDetails: undefined,
    processingMode: '',
  },
  contactDetails: defaultContactDetails,
  selectedPooledFund: defaultContactDetails,
  counterParties: [],
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
        return { ...state, sourceAccountDetails: action?.payload?.sourceAccountDetails };
      case moveMoneyContextActions.MORE_DETAILS:
        return { ...state, moreDetails: action?.payload?.moreDetails };
      case moveMoneyContextActions.CONTACT_DETAILS:
        return {
          ...state,
          contactDetails: action?.payload?.contactDetails,
          templateDetails: undefined,
          destinationAccountDetails: defaultAccountData,
        };
      case moveMoneyContextActions.RESET_STATE:
        return initialState;
      case moveMoneyContextActions.AMOUNT_DETAILS:
        return { ...state, amountDetails: action?.payload?.amountDetails };
      case moveMoneyContextActions.TEMPLATE_DETAILS:
        return {
          ...state,
          templateDetails: action?.payload?.templateDetails,
          destinationAccountDetails: action?.payload?.templateDetails?.details[0]?.beneficiary_account,
        };

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
