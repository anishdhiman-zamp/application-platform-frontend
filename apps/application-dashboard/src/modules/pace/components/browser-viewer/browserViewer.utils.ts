const A2A_TASK_CONVERSATION_ID_PREFIX = 'a2a-task-';

export const expectedChromeSessionIdForConversation = (conversationId: string): string => {
  const pathKey = conversationId.startsWith(A2A_TASK_CONVERSATION_ID_PREFIX)
    ? conversationId.slice(A2A_TASK_CONVERSATION_ID_PREFIX.length)
    : conversationId;

  return `chrome-${pathKey}`;
};

export const coerceIframeSrcForSecurePage = (url: string): string => {
  if (typeof window === 'undefined' || window.location.protocol !== 'https:') {
    return url;
  }
  if (url.startsWith('http://')) {
    return `https://${url.slice('http://'.length)}`;
  }

  return url;
};
