'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, ConfirmationDialog } from '@zamp-platform/ui';
import { Play, Share2, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { CONNECTION_TAB } from '@/modules/integrations/constants/integrations.constant';
import ConnectionPeopleList from '@/modules/integrations/IntegrationDetail/ConnectionPeopleList';
import ConnectionSharingTab from '@/modules/integrations/IntegrationDetail/ConnectionSharingTab';
import ShareConnectionDialog from '@/modules/integrations/IntegrationDetail/ShareConnectionDialog';
import {
  CONNECTION_ROLE,
  type ConnectionPeopleSectionPropsType,
  type ConnectionTabType,
} from '@/modules/integrations/types/integrations.types';
import { getNameInitial } from '@/utils/common';

const ConnectionPeopleSection = ({
  connection,
  integrationName,
  integrationLogo,
  isExpanded,
  onToggle,
  onToolPermissionChange,
  onAccessLevelChange,
  onRoleChange,
  onRemoveAudience,
  onDelete,
  onShared,
  isDeleting = false,
}: ConnectionPeopleSectionPropsType) => {
  // state
  const [logoError, setLogoError] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [removeTarget, setRemoveTarget] = useState<{ userId: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<ConnectionTabType>(CONNECTION_TAB.PEOPLE);

  // derived state
  const { connectionId, connectionName, people, agents, isLoadingAudiences } = connection;
  const activeList = activeTab === CONNECTION_TAB.AGENTS ? agents : people;

  // hooks
  const { userEmail } = useUserIdentity();

  const isCurrentUserAdmin = useMemo(
    () => people.some((p) => p.email === userEmail && p.role === CONNECTION_ROLE.ADMIN),
    [people, userEmail],
  );

  // handlers
  const handleToggleUser = (userId: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);

      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }

      return next;
    });
  };

  const handleOpenShare = () => setIsShareOpen(true);
  const handleCloseShare = () => setIsShareOpen(false);
  const handleSelectAgentsTab = () => setActiveTab(CONNECTION_TAB.AGENTS);
  const handleSelectPeopleTab = () => setActiveTab(CONNECTION_TAB.PEOPLE);
  const handleCancelRemove = (open: boolean) => !open && setRemoveTarget(null);
  const handleOpenDeleteConfirm = () => !isDeleting && setIsDeleteConfirmOpen(true);
  const handleRemoveRequest = (userId: string, name: string) => setRemoveTarget({ userId, name });
  const handleConfirmDelete = () => {
    setIsDeleteConfirmOpen(false);
    onDelete(connectionId);
  };

  const handleConfirmRemove = () => {
    if (!removeTarget) return;
    onRemoveAudience(removeTarget.userId);
    setRemoveTarget(null);
  };

  useEffect(() => {
    if (isLoadingAudiences) return;
    setActiveTab(agents.length > 0 && people.length === 0 ? CONNECTION_TAB.AGENTS : CONNECTION_TAB.PEOPLE);
  }, [isLoadingAudiences]);

  return (
    <div className='bg-BG_GRAY_2 flex flex-col rounded-2xl'>
      {/* Connection header */}
      <div className='flex cursor-pointer items-center gap-2 p-3' onClick={onToggle}>
        <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <Play size={6} className='text-GRAY_700 shrink-0 fill-current' />
        </motion.span>
        {integrationLogo && !logoError ? (
          <img
            src={integrationLogo}
            alt={connectionName}
            className='h-4 w-4 shrink-0 object-contain'
            onError={() => setLogoError(true)}
          />
        ) : (
          <span className='bg-GRAY_200 text-GRAY_700 f-10-550 flex h-4 w-4 shrink-0 items-center justify-center rounded'>
            {getNameInitial(connectionName)}
          </span>
        )}
        <span className='f-13-550 text-GRAY_1000 flex-1'>{connectionName}</span>
        {isCurrentUserAdmin && (
          <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
            <Button
              variant='ghost'
              aria-label='Share connection'
              onClick={handleOpenShare}
              className='text-GRAY_700 hover:text-GRAY_1000 hover:bg-GRAY_100 h-7 w-7 p-0'
            >
              <Share2 className='h-3.5 w-3.5' />
            </Button>
            <Button
              variant='ghost'
              aria-label='Delete connection'
              isLoading={isDeleting}
              onClick={handleOpenDeleteConfirm}
              className='text-GRAY_700 hover:text-RED_700 hover:bg-GRAY_100 h-7 w-7 p-0'
            >
              <Trash2 className='h-3.5 w-3.5' />
            </Button>
          </div>
        )}
      </div>

      {/* Expanded content */}
      <AnimatePresence initial>
        {isExpanded && (
          <motion.div
            key='people-list'
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.25, ease: 'easeOut' },
            }}
            className='overflow-hidden px-2'
          >
            <div className='border-GRAY_300 bg-BG_WHITE mb-2 flex flex-col rounded-xl border py-3'>
              {/* Tabs */}
              <div className='flex items-center gap-1 px-3'>
                <ConnectionSharingTab
                  label='My agents'
                  count={agents?.length ?? 0}
                  isActive={activeTab === CONNECTION_TAB.AGENTS}
                  onClick={handleSelectAgentsTab}
                />
                <ConnectionSharingTab
                  label='People'
                  count={people?.length ?? 0}
                  isActive={activeTab === CONNECTION_TAB.PEOPLE}
                  onClick={handleSelectPeopleTab}
                />
              </div>

              {/* Tab content */}
              <ConnectionPeopleList
                activeTab={activeTab}
                activeList={activeList}
                isLoadingAudiences={!!isLoadingAudiences}
                expandedUsers={expandedUsers}
                canManage={isCurrentUserAdmin}
                currentUserEmail={userEmail}
                onToggleUser={handleToggleUser}
                onToolPermissionChange={onToolPermissionChange}
                onAccessLevelChange={onAccessLevelChange}
                onRoleChange={onRoleChange}
                onRemoveRequest={handleRemoveRequest}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isShareOpen && (
        <ShareConnectionDialog
          open={isShareOpen}
          connectionId={connectionId}
          connectionName={connectionName}
          integrationName={integrationName}
          integrationLogo={integrationLogo}
          onClose={handleCloseShare}
          onShared={onShared}
        />
      )}

      {removeTarget && (
        <ConfirmationDialog
          open={!!removeTarget}
          onOpenChange={handleCancelRemove}
          title={`Remove ${removeTarget.name}?`}
          description={`${removeTarget.name} will lose access to this connection. This can be restored by sharing the connection again.`}
          confirmLabel='Remove'
          onConfirm={handleConfirmRemove}
        />
      )}

      {isDeleteConfirmOpen && (
        <ConfirmationDialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
          title={`Delete ${connectionName}?`}
          description='This will permanently delete the connection and revoke access for all agents and people sharing it. This action cannot be undone.'
          confirmLabel='Delete'
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default ConnectionPeopleSection;
