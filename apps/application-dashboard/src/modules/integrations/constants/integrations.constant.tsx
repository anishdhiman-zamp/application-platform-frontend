import { Link2, RefreshCcw, RotateCcw, Unlink } from 'lucide-react';
import ArchiveIcon from '@/assets/Icons/ArchiveIcon';
import {
  ACCOUNT_STATUS,
  type AccountStatus,
  CONNECTION_PILLS_TYPE,
  type ConnectionPillsDetailsMap,
  type PillConfig,
  PILLS_ACTIONS,
  type StatusConfig,
} from '@/modules/integrations/types/integrations.types';

export const CONNECTION_PILLS_DETAILS: ConnectionPillsDetailsMap = {
  synced: {
    title: '5 connections in sync',
    action: PILLS_ACTIONS.CONNECT,
    accounts: [
      {
        id: '1',
        email: 'test@test.com',
      },
      {
        id: '2',
        email: 'test2@test.com',
      },
      {
        id: '3',
        email: 'test3@test.com',
      },
      {
        id: '4',
        email: 'test4@test.com',
      },
      {
        id: '5',
        email: 'test5@test.com',
      },
    ],
  },
  reauth: {
    title: '2 connections needs Re-authentication',
    action: PILLS_ACTIONS.RE_AUTH,
    accounts: [
      {
        id: '1',
        email: 'test@test.com',
      },
      {
        id: '2',
        email: 'test2@test.com',
      },
    ],
  },
  disconnected: {
    title: '2 connections are Disconnected',
    action: PILLS_ACTIONS.DISCONNECT,
    accounts: [
      {
        id: '1',
        email: 'test@test.com',
      },
    ],
  },
};

export const PROCESS_NAMES = ['Account payable', 'Account recievable', 'Chargeback'];

export const PILL_STYLE_MAP = {
  [CONNECTION_PILLS_TYPE.SYNCED]: 'f-12-500 hover:bg-GRAY_100 h-5 gap-x-0.5 px-1 py-[2px]',
  [CONNECTION_PILLS_TYPE.REAUTH]:
    'f-12-500 text-ORANGE_800 hover:bg-GRAY_100 hover:text-ORANGE_800 h-5 gap-x-0.5 px-1 py-[2px]',
  [CONNECTION_PILLS_TYPE.DISCONNECTED]:
    'f-12-500 text-RED_800 hover:bg-GRAY_100 hover:text-RED_800 h-5 gap-x-0.5 px-1 py-[2px]',
};

export const PILLS_CONFIG: PillConfig[] = [
  {
    type: CONNECTION_PILLS_TYPE.SYNCED,
    icon: <Link2 width={14} height={14} className='-rotate-45 p-[2px]' />,
    tooltipWidth: 'w-30',
  },
  {
    type: CONNECTION_PILLS_TYPE.REAUTH,
    icon: <RefreshCcw width={14} height={14} className='text-ORANGE_800 p-[2px]' />,
    tooltipWidth: 'w-32',
  },
  {
    type: CONNECTION_PILLS_TYPE.DISCONNECTED,
    icon: <Unlink width={14} height={14} className='text-RED_800 p-[2px]' />,
    tooltipWidth: 'w-30',
  },
];

export const STATUS_CONFIG: Record<AccountStatus, StatusConfig> = {
  [ACCOUNT_STATUS.CONNECTED]: {
    labelClassName: 'text-GRAY_700',
    icon: null,
    actionLabel: 'Archive',
    actionIcon: <ArchiveIcon height={14} width={14} />,
  },
  [ACCOUNT_STATUS.ARCHIVED]: {
    labelClassName: 'text-GRAY_700',
    icon: <ArchiveIcon height={14} width={14} />,
    actionLabel: 'Restore',
    actionIcon: <RotateCcw height={14} width={14} />,
  },
  [ACCOUNT_STATUS.NEEDS_REAUTH]: {
    labelClassName: 'text-ORANGE_800',
    icon: <RefreshCcw height={14} width={14} />,
    actionLabel: 'Re-Auth',
    actionIcon: null,
  },
  [ACCOUNT_STATUS.DISCONNECTED]: {
    labelClassName: 'text-RED_800',
    icon: <Unlink height={14} width={14} />,
    actionLabel: 'Reconnect',
    actionIcon: null,
  },
};
