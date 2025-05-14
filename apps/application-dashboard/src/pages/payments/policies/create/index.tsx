import React, { ReactElement } from 'react';
import PaymentsLayout from '@/components/layouts/payments-layout';

const CreatePolicyPage = () => {
  return null;
};

CreatePolicyPage.getLayout = function getLayout(page: ReactElement) {
  return <PaymentsLayout>{page}</PaymentsLayout>;
};

export default CreatePolicyPage;
