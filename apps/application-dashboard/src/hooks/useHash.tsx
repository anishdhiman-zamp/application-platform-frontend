import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export const useHash = () => {
  const searchParams = useSearchParams();
  const [hash, setHash] = useState<string>(() => window.location.hash);

  useEffect(() => {
    setHash(window.location.hash);
  }, [searchParams]);

  return hash;
};
