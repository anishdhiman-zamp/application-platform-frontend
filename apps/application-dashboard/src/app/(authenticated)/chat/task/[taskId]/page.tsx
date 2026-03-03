import TaskContentInner from '@/modules/pace/components/chat/TaskContentInner';

interface ChatTaskPageProps {
  params: Promise<{ taskId: string }>;
}

const ChatTaskPage = async ({ params }: ChatTaskPageProps) => {
  const { taskId } = await params;

  return <TaskContentInner taskId={taskId} />;
};

export default ChatTaskPage;
