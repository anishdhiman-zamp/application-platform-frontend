import { INPUT_FILE_FORMATS } from '@/types/common/mime';

export const ACCEPTED_FILE_TYPES = `${INPUT_FILE_FORMATS.TXT},${INPUT_FILE_FORMATS.PDF},${INPUT_FILE_FORMATS.DOCX},${INPUT_FILE_FORMATS.JPEG},${INPUT_FILE_FORMATS.JPG},${INPUT_FILE_FORMATS.PNG},${INPUT_FILE_FORMATS.BMP}`;

export const DEFAULT_CHAT_TITLE = 'Untitled';
export const DEBOUNCE_DELAY_MS = 300;
export const NEW_CONVERSATION_ID = 'null_thread';
export const SIDEBAR_WIDTH = 400;

export const SIDEBAR_CONVERSATION_ID_PARAM = 's';
export const CHAT_CONVERSATION_ID_PARAM = 'c';

export const ACCEPTED_SKILLFILE_TYPES = ['.zip', '.skill'];

export const SKILL_FILE_REQUIREMENTS = [
  '.md file must contain skill name and description formatted in YAML',
  '.zip or .skill file must include a SKILL.md file',
];
