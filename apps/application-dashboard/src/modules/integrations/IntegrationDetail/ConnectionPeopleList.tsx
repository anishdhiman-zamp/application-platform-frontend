'use client';

import { ScrollContainer, Skeleton } from '@zamp-platform/ui';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { CONNECTION_TAB } from '@/modules/integrations/constants/integrations.constant';
import PersonRow from '@/modules/integrations/IntegrationDetail/PersonRow';
import type {
  ConnectionRoleType,
  ConnectionTabType,
  PersonEntryType,
} from '@/modules/integrations/types/integrations.types';
import type { AccessLevelType, ToolPermissionType } from '@/modules/pace/components/agents/types/agents.types';

interface ConnectionPeopleListProps {
  activeTab: ConnectionTabType;
  activeList: PersonEntryType[];
  isLoadingAudiences: boolean;
  expandedUsers: Set<string>;
  canManage: boolean;
  currentUserEmail: string | null | undefined;
  onToggleUser: (userId: string) => void;
  onToolPermissionChange: (userId: string, toolId: string, permission: ToolPermissionType) => void;
  onAccessLevelChange: (userId: string, accessLevel: AccessLevelType) => void;
  onRoleChange: (userId: string, role: ConnectionRoleType) => void;
  onRemoveRequest: (userId: string, name: string) => void;
}

const ListSkeleton = () => (
  <div className='mt-3 flex flex-col gap-2 px-3'>
    {Array.from({ length: 2 }).map((_, i) => (
      <Skeleton key={i} className='h-8 w-full rounded-md' />
    ))}
  </div>
);

const ConnectionPeopleList = ({
  activeTab,
  activeList,
  isLoadingAudiences,
  expandedUsers,
  canManage,
  currentUserEmail,
  onToggleUser,
  onToolPermissionChange,
  onAccessLevelChange,
  onRoleChange,
  onRemoveRequest,
}: ConnectionPeopleListProps) => {
  const emptyMessage =
    activeTab === CONNECTION_TAB.AGENTS
      ? 'No agents have access to this connection'
      : 'No people have access to this connection';

  return (
    <CommonWrapper
      isLoading={isLoadingAudiences}
      isNoData={!isLoadingAudiences && activeList.length === 0}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<ListSkeleton />}
      noDataBanner={
        <div className='flex items-center justify-center px-3 py-8'>
          <span className='f-12-400 text-GRAY_600'>{emptyMessage}</span>
        </div>
      }
      disableAnimation
    >
      <ScrollContainer className='bg-BG_WHITE mt-3 flex max-h-[300px] flex-col overflow-y-auto'>
        {activeList.map((person, idx) => (
          <div key={person.userId} className='px-3'>
            <PersonRow
              person={person}
              isUserExpanded={expandedUsers.has(person.userId)}
              canManage={canManage}
              isCurrentUser={!!currentUserEmail && person.email === currentUserEmail}
              onToggleUser={onToggleUser}
              onToolPermissionChange={onToolPermissionChange}
              onAccessLevelChange={onAccessLevelChange}
              onRoleChange={onRoleChange}
              onRemove={onRemoveRequest}
              isLast={idx === activeList.length - 1}
            />
          </div>
        ))}
      </ScrollContainer>
    </CommonWrapper>
  );
};

export default ConnectionPeopleList;
