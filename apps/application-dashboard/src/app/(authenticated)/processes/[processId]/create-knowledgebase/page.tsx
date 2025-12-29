import CreateKnowledgebasePageHome from '@/modules/process/knowledge-base-creation/CreateKnowledgebasePageHome';

interface CreateKnowledgebasePageProps {
  params: Promise<{ processId: string }>;
  searchParams?: Promise<{ conversationId?: string }>;
}

const CreateKnowledgebasePage = async ({ params, searchParams }: CreateKnowledgebasePageProps) => {
  const { processId } = await params;
  const resolvedSearchParams = await searchParams;
  const conversationId = resolvedSearchParams?.conversationId;

  return <CreateKnowledgebasePageHome processId={processId} conversationId={conversationId} />;
};

export default CreateKnowledgebasePage;
