'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Payments = () => {
  const router = useRouter();

  useEffect(() => {
    // Prefetch policies routes
    router.prefetch('/payments/policies/create');
  }, []);

  return null;
};

export default Payments;
