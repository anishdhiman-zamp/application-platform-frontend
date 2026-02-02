import { fetchIntegrations } from '@/modules/integrations/utils/integrations.utils';
import CreateKnowledgebasePageHome from '@/modules/process/knowledge-base-creation/CreateKnowledgebasePageHome';

interface CreateKnowledgebasePageProps {
  params: Promise<{ processId: string }>;
  searchParams?: Promise<{ conversationId?: string; source?: string }>;
}

const CreateKnowledgebasePage = async ({ params, searchParams }: CreateKnowledgebasePageProps) => {
  const integrations = await fetchIntegrations();
  const { processId } = await params;
  const resolvedSearchParams = await searchParams;
  const conversationId = resolvedSearchParams?.conversationId;
  const source = resolvedSearchParams?.source;

  return (
    <CreateKnowledgebasePageHome
      processId={processId}
      conversationId={conversationId}
      integrations={integrations}
      source={source}
    />
  );
};

export default CreateKnowledgebasePage;
