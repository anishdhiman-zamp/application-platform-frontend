'use client';

import { notFound, useParams } from 'next/navigation';
import { useGetIntegrationsCatalogQuery } from '@/apis/integrations';
import IntegrationDetailPage from '@/modules/integrations/IntegrationDetail/IntegrationDetailPage';
import IntegrationPageLoadingState from '@/modules/integrations/IntegrationDetail/IntegrationPageLoadingState';
import { IntegrationType } from '@/modules/integrations/types/integrations.types';

const Page = () => {
  const params = useParams<{ integrationId: string }>();
  const integrationName = params?.integrationId;

  const { data: catalogData, isLoading: isCatalogLoading } = useGetIntegrationsCatalogQuery({
    search: integrationName,
    page: 1,
    page_size: 100,
  });

  if (isCatalogLoading) {
    return <IntegrationPageLoadingState />;
  }

  const integrationItem = catalogData?.items?.find((item) => item.name === integrationName);

  if (!integrationItem) notFound();

  return (
    <IntegrationDetailPage
      integration={
        {
          name: integrationItem?.name,
          id: integrationItem?.name,
          display_name: integrationItem?.title,
          logo: integrationItem?.icon,
          description: integrationItem?.description,
          what_possible: [],
          guide: '',
          connectionMetadata: integrationItem,
        } as IntegrationType
      }
    />
  );
};

export default Page;
