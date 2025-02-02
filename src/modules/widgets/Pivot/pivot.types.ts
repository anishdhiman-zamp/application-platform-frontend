export type PivotColumnMetadata =
  | {
      kind: 'group';
      name: string;
      dataType: 'string' | 'number' | 'date';
      sourceName: string;
      mappingName: string;
      heirarchy: number;
      hasChildren: boolean;
      maxHeirarchy: number;
    }
  | {
      kind: 'pivot';
      name: string;
      dataType: 'string' | 'number' | 'date';
      sourceName: string;
      mappingName: string;
    }
  | {
      kind: 'aggregate';
      name: string;
      dataType: 'string' | 'number' | 'date';
      aggregation: string;
      sourceName: string;
      mappingName: string;
    };
