import { widgetData, widgetInstanceDetails } from 'modules/widgets/Pivot/__tests__/mockPivotData';
import {
  AGGridPivotNode,
  flattenChildrenAfterGroup,
  getPivotColDefs,
  getPivotColumns,
  getPivotData,
} from 'modules/widgets/Pivot/pivot.utils';
import '@testing-library/jest-dom';

describe('getPivotColDefs', () => {
  it('works correctly', () => {
    const pivotColumns = getPivotColumns(widgetInstanceDetails, widgetData);
    const result = getPivotColDefs(pivotColumns);

    expect(result).toBeDefined();
  });
});

describe('getPivotData', () => {
  it('works correctly', () => {
    const pivotColumns = getPivotColumns(widgetInstanceDetails, widgetData);

    const result = getPivotData(pivotColumns, widgetData);

    expect(result).toBeDefined();
  });
});

describe('getPivotColDefs', () => {
  it('works correctly', () => {
    const pivotColumns = getPivotColumns(widgetInstanceDetails, widgetData);
    const result = getPivotColDefs(pivotColumns);


    expect(result).toBeDefined();
  });
});

describe('flattenChildrenAfterGroup', () => {
  it('flattens a simple tree structure', () => {
    const simpleTree: AGGridPivotNode<any> = {
      key: 'root',
      childrenAfterGroup: [
        {
          key: 'child1',
          childrenAfterGroup: [],
        },
        {
          key: 'child2',
          childrenAfterGroup: [],
        },
      ],
    };

    const result = flattenChildrenAfterGroup(simpleTree);

    expect(result).toHaveLength(2);
    expect(result.map((node) => node.key)).toEqual(['child1', 'child2']);
  });

  it('flattens a nested tree structure', () => {
    const nestedTree: AGGridPivotNode<any> = {
      key: 'root',
      childrenAfterGroup: [
        {
          key: 'child1',
          childrenAfterGroup: [
            {
              key: 'grandchild1',
              childrenAfterGroup: [],
            },
          ],
        },
        {
          key: 'child2',
          childrenAfterGroup: [
            {
              key: 'grandchild2',
              childrenAfterGroup: [],
            },
          ],
        },
      ],
    };

    const result = flattenChildrenAfterGroup(nestedTree);

    expect(result).toHaveLength(4);
    expect(result.map((node) => node.key)).toEqual(['child1', 'child2', 'grandchild1', 'grandchild2']);
  });

  it('returns empty array for leaf node', () => {
    const leafNode: AGGridPivotNode<any> = {
      key: 'leaf',
      childrenAfterGroup: [],
    };

    const result = flattenChildrenAfterGroup(leafNode);

    expect(result).toHaveLength(0);
  });

  it('returns empty array if childrenAfterGroup is undefined', () => {
    const node: AGGridPivotNode<any> = {
      key: 'root',
    };

    const result = flattenChildrenAfterGroup(node);

    expect(result).toHaveLength(0);
  });
});
