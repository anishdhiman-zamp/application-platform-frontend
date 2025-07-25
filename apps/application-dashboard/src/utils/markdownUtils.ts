export interface HeaderItem {
  id: string;
  text: string;
  level: number;
  children?: HeaderItem[];
}

export const extractHeadersFromMarkdown = (markdownContent: string): HeaderItem[] => {
  const lines = markdownContent.split('\n');
  const headers: HeaderItem[] = [];
  const stack: HeaderItem[] = [];

  lines.forEach((line) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);

    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/\*\*/g, '');
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      const header: HeaderItem = { id, text, level };

      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length === 0) {
        headers.push(header);
      } else {
        const parent = stack[stack.length - 1];

        if (!parent.children) parent.children = [];
        parent.children.push(header);
      }

      stack.push(header);
    }
  });

  return headers;
};
