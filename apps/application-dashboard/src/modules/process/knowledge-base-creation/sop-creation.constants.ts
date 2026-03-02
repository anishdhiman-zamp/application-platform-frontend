export const KNOWLEDGE_BASE_SSE_TYPES = {
  KNOWLEDGE_BASE_UPDATED: 'knowledge_base_updated',
};

export const SOP_CREATION_FILENAME = 'current-sop.md';

export const SOP_FILE_PATH_REGEX = {
  MARKDOWN_LINK: /\[.*?\]\(zamp-file:\/\/(\/[^)]*current-sop\.md)\)/s,
  BACKTICK: /`(\/[^`]*\/current-sop\.md)`/,
};
