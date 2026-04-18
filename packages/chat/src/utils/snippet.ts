const SNIPPET_LINE_THRESHOLD = 15;
const SNIPPET_CHAR_THRESHOLD = 2000;

const PASTED_FILE_PATTERN = /^Pasted(?:\((\d+)\))?\.txt$/;

/**
 * Determines whether the given text exceeds the snippet size thresholds.
 * @param text - The text to evaluate.
 * @returns `true` if the text has more than {@link SNIPPET_LINE_THRESHOLD} lines
 *          or more than {@link SNIPPET_CHAR_THRESHOLD} characters.
 */
export const isLargeText = (text: string): boolean => {
  return text.split('\n').length > SNIPPET_LINE_THRESHOLD && text.length > SNIPPET_CHAR_THRESHOLD;
};

/**
 * Generates the next unique snippet file name based on existing file names.
 * Follows the naming pattern `Pasted.txt`, `Pasted(1).txt`, `Pasted(2).txt`, etc.
 * @param existingFileNames - Array of existing file names to check against.
 * @returns The next available snippet file name.
 */
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

/**
 * Creates a plain-text `File` object from the given text, using a unique snippet file name.
 * @param text - The text content to include in the file.
 * @param existingFileNames - Array of existing file names used to determine the next unique name.
 * @returns A `File` object with MIME type `text/plain`.
 */
export const createSnippetFile = (text: string, existingFileNames: string[]): File => {
  const blob = new Blob([text], { type: 'text/plain' });
  return new File([blob], getNextSnippetFileName(existingFileNames), { type: 'text/plain' });
};
