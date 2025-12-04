import { Link2, RefreshCcw, Unlink } from 'lucide-react';
import {
  CONNECTION_PILLS_TYPE,
  type ConnectionPillsDetailsMap,
  PILLS_ACTIONS,
} from 'modules/integrations/integrations.types';

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

export const PILLS_ACTIONS_ICON_MAP = {
  [PILLS_ACTIONS.CONNECT]: <Link2 width={14} height={14} className='-rotate-45' />,
  [PILLS_ACTIONS.RE_AUTH]: <RefreshCcw width={14} height={14} className='text-ORANGE_800' />,
  [PILLS_ACTIONS.DISCONNECT]: <Unlink width={14} height={14} className='text-RED_800' />,
};

export const PILL_STYLE_MAP = {
  [CONNECTION_PILLS_TYPE.SYNCED]: 'f-12-500 hover:bg-GRAY_100 h-5 gap-x-0.5 px-1 py-[2px]',
  [CONNECTION_PILLS_TYPE.REAUTH]:
    'f-12-500 text-ORANGE_800 hover:bg-GRAY_100 hover:text-ORANGE_800 h-5 gap-x-0.5 px-1 py-[2px]',
  [CONNECTION_PILLS_TYPE.DISCONNECTED]:
    'f-12-500 text-RED_800 hover:bg-GRAY_100 hover:text-RED_800 h-5 gap-x-0.5 px-1 py-[2px]',
};
