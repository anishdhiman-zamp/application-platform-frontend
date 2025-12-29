import KnowledgeBaseV2PageHome from '@/modules/process/knowledge-base-creation/KnowledgeBaseV2PageHome';

interface KnowledgeBaseV2PageProps {
  params: Promise<{ processId: string }>;
  searchParams: Promise<{ chatbot_conversation_id?: string }>;
}

const KnowledgeBaseV2Page = async ({ params, searchParams }: KnowledgeBaseV2PageProps) => {
  const { processId } = await params;
  const { chatbot_conversation_id } = await searchParams;

  return <KnowledgeBaseV2PageHome processId={processId} conversationId={chatbot_conversation_id ?? null} />;
};

export default KnowledgeBaseV2Page;
