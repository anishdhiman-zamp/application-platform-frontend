import { useEffect, useState } from 'react';
import { getApiDomainByRegion } from '@zamp-platform/api';
import { useAppSelector } from 'hooks/toolkit';
import { RootState } from 'store';
import { Organization } from 'types/api/auth.types';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';

const useGetAllOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[] | null>(null);
  const { user } = useAppSelector((state: RootState) => state.user);

  const fetchOrganizations = async () => {
    const domains = await getApiDomainByRegion(user?.user_email, false);
    const organizations = await Promise.allSettled(
      domains.map(async (result) => {
        const response = await fetch(`${result.domain}/${API_ENDPOINTS.ORGANIZATIONS_GET}`, {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        });
        const data = await response.json();
        const organizationsWithRegion = Array.isArray(data)
          ? data.map((org) => ({ ...org, region: result.region }))
          : [];

        return { status: response.status, data: organizationsWithRegion };
      }),
    );

    const successfulRegion = organizations.filter(
      (result): result is PromiseFulfilledResult<{ status: number; data: Organization[] }> =>
        result.status === 'fulfilled' && result.value.status === 200,
    );

    setOrganizations(successfulRegion.flatMap((result) => result.value.data));
  };

  useEffect(() => {
    fetchOrganizations();
  }, [user?.user_email]);

  return organizations;
};

export default useGetAllOrganizations;
