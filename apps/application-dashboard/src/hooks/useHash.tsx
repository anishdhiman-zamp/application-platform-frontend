import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export const useHash = () => {
  const searchParams = useSearchParams();
  const [hash, setHash] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash;
    }

    return '';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHash(window.location.hash);
    }
  }, [searchParams]);

  return hash;
};
