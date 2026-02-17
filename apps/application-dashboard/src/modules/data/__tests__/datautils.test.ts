import { ColumnOrderingVisibilityType } from 'modules/data/data.types';
import { getUpdatedColumnOrderingVisibility } from 'modules/data/data.utils';
import { DatasetFilterConfigResponseType } from 'types/api/dataset.types';

jest.mock('next/font/google', () => ({
  Inter: jest.fn(() => ({
    className: 'mocked-inter',
    variable: '--font-inter',
  })),
}));

describe('getUpdatedColumnOrderingVisibility', () => {
  it('should create new column visibility entries for columns not in current visibility (excluding hidden columns)', () => {
    const currentVisibility: ColumnOrderingVisibilityType[] = [];
    const filterConfig: DatasetFilterConfigResponseType[] = [
      {
        column: 'col1',
        metadata: { is_hidden: true },
      },
      {
        column: 'col2',
        metadata: { is_hidden: false },
      },
    ] as DatasetFilterConfigResponseType[];

    const result = getUpdatedColumnOrderingVisibility(currentVisibility, filterConfig);

    // Hidden columns (is_hidden: true) should NOT be added to localStorage
    expect(result).toEqual([{ colId: 'col2', columnName: 'Col2', isVisible: true, width: 0 }]);
  });

  it('should preserve width from existing column visibility entries', () => {
    const currentVisibility: ColumnOrderingVisibilityType[] = [{ colId: 'col1', isVisible: true, width: 100 }];
    const filterConfig: DatasetFilterConfigResponseType[] = [
      {
        column: 'col1',
        metadata: { is_hidden: false },
      },
    ] as DatasetFilterConfigResponseType[];

    const result = getUpdatedColumnOrderingVisibility(currentVisibility, filterConfig);

    expect(result).toEqual([{ colId: 'col1', isVisible: true, width: 100 }]);
  });

  it('should handle columns with no metadata', () => {
    const currentVisibility: ColumnOrderingVisibilityType[] = [];
    const filterConfig: DatasetFilterConfigResponseType[] = [
      {
        column: 'col1',
      },
    ] as DatasetFilterConfigResponseType[];

    const result = getUpdatedColumnOrderingVisibility(currentVisibility, filterConfig);

    expect(result).toEqual([{ colId: 'col1', columnName: 'Col1', isVisible: true, width: 0 }]);
  });

  it('should filter out columns that become hidden in backend', () => {
    const currentVisibility: ColumnOrderingVisibilityType[] = [{ colId: 'col1', isVisible: true, width: 150 }];
    const filterConfig: DatasetFilterConfigResponseType[] = [
      {
        column: 'col1',
        metadata: { is_hidden: true },
      },
    ] as DatasetFilterConfigResponseType[];

    const result = getUpdatedColumnOrderingVisibility(currentVisibility, filterConfig);

    // Hidden columns should be removed from localStorage entirely
    expect(result).toEqual([]);
  });

  it('should maintain column order from current visibility', () => {
    const currentVisibility: ColumnOrderingVisibilityType[] = [
      { colId: 'col1', isVisible: true, width: 100 },
      { colId: 'col2', isVisible: true, width: 200 },
      { colId: 'col3', isVisible: true, width: 300 },
    ];
    const filterConfig: DatasetFilterConfigResponseType[] = [
      {
        column: 'col2',
        metadata: { is_hidden: false },
      },
      {
        column: 'col1',
        metadata: { is_hidden: false },
      },
      {
        column: 'col3',
        metadata: { is_hidden: false },
      },
    ] as DatasetFilterConfigResponseType[];

    const result = getUpdatedColumnOrderingVisibility(currentVisibility, filterConfig);

    expect(result).toEqual([
      { colId: 'col1', isVisible: true, width: 100 },
      { colId: 'col2', isVisible: true, width: 200 },
      { colId: 'col3', isVisible: true, width: 300 },
    ]);
  });

  it('should remove columns not in filter config (unless they are FE-only columns)', () => {
    const currentVisibility: ColumnOrderingVisibilityType[] = [
      { colId: 'col1', isVisible: true, width: 100 },
      { colId: 'col2', isVisible: true, width: 200 },
    ];
    const filterConfig: DatasetFilterConfigResponseType[] = [
      {
        column: 'col1',
        metadata: { is_hidden: false },
      },
    ] as DatasetFilterConfigResponseType[];

    const result = getUpdatedColumnOrderingVisibility(currentVisibility, filterConfig);

    // col2 is removed because it's not in filterConfig and not a FE-only column
    expect(result).toEqual([{ colId: 'col1', isVisible: true, width: 100 }]);
  });
});
