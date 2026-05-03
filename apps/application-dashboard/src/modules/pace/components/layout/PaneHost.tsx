'use client';

import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { usePathname } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import AppsListingPage from '@/modules/apps/AppsListingPage';
import AgentListingPage from '@/modules/pace/components/agents/components/AgentListingPage';
import ChatHistoryPage from '@/modules/pace/components/chat/ChatHistoryPage';
import ChatHomePane from '@/modules/pace/components/chat/ChatHomePane';
import TasksPane from '@/modules/pace/components/tasks/components/TasksPane';

interface PaneDefinitionType {
  key: string;
  matches: (pathname: string) => boolean;
  render: () => ReactNode;
}

const HOSTED_PANES: PaneDefinitionType[] = [
  { key: 'chat-home', matches: (p) => p === ROUTES_PATH.CHAT, render: () => <ChatHomePane /> },
  { key: 'agents', matches: (p) => p === ROUTES_PATH.CHAT_AGENTS, render: () => <AgentListingPage /> },
  { key: 'apps', matches: (p) => p === ROUTES_PATH.CHAT_APPS, render: () => <AppsListingPage /> },
  { key: 'tasks', matches: (p) => p === ROUTES_PATH.CHAT_TASK, render: () => <TasksPane /> },
  { key: 'history', matches: (p) => p === '/chat/history', render: () => <ChatHistoryPage /> },
];

const DEEP_ROUTE_KEY = '__deep__';

interface PaneProps {
  isActive: boolean;
  children: ReactNode;
}

const Pane = ({ isActive, children }: PaneProps) => (
  <div className={cn('flex h-full min-h-0 min-w-0 flex-1 flex-col', !isActive && 'hidden')} aria-hidden={!isActive}>
    {children}
  </div>
);

interface PaneHostProps {
  children: ReactNode;
}

const PaneHost = ({ children }: PaneHostProps) => {
  const pathname = usePathname() ?? '';
  const matchedPane = HOSTED_PANES.find((pane) => pane.matches(pathname));
  const activeKey = matchedPane?.key ?? DEEP_ROUTE_KEY;

  const [mountedKeys, setMountedKeys] = useState<Set<string>>(() => new Set([activeKey]));

  useEffect(() => {
    setMountedKeys((prev) => {
      if (prev.has(activeKey)) return prev;
      const next = new Set(prev);

      next.add(activeKey);

      return next;
    });
  }, [activeKey]);

  return (
    <>
      {HOSTED_PANES.map((pane) =>
        mountedKeys.has(pane.key) ? (
          <Pane key={pane.key} isActive={pane.key === activeKey}>
            {pane.render()}
          </Pane>
        ) : null,
      )}
      <Pane isActive={activeKey === DEEP_ROUTE_KEY}>{children}</Pane>
    </>
  );
};

export default PaneHost;
