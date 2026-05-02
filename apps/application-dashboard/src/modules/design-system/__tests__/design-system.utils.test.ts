import type { ComponentEntryType } from 'modules/design-system/types/design-system.types';
import {
  filterEntriesByQuery,
  groupEntriesByCategory,
  slugifyCategory,
} from 'modules/design-system/utils/design-system.utils';

const sampleEntries: ComponentEntryType[] = [
  {
    id: 'button',
    name: 'Button',
    category: 'Buttons',
    filePath: 'packages/ui/src/components/ui/button.tsx',
    renderable: true,
  },
  {
    id: 'input',
    name: 'Input',
    category: 'Form Inputs',
    filePath: 'packages/ui/src/components/ui/input.tsx',
    renderable: true,
    description: 'text field',
  },
  {
    id: 'toggle',
    name: 'Toggle',
    category: 'Buttons',
    filePath: 'packages/ui/src/components/ui/toggle.tsx',
    renderable: true,
  },
];

describe('filterEntriesByQuery', () => {
  it('returns all entries when query is empty', () => {
    expect(filterEntriesByQuery(sampleEntries, '')).toHaveLength(3);
    expect(filterEntriesByQuery(sampleEntries, '   ')).toHaveLength(3);
  });

  it('matches by component name', () => {
    expect(filterEntriesByQuery(sampleEntries, 'input')).toEqual([sampleEntries[1]]);
  });

  it('matches by category', () => {
    expect(filterEntriesByQuery(sampleEntries, 'buttons').map((entry) => entry.id)).toEqual(['button', 'toggle']);
  });

  it('matches by description', () => {
    expect(filterEntriesByQuery(sampleEntries, 'text field')).toEqual([sampleEntries[1]]);
  });

  it('matches by file path', () => {
    expect(filterEntriesByQuery(sampleEntries, 'input.tsx')).toEqual([sampleEntries[1]]);
  });

  it('handles empty input list', () => {
    expect(filterEntriesByQuery([], 'button')).toEqual([]);
  });
});

describe('groupEntriesByCategory', () => {
  it('groups entries by category preserving order', () => {
    const groups = groupEntriesByCategory(sampleEntries);

    expect(groups).toHaveLength(2);
    expect(groups[0].category).toBe('Buttons');
    expect(groups[0].entries.map((entry) => entry.id)).toEqual(['button', 'toggle']);
    expect(groups[1].category).toBe('Form Inputs');
  });

  it('handles empty list', () => {
    expect(groupEntriesByCategory([])).toEqual([]);
  });
});

describe('slugifyCategory', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(slugifyCategory('Form Inputs')).toBe('form-inputs');
    expect(slugifyCategory('Tooltips & Disclosure')).toBe('tooltips-disclosure');
  });
});
