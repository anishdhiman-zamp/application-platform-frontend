export const LIST_TABLES_QUERY = `
SELECT t.table_name,
       pg_catalog.obj_description(c.oid, 'pg_class') AS description
FROM information_schema.tables t
LEFT JOIN pg_catalog.pg_class c ON c.relname = t.table_name
  AND c.relnamespace = (SELECT oid FROM pg_catalog.pg_namespace WHERE nspname = t.table_schema)
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name
`.trim();

export const DETAIL_PAGE_SIZE = 100;

export const PACE_DATASET_THEME_PARAMS = {
  fontFamily: { googleFont: 'Inter' },
  headerFontSize: 12,
  headerFontWeight: 600,
  rowHeight: 32,
  headerHeight: 48,
  wrapperBorderRadius: 0,
  iconSize: 12,
  backgroundColor: 'var(--BG_WHITE)',
  foregroundColor: 'var(--GRAY_1000)',
  headerBackgroundColor: 'var(--BG_WHITE)',
  headerTextColor: 'var(--GRAY_1000)',
  headerRowBorder: { style: 'solid' as const, width: 1, color: 'var(--GRAY_400)' },
  headerColumnBorder: { style: 'solid' as const, width: 1, color: 'var(--GRAY_100)' },
  headerColumnResizeHandleColor: 'var(--BG_WHITE)',
  rowBorder: { style: 'solid' as const, width: 1, color: 'var(--GRAY_100)' },
  columnBorder: { style: 'solid' as const, width: 1, color: 'var(--GRAY_100)' },
  rowHoverColor: 'var(--BG_GRAY_1)',
  rowLoadingSkeletonEffectColor: 'var(--GRAY_50)',
  selectCellBorder: { style: 'solid' as const, width: 1.5, color: 'var(--BLUE_700)' },
  rangeSelectionBorderColor: 'var(--BLUE_700)',
  cellEditingBorder: { style: 'solid' as const, width: 1.5, color: 'var(--BLUE_700)' },
  wrapperBorder: { width: 1, style: 'solid' as const, color: 'var(--GRAY_400)' },
  menuBorder: { style: 'solid' as const, width: 1, color: 'var(--GRAY_500)' },
  menuBackgroundColor: 'var(--BG_WHITE)',
  borderColor: 'var(--GRAY_400)',
};

const escapeSqlString = (value: string): string => value.replace(/'/g, "''");

const buildSingleFilterClause = (colId: string, condition: Record<string, unknown>): string | undefined => {
  const col = `"${colId}"`;
  const value = escapeSqlString(String(condition.filter ?? ''));

  switch (condition.type) {
    case 'contains':
      return `${col}::text ILIKE '%${value}%'`;
    case 'notContains':
      return `${col}::text NOT ILIKE '%${value}%'`;
    case 'equals':
      return `${col}::text = '${value}'`;
    case 'notEqual':
      return `${col}::text != '${value}'`;
    case 'startsWith':
      return `${col}::text ILIKE '${value}%'`;
    case 'endsWith':
      return `${col}::text ILIKE '%${value}'`;
    case 'blank':
      return `(${col} IS NULL OR ${col}::text = '')`;
    case 'notBlank':
      return `(${col} IS NOT NULL AND ${col}::text != '')`;
    default:
      return undefined;
  }
};

export const buildFilterClauses = (filterModel: Record<string, Record<string, unknown>>): string | undefined => {
  const clauses: string[] = [];

  for (const [colId, filter] of Object.entries(filterModel)) {
    if (filter.conditions && Array.isArray(filter.conditions)) {
      const subClauses = (filter.conditions as Record<string, unknown>[])
        .map((c) => buildSingleFilterClause(colId, c))
        .filter(Boolean);

      if (subClauses.length) {
        const op = filter.operator === 'OR' ? ' OR ' : ' AND ';

        clauses.push(`(${subClauses.join(op)})`);
      }
    } else {
      const clause = buildSingleFilterClause(colId, filter);

      if (clause) clauses.push(clause);
    }
  }

  return clauses.length ? clauses.join(' AND ') : undefined;
};

export const buildSelectTableQuery = (
  tableName: string,
  limit: number,
  offset: number,
  sortModel?: { colId: string; sort: string }[],
  filterClauses?: string,
): string => {
  let query = `SELECT * FROM "${tableName}"`;

  if (filterClauses) query += ` WHERE ${filterClauses}`;
  if (sortModel?.length) {
    query += ` ORDER BY ${sortModel.map((s) => `"${s.colId}" ${s.sort === 'desc' ? 'DESC' : 'ASC'}`).join(', ')}`;
  } else {
    query += ' ORDER BY 1';
  }
  query += ` LIMIT ${limit} OFFSET ${offset}`;

  return query;
};

export const buildCountQuery = (tableName: string, filterClauses?: string): string => {
  let query = `SELECT COUNT(*) AS total FROM "${tableName}"`;

  if (filterClauses) query += ` WHERE ${filterClauses}`;

  return query;
};
