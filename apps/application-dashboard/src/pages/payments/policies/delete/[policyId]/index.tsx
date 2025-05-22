import React, { ReactElement } from 'react';
import PaymentsLayout from '@/components/layouts/payments-layout';

const DeletePolicy = () => {
  return null;
};

DeletePolicy.getLayout = function getLayout(page: ReactElement) {
  return <PaymentsLayout>{page}</PaymentsLayout>;
};

export default DeletePolicy;
