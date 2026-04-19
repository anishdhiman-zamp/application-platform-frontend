import type { ReactNode } from 'react';

export function renderHighlightedName(name: string, query?: string): ReactNode {
  const trimmed = query?.trim();

  if (!trimmed) return name;

  const lowerName = name.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const matchIndex = lowerName.indexOf(lowerQuery);

  if (matchIndex < 0) return name;

  const before = name.slice(0, matchIndex);
  const match = name.slice(matchIndex, matchIndex + trimmed.length);
  const after = name.slice(matchIndex + trimmed.length);

  return (
    <>
      {before}
      <mark className='bg-ORANGE_300 text-GRAY_1000 rounded-[2px]'>{match}</mark>
      {after}
    </>
  );
}
