import { ROUTES_PATH } from '@/constants/routeConfig';
import {
  AGENTS_LISTING_CONVERSATION_ID,
  FILES_LISTING_CONVERSATION_ID,
  NEW_CONVERSATION_ID,
  SIDEBAR_CONVERSATION_ID_PARAM,
  TASKS_LISTING_CONVERSATION_ID,
} from '@/modules/pace/pace.constants';
import { TAB_QUERY_PARAM } from '@/modules/pace/pace.types';
import { getRouteConversationId } from '@/modules/pace/pace.utils';

describe('pace route conversation helpers', () => {
  it('uses the pending new-chat bucket for chat tab URLs without a sidebar conversation', () => {
    const params = new URLSearchParams([[TAB_QUERY_PARAM.AGENT, 'agent-1']]);

    expect(getRouteConversationId(ROUTES_PATH.CHAT, params)).toBe(NEW_CONVERSATION_ID);
  });

  it('preserves explicit chat sidebar conversations over the pending new-chat bucket', () => {
    const params = new URLSearchParams([
      [SIDEBAR_CONVERSATION_ID_PARAM, 'conversation-1'],
      [TAB_QUERY_PARAM.AGENT, 'agent-1'],
    ]);

    expect(getRouteConversationId(ROUTES_PATH.CHAT, params)).toBe('conversation-1');
  });

  it('keeps plain chat home and listing surfaces mapped to their existing buckets', () => {
    expect(getRouteConversationId(ROUTES_PATH.CHAT, new URLSearchParams())).toBeNull();
    expect(getRouteConversationId(ROUTES_PATH.CHAT_FILES, new URLSearchParams())).toBe(FILES_LISTING_CONVERSATION_ID);
    expect(getRouteConversationId(ROUTES_PATH.CHAT_TASK, new URLSearchParams())).toBe(TASKS_LISTING_CONVERSATION_ID);
    expect(getRouteConversationId(ROUTES_PATH.CHAT_AGENTS, new URLSearchParams())).toBe(AGENTS_LISTING_CONVERSATION_ID);
  });
});
