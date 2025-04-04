export const ACCOUNT_DETAILS_MOCK = [
  {
    label: 'Recipient Bank',
    value: 'Bank of America',
  },
  {
    label: 'Account Number',
    value: '1234567890',
  },
  {
    label: 'Deal FX Number',
    value: '1234567890',
  },
];

export const RECIPIENT_LIST = [
  {
    label: 'Razi Ansari',
    value: 'Razi Ansari',
  },
  {
    label: 'Annurag arora',
    value: 'Anurag arora',
  },
  {
    label: 'Raghav Saraf',
    value: 'Raghav Saraf',
  },
  {
    label: 'Satabdi S',
    value: 'Satabdi S',
  },
  {
    label: 'Soham P',
    value: 'Soham P',
  },
];

export const accountsList = Array.from({ length: 10 }, () => {
  const randomNumber = Math.floor(Math.random() * 10000);

  return {
    account_id: `account_id_${randomNumber}`,
    account_name: `account_name_${randomNumber}`,
    account_number: `account_number_${randomNumber}`,
    currency_code: `currency_code_${randomNumber}`,
    account_type: `account_type_${randomNumber}`,
    nick_name: `nick_name_${randomNumber}`,
    bank_name: `bank_name_${randomNumber}`,
    bank_identifier: `bank_identifier_${randomNumber}`,
  };
});

export const accountsListWithBalance = Array.from({ length: 10 }, () => {
  const randomNumber = Math.floor(Math.random() * 10000);

  return {
    account_id: `account_id_${randomNumber}`,
    account_name: `account_name_${randomNumber}`,
    account_number: `account_number_${randomNumber}`,
    currency_code: `currency_code_${randomNumber}`,
    account_type: `account_type_${randomNumber}`,
    nick_name: `nick_name_${randomNumber}`,
    bank_name: `bank_name_${randomNumber}`,
    bank_identifier: `bank_identifier_${randomNumber}`,
    balance: randomNumber,
    account_balance: randomNumber,
  };
});

export const PAYMENT_PROCESSING_MODES = [
  {
    label: 'WIRE',
    value: 'wire',
  },
  {
    label: 'SEPA',
    value: 'sepa',
  },
  {
    label: 'SWIFT',
    value: 'swift',
  },
];
