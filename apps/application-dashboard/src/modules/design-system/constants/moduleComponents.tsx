'use client';

import type { ComponentEntryType } from 'modules/design-system/types/design-system.types';
import AppRowSkeleton from '@/modules/apps/components/AppRowSkeleton';
import CredentialDialogSkeleton from '@/modules/credentials-vault/skeletons/CredentialDialogSkeleton';
import CredentialsListSkeleton from '@/modules/credentials-vault/skeletons/CredentialsListSkeleton';
import SkeletonLoaderFileHistory from '@/modules/data/components/SkeletonLoaderFileHistory';
import AudienceBubblesSkeleton from '@/modules/integrations/AllIntegrations/AudienceBubblesSkeleton';
import IntegrationCardSkeletonV2 from '@/modules/integrations/AllIntegrations/IntegrationCardSkeletonV2';
import AgentCardSkeleton from '@/modules/pace/components/agents/skeletons/AgentCardSkeleton';
import AgentListingHeaderSkeleton from '@/modules/pace/components/agents/skeletons/AgentListingHeaderSkeleton';
import FolderListSkeleton from '@/modules/pace/components/agents/skeletons/FolderListSkeleton';
import ToolsAccessSkeleton from '@/modules/pace/components/agents/skeletons/ToolsAccessSkeleton';
import TriggerDropdownSkeleton from '@/modules/pace/components/agents/skeletons/TriggerDropdownSkeleton';
import TriggerListSkeleton from '@/modules/pace/components/agents/skeletons/TriggerListSkeleton';
import ChatHistorySkeleton from '@/modules/pace/components/loaders/ChatHistorySkeleton';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import SkillCardSkeleton from '@/modules/pace/components/loaders/SkillCardSkeleton';
import TaskContentSkeleton from '@/modules/pace/components/loaders/TaskContentSkeleton';
import TaskListingSkeleton from '@/modules/pace/components/tasks/loaders/TaskListingSkeleton';
import TaskRowSkeleton from '@/modules/pace/components/tasks/loaders/TaskRowSkeleton';
import LogsSkeleton from '@/modules/process/activity-logs/loader/LogsSkeleton';
import ArtifactsSkeleton from '@/modules/process/activity-summary/loaders/ArtifactsSkeleton';
import KnowledgeBaseContentSkeleton from '@/modules/process/knowledge-base-creation/components/KnowledgeBaseContentSkeleton';
import MarkdownSkeleton from '@/modules/process/knowledge-base-creation/components/MarkdownSkeleton';
import SkeletonLoaderListing from '@/modules/team/components/SkeletonLoaderListing';

