export const TOOL_NAMES = {
  AUTHENTICATE_INTEGRATION_AND_CREATE_CONNECTION: 'authenticate_integration_and_create_connection',
  EXECUTE_BROWSER_COMMAND: 'execute_browser_command',
} as const;

export const BROWSER_TOOL_DISPLAY_NAMES = ['Execute browser command', 'Using Browser', 'Browser'] as const;

export enum FILE_MIME {
  APPLICATION_PDF = 'application/pdf',
  IMAGE_JPEG = 'image/jpeg',
  IMAGE_PNG = 'image/png',
  IMAGE_BMP = 'image/bmp',
  TEXT_CSV = 'text/csv',
  TEXT_PLAIN = 'text/plain',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  XLS = 'application/vnd.ms-excel',
  BAI2 = 'application/x-bai',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

export const FileMimeType: Record<string, string> = {
  [FILE_MIME.APPLICATION_PDF]: 'pdf',
  [FILE_MIME.DOCX]: 'docx',
  [FILE_MIME.IMAGE_JPEG]: 'jpeg',
  [FILE_MIME.IMAGE_PNG]: 'png',
  [FILE_MIME.IMAGE_BMP]: 'bmp',
  [FILE_MIME.TEXT_CSV]: 'csv',
  [FILE_MIME.TEXT_PLAIN]: 'txt',
};
