import React, { ReactElement } from 'react';
import PaymentsLayout from '@/components/layouts/payments-layout';

const CreatePolicy = () => {
  return null;
};

CreatePolicy.getLayout = function getLayout(page: ReactElement) {
  return <PaymentsLayout>{page}</PaymentsLayout>;
};

export default CreatePolicy;