export const MODULE_COMPONENTS: ComponentEntryType[] = [
  // --- Skeletons (renderable) ---
  {
    id: 'mod-credential-dialog-skeleton',
    name: 'CredentialDialogSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/credentials-vault/skeletons/CredentialDialogSkeleton.tsx',
    description: 'Skeleton for the credential edit dialog. Accepts rowCount + showDeleteSection.',
    renderable: true,
    preview: (
      <div className='w-full max-w-md'>
        <CredentialDialogSkeleton rowCount={2} />
      </div>
    ),
  },
  {
    id: 'mod-credentials-list-skeleton',
    name: 'CredentialsListSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/credentials-vault/skeletons/CredentialsListSkeleton.tsx',
    description: 'Skeleton for the credentials list view.',
    renderable: true,
    preview: (
      <div className='w-full'>
        <CredentialsListSkeleton cardCount={2} keysPerCard={2} />
      </div>
    ),
  },
  {
    id: 'mod-task-listing-skeleton',
    name: 'TaskListingSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/pace/components/tasks/loaders/TaskListingSkeleton.tsx',
    description: 'Skeleton for the PACE task listing view.',
    renderable: true,
    preview: <TaskListingSkeleton />,
  },
  {
    id: 'mod-task-row-skeleton',
    name: 'TaskRowSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/pace/components/tasks/loaders/TaskRowSkeleton.tsx',
    description: 'Single task row skeleton.',
    renderable: true,
    preview: <TaskRowSkeleton />,
  },
  {
    id: 'mod-trigger-list-skeleton',
    name: 'TriggerListSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/pace/components/agents/skeletons/TriggerListSkeleton.tsx',
    description: 'Trigger list skeleton with configurable rowCount.',
    renderable: true,
    preview: <TriggerListSkeleton rowCount={3} />,
  },
  {
    id: 'mod-trigger-dropdown-skeleton',
    name: 'TriggerDropdownSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/pace/components/agents/skeletons/TriggerDropdownSkeleton.tsx',
    description: 'Trigger dropdown skeleton.',
    renderable: true,
    preview: <TriggerDropdownSkeleton />,
  },
  {
    id: 'mod-agent-listing-header-skeleton',
    name: 'AgentListingHeaderSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/pace/components/agents/skeletons/AgentListingHeaderSkeleton.tsx',
    description: 'Header skeleton for the agent listing page.',
    renderable: true,
    preview: <AgentListingHeaderSkeleton />,
  },
  {
    id: 'mod-tools-access-skeleton',
    name: 'ToolsAccessSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/pace/components/agents/skeletons/ToolsAccessSkeleton.tsx',
    description: 'Tools access list skeleton.',
    renderable: true,
    preview: <ToolsAccessSkeleton />,
  },
  {
    id: 'mod-folder-list-skeleton',
    name: 'FolderListSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/pace/components/agents/skeletons/FolderListSkeleton.tsx',
    description: 'Folder list skeleton for the agent file tree.',
    renderable: true,
    preview: <FolderListSkeleton />,
  },
  {
    id: 'mod-agent-card-skeleton',
    name: 'AgentCardSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/pace/components/agents/skeletons/AgentCardSkeleton.tsx',
    description: 'Skeleton for an agent card tile.',
    renderable: true,
    preview: (
      <div className='w-full max-w-sm'>
        <AgentCardSkeleton />
      </div>
    ),
  },
  {
    id: 'mod-chat-history-skeleton',
    name: 'ChatHistorySkeleton',
    category: 'Module Components',
    filePath: 'src/modules/pace/components/loaders/ChatHistorySkeleton.tsx',
    description: 'PACE chat history list skeleton.',
    renderable: true,
    preview: <ChatHistorySkeleton />,
  },
  {
    id: 'mod-chat-messages-skeleton',
    name: 'ChatMessagesSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/pace/components/loaders/ChatMessagesSkeleton.tsx',
    description: 'PACE chat messages skeleton.',
    renderable: true,
    preview: <ChatMessagesSkeleton />,
  },
  {
    id: 'mod-skill-card-skeleton',
    name: 'SkillCardSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/pace/components/loaders/SkillCardSkeleton.tsx',
    description: 'Skill card listing skeleton (5 rows).',
    renderable: true,
    preview: <SkillCardSkeleton />,
  },
  {
    id: 'mod-task-content-skeleton',
    name: 'TaskContentSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/pace/components/loaders/TaskContentSkeleton.tsx',
    description: 'Task detail content skeleton.',
    renderable: true,
    preview: <TaskContentSkeleton />,
  },
  {
    id: 'mod-integration-card-skeleton',
    name: 'IntegrationCardSkeletonV2',
    category: 'Module Components',
    filePath: 'src/modules/integrations/AllIntegrations/IntegrationCardSkeletonV2.tsx',
    description: 'Integration card placeholder.',
    renderable: true,
    preview: (
      <div className='w-full max-w-xs'>
        <IntegrationCardSkeletonV2 />
      </div>
    ),
  },
  {
    id: 'mod-audience-bubbles-skeleton',
    name: 'AudienceBubblesSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/integrations/AllIntegrations/AudienceBubblesSkeleton.tsx',
    description: 'Audience bubbles loading state.',
    renderable: true,
    preview: <AudienceBubblesSkeleton />,
  },
  {
    id: 'mod-skeleton-loader-listing',
    name: 'SkeletonLoaderListing',
    category: 'Module Components',
    filePath: 'src/modules/team/components/SkeletonLoaderListing.tsx',
    description: 'Generic listing skeleton — configurable columns + length.',
    renderable: true,
    preview: <SkeletonLoaderListing columns={3} length={3} />,
  },
  {
    id: 'mod-skeleton-loader-file-history',
    name: 'SkeletonLoaderFileHistory',
    category: 'Module Components',
    filePath: 'src/modules/data/components/SkeletonLoaderFileHistory.tsx',
    description: 'File-history listing skeleton.',
    renderable: true,
    preview: <SkeletonLoaderFileHistory />,
  },
  {
    id: 'mod-app-row-skeleton',
    name: 'AppRowSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/apps/components/AppRowSkeleton.tsx',
    description: 'Single row skeleton for the apps listing.',
    renderable: true,
    preview: <AppRowSkeleton />,
  },
  {
    id: 'mod-knowledge-base-content-skeleton',
    name: 'KnowledgeBaseContentSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/process/knowledge-base-creation/components/KnowledgeBaseContentSkeleton.tsx',
    description: 'Knowledge base content skeleton.',
    renderable: true,
    preview: <KnowledgeBaseContentSkeleton />,
  },
  {
    id: 'mod-markdown-skeleton',
    name: 'MarkdownSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/process/knowledge-base-creation/components/MarkdownSkeleton.tsx',
    description: 'Markdown content placeholder.',
    renderable: true,
    preview: <MarkdownSkeleton />,
  },
  {
    id: 'mod-artifacts-skeleton',
    name: 'ArtifactsSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/process/activity-summary/loaders/ArtifactsSkeleton.tsx',
    description: 'Process artifacts skeleton.',
    renderable: true,
    preview: <ArtifactsSkeleton />,
  },
  {
    id: 'mod-logs-skeleton',
    name: 'LogsSkeleton',
    category: 'Module Components',
    filePath: 'src/modules/process/activity-logs/loader/LogsSkeleton.tsx',
    description: 'Activity logs skeleton.',
    renderable: true,
    preview: <LogsSkeleton />,
  },

  // --- Notable feature components (file-path-only, context required) ---
  {
    id: 'mod-widgets-wrapper',
    name: 'WidgetsWrapper',
    category: 'Module Components',
    filePath: 'src/modules/widgets/WidgetsWrapper.tsx',
    description: 'Top-level widgets wrapper. Requires widget instance + dataset context.',
    renderable: false,
  },
  {
    id: 'mod-pace-chat',
    name: 'WorkWithPace',
    category: 'Module Components',
    filePath: 'src/modules/chatbot/WorkWithPace.tsx',
    description: 'Topbar PACE chat trigger. Reads process state from Redux + API.',
    renderable: false,
  },
  {
    id: 'mod-share-process-popup',
    name: 'ShareProcessPopup',
    category: 'Module Components',
    filePath: 'src/modules/process/common/ShareProcessPopup.tsx',
    description: 'Share popup for a process. Needs processId + RTK Query data.',
    renderable: false,
  },
  {
    id: 'mod-share-page-popup',
    name: 'SharePagePopup',
    category: 'Module Components',
    filePath: 'src/modules/page/SharePagePopup.tsx',
    description: 'Share popup for a page.',
    renderable: false,
  },
  {
    id: 'mod-share-dataset-popup',
    name: 'ShareDatasetPopup',
    category: 'Module Components',
    filePath: 'src/modules/data/components/ShareDatasetPopup.tsx',
    description: 'Share popup for a dataset.',
    renderable: false,
  },
  {
    id: 'mod-feedback-status-button',
    name: 'FeedbackStatusButton',
    category: 'Module Components',
    filePath: 'src/modules/feedback/feedback-status/FeedbackStatusButton.tsx',
    description: 'Topbar button surfacing feedback status. Driven by feedback slice + RTK Query.',
    renderable: false,
  },
  {
    id: 'mod-draft-feedback-button',
    name: 'DraftFeedbackButton',
    category: 'Module Components',
    filePath: 'src/modules/feedback/components/DraftFeedbackButton.tsx',
    description: 'Topbar button to open the draft feedback flow.',
    renderable: false,
  },
];
