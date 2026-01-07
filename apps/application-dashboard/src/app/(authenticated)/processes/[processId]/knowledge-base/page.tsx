import KnowledgeBaseV2PageHome from '@/modules/process/knowledge-base-creation/KnowledgeBaseV2PageHome';

interface KnowledgeBasePageProps {
  params: Promise<{ processId: string }>;
  searchParams: Promise<{ chatbot_conversation_id?: string }>;
}

const KnowledgeBasePage = async ({ params, searchParams }: KnowledgeBasePageProps) => {
  const { processId } = await params;
  const { chatbot_conversation_id } = await searchParams;

  return <KnowledgeBaseV2PageHome processId={processId} conversationId={chatbot_conversation_id ?? null} />;
};

export default KnowledgeBasePage;
