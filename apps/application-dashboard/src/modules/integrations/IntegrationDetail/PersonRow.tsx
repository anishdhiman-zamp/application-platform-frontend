'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Skeleton } from '@zamp-platform/ui';
import { ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import ConnectionRoleDropdown from '@/modules/integrations/IntegrationDetail/ConnectionRoleDropdown';
import ToolPermissionRow from '@/modules/integrations/IntegrationDetail/ToolPermissionRow';
import { CONNECTION_ROLE, type PersonRowPropsType } from '@/modules/integrations/types/integrations.types';
import AccessLevelDropdown from '@/modules/pace/components/agents/components/AccessLevelDropdown';
import { ACCESS_LEVEL_OPTIONS } from '@/modules/pace/components/agents/constants/agents.constants';

const PersonRow = ({
  person,
  isUserExpanded,
  canManage,
  isCurrentUser,
  onToggleUser,
  onToolPermissionChange,
  onAccessLevelChange,
  onRoleChange,
  onRemove,
}: PersonRowPropsType) => {
  const canEdit = canManage;
  const canEditRole = canManage && !isCurrentUser;
  const displayName = person.name || person.email;
  const accessLevelOption = ACCESS_LEVEL_OPTIONS.find((opt) => opt.value === person.accessLevel);
  const AccessLevelIcon = accessLevelOption?.icon;
  const rowRef = useRef<HTMLDivElement>(null);
  const prevExpandedRef = useRef(isUserExpanded);

  const scrollRowToTop = useCallback(() => {
    const row = rowRef.current;

    if (!row) return;

    // Scroll the nearest scrollable ancestor so the row shifts to the top
    let scroller: HTMLElement | null = row.parentElement;

    while (scroller) {
      const style = getComputedStyle(scroller);
      const overflowY = style.overflowY;
      const isScrollable =
        (overflowY === 'auto' || overflowY === 'scroll') && scroller.scrollHeight > scroller.clientHeight;

      if (isScrollable) break;
      scroller = scroller.parentElement;
    }

    if (!scroller) return;

    const rowRect = row.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const delta = rowRect.top - scrollerRect.top;

    scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!prevExpandedRef.current && isUserExpanded) {
      // Wait for the expand animation to commit so the row's position is stable.
      const timeoutId = setTimeout(scrollRowToTop, 50);

      prevExpandedRef.current = isUserExpanded;

      return () => clearTimeout(timeoutId);
    }
    prevExpandedRef.current = isUserExpanded;
  }, [isUserExpanded, scrollRowToTop]);

  return (
    <div ref={rowRef} className='flex flex-col'>
      <div className='flex items-center px-2 py-2.5'>
        <span className='f-12-500 text-GRAY_950 flex min-w-0 flex-1 items-center gap-1.5 truncate'>
          {person.isTeam ? (
            <span
              className='rounded px-1.5 py-0.5 capitalize'
              style={{ backgroundColor: person.teamColor ?? 'transparent' }}
            >
              {displayName}
            </span>
          ) : (
            displayName
          )}
          {isCurrentUser && <span className='text-GRAY_700'> (You)</span>}
        </span>
        {canEditRole ? (
          <ConnectionRoleDropdown
            value={person.role ?? CONNECTION_ROLE.VIEWER}
            onChange={(role) => onRoleChange(person.userId, role)}
            onRemove={() => onRemove(person.userId, person.name || person.email)}
          />
        ) : (
          <span className='f-12-500 text-GRAY_700 flex h-6.5 items-center px-2.5'>
            {(person.role ?? CONNECTION_ROLE.VIEWER) === CONNECTION_ROLE.ADMIN ? 'Admin' : 'Viewer'}
          </span>
        )}
      </div>

      {person.tools.length > 0 && (
        <div className='flex flex-col px-2 pb-2'>
          <div className='flex items-center'>
            <div
              role='button'
              className='flex flex-1 cursor-pointer items-center gap-1.5 py-1 outline-none focus-visible:outline-none'
              onClick={() => onToggleUser(person.userId)}
            >
              <motion.span animate={{ rotate: isUserExpanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
                <ChevronRight size={12} className='text-GRAY_700 shrink-0' />
              </motion.span>
              <span className='f-12-400 text-GRAY_700'>Tool permissions {person.tools.length}</span>
            </div>
            <CommonWrapper
              isLoading={!!person.isLoadingPolicies}
              skeletonType={SkeletonTypes.CUSTOM}
              loader={<Skeleton className='h-8 w-[120px] rounded-md' />}
              disableAnimation
            >
              {canEdit ? (
                <AccessLevelDropdown
                  value={person.accessLevel}
                  onChange={(level) => onAccessLevelChange(person.userId, level)}
                />
              ) : (
                AccessLevelIcon && (
                  <span
                    className='text-GRAY_700 flex h-6 w-6 items-center justify-center'
                    aria-label={accessLevelOption?.label}
                  >
                    <AccessLevelIcon size={12} />
                  </span>
                )
              )}
            </CommonWrapper>
          </div>

          <AnimatePresence initial={false}>
            {isUserExpanded && (
              <motion.div
                key='tools-list'
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.2, ease: 'easeOut' },
                }}
                className='overflow-hidden'
              >
                <motion.div
                  className='mt-1 mb-2 ml-1.5 flex flex-col border-l py-1'
                  initial='collapsed'
                  animate='expanded'
                  exit='collapsed'
                  variants={{
                    expanded: { transition: { staggerChildren: 0.025, delayChildren: 0.05 } },
                    collapsed: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
                  }}
                >
                  {person.tools.map((tool, idx) => (
                    <ToolPermissionRow
                      key={tool.id}
                      tool={tool}
                      isLast={idx === person.tools.length - 1}
                      isLoadingPolicies={person.isLoadingPolicies ?? false}
                      canEdit={canEdit}
                      onPermissionChange={(perm) => onToolPermissionChange(person.userId, tool.id, perm)}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default PersonRow;
