import type { ReactNode } from 'react';

export function renderHighlightedName(name: string, query?: string): ReactNode {
  const trimmed = query?.trim();

  if (!trimmed) return name;

  const lowerName = name.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const parts: ReactNode[] = [];
  let cursor = 0;

  while (cursor < name.length) {
    const matchIndex = lowerName.indexOf(lowerQuery, cursor);

    if (matchIndex < 0) {
      parts.push(name.slice(cursor));
      break;
    }

    if (matchIndex > cursor) parts.push(name.slice(cursor, matchIndex));

    parts.push(
      <mark key={matchIndex} className='bg-ORANGE_300 text-GRAY_1000 rounded-[2px]'>
        {name.slice(matchIndex, matchIndex + trimmed.length)}
      </mark>,
    );

    cursor = matchIndex + trimmed.length;
  }

  if (parts.length === 0) return name;

  return <>{parts}</>;
}
