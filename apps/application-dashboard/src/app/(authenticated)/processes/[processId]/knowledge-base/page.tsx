import { getIntegrations } from '@/constants/integrations.constants';
import KnowledgeBaseV2PageHome from '@/modules/process/knowledge-base-creation/KnowledgeBaseV2PageHome';

interface KnowledgeBasePageProps {
  params: Promise<{ processId: string }>;
  searchParams?: Promise<{ chatbot_conversation_id?: string }>;
}

const KnowledgeBasePage = async ({ params, searchParams }: KnowledgeBasePageProps) => {
  const integrations = getIntegrations();

  const { processId } = await params;
  const resolvedSearchParams = await searchParams;
  const conversationId = resolvedSearchParams?.chatbot_conversation_id ?? null;

  return <KnowledgeBaseV2PageHome processId={processId} conversationId={conversationId} integrations={integrations} />;
};

export default KnowledgeBasePage;
