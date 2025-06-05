import { ColumnOrderingVisibilityType } from 'modules/data/data.types';
import { getUpdatedColumnOrderingVisibility } from 'modules/data/data.utils';
import { DatasetFilterConfigResponseType } from 'types/api/dataset.types';

jest.mock('next/font/google', () => ({
  Inter: jest.fn(() => ({
    className: 'mocked-inter',
    variable: '--font-inter',
  })),
}));

jest.mock('services/api', () => ({
  __esModule: true,
  default: {
    injectEndpoints: jest.fn(() => ({})),
  },
}));

describe('getUpdatedColumnOrderingVisibility', () => {
  it('should create new column visibility entries for columns not in current visibility', () => {
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

    expect(result).toEqual([
      { colId: 'col1', isVisible: false, width: 0 },
      { colId: 'col2', isVisible: true, width: 0 },
    ]);
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

    expect(result).toEqual([{ colId: 'col1', isVisible: true, width: 0 }]);
  });

  it('should update visibility based on metadata.is_hidden while preserving width', () => {
    const currentVisibility: ColumnOrderingVisibilityType[] = [{ colId: 'col1', isVisible: true, width: 150 }];
    const filterConfig: DatasetFilterConfigResponseType[] = [
      {
        column: 'col1',
        metadata: { is_hidden: true },
      },
    ] as DatasetFilterConfigResponseType[];

    const result = getUpdatedColumnOrderingVisibility(currentVisibility, filterConfig);

    expect(result).toEqual([{ colId: 'col1', isVisible: false, width: 150 }]);
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

  it('should handle columns present in visibility but not in filter config', () => {
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

    expect(result).toEqual([
      { colId: 'col1', isVisible: true, width: 100 },
      { colId: 'col2', isVisible: false, width: 200 },
    ]);
  });
});
