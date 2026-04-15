const SNIPPET_LINE_THRESHOLD = 5;
const SNIPPET_CHAR_THRESHOLD = 500;

const PASTED_FILE_PATTERN = /^Pasted(?:\((\d+)\))?\.txt$/;

export const isLargeText = (text: string): boolean => {
  return text.split('\n').length > SNIPPET_LINE_THRESHOLD || text.length > SNIPPET_CHAR_THRESHOLD;
};

export const getNextSnippetFileName = (existingFileNames: string[]): string => {
  let maxIndex = -1;

  for (const name of existingFileNames) {
    const match = name.match(PASTED_FILE_PATTERN);
    if (match) {
      const index = match[1] !== undefined ? parseInt(match[1], 10) : 0;
      maxIndex = Math.max(maxIndex, index);
    }
  }

  if (maxIndex === -1) return 'Pasted.txt';
  return `Pasted(${maxIndex + 1}).txt`;
};

export const createSnippetFile = (text: string, existingFileNames: string[]): File => {
  const blob = new Blob([text], { type: 'text/plain' });
  return new File([blob], getNextSnippetFileName(existingFileNames), { type: 'text/plain' });
};
