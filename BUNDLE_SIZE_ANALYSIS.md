# Bundle Size Analysis - Large First Load JS

## Problem Summary

Several pages have First Load JS sizes in the MB range (1.4-1.7 MB), which significantly impacts initial page load performance.

## Affected Pages

| Route                       | First Load JS | Issue                             |
| --------------------------- | ------------- | --------------------------------- |
| `/admin/datasets`           | 1.69 MB       | Heavy ag-grid imports             |
| `/admin/datasets/[id]`      | 1.49 MB       | Heavy ag-grid imports             |
| `/admin/datasets/dag`       | 1.73 MB       | ReactFlow + ag-grid               |
| `/datasets`                 | 1.44 MB       | Heavy ag-grid imports             |
| `/datasets/[datasetId]`     | 1.62 MB       | Heavy ag-grid imports             |
| `/pages/[pageId]/[sheetId]` | 1.74 MB       | ag-charts + react-grid-layout     |
| `/team`                     | 1.71 MB       | Likely ag-grid in team components |

## Root Causes

### 1. **ag-grid-enterprise & ag-grid-community** (Largest Impact)

**Location**: `components/common/table/index.tsx`

- Both libraries are statically imported at the top level
- ag-grid-enterprise alone is ~500KB+ minified
- Used in: AdminDatasetListing, Dataset component, and many other pages

**Current Code**:

```typescript
import { ... } from 'ag-grid-community';
import { ... } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
```

### 2. **ag-charts-enterprise** (Large Impact)

**Location**: `triage/bff/page.tsx` (line 11)

- Imported at the top level: `import 'ag-charts-enterprise';`
- This is a side-effect import that loads the entire enterprise chart library
- Also used in widget components

**Current Code**:

```typescript
import 'ag-charts-enterprise'; // Side-effect import - loads entire library
```

### 3. **@xyflow/react** (ReactFlow)

**Location**: `modules/admin/AdminDatasetDag.tsx`

- Large graph visualization library (~200KB+)
- Only used in the DAG view page

**Current Code**:

```typescript
import { type Edge, type Node, ReactFlow, ... } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
```

### 4. **@monaco-editor/react** (Monaco Editor)

**Location**:

- `modules/admin/AdminEditTemplate.tsx`
- `modules/admin/AdminDatasetTransform.tsx`
- Monaco editor is very large (~2MB+ unminified, ~500KB+ minified)

**Current Code**:

```typescript
import MonacoEditor from '@monaco-editor/react';
```

### 5. **react-grid-layout**

**Location**: `modules/sheets/index.tsx`

- Used for the sheets/widget layout system
- Moderate size but adds to bundle

**Current Code**:

```typescript
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
```

## Recommendations

### Priority 1: Dynamic Import Heavy Libraries

#### 1.1. Make ag-grid Table Component Dynamic

**File**: `components/common/table/index.tsx`

Create a wrapper that dynamically imports the Table component:

```typescript
// components/common/table/DynamicTable.tsx
import dynamic from 'next/dynamic';

const DynamicTable = dynamic(() => import('./index'), {
  loading: () => <div>Loading table...</div>,
  ssr: false,
});

export default DynamicTable;
```

Then update components to use `DynamicTable` instead of `Table`.

#### 1.2. Dynamic Import ag-charts-enterprise

**File**: `triage/bff/page.tsx`

Remove the top-level import and dynamically import it only when needed:

```typescript
// Remove: import 'ag-charts-enterprise';

// In the component or in a useEffect:
useEffect(() => {
  import('ag-charts-enterprise');
}, []);
```

Or better, move it to where charts are actually rendered.

#### 1.3. Dynamic Import ReactFlow

**File**: `modules/admin/AdminDatasetDag.tsx`

```typescript
import dynamic from 'next/dynamic';

const ReactFlow = dynamic(() => import('@xyflow/react').then((mod) => mod.ReactFlow), { ssr: false });
```

#### 1.4. Dynamic Import Monaco Editor

**Files**:

- `modules/admin/AdminEditTemplate.tsx`
- `modules/admin/AdminDatasetTransform.tsx`

```typescript
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>,
});
```

#### 1.5. Dynamic Import react-grid-layout

**File**: `modules/sheets/index.tsx`

```typescript
import dynamic from 'next/dynamic';

const ResponsiveGridLayout = dynamic(
  () =>
    import('react-grid-layout').then((mod) => {
      const { Responsive, WidthProvider } = mod;
      return WidthProvider(Responsive);
    }),
  { ssr: false },
);
```

### Priority 2: Code Splitting Strategy

#### 2.1. Create Route-Based Code Splitting

For pages that use heavy components, use dynamic imports at the page level:

```typescript
// app/(authenticated)/admin/datasets/page.tsx
import dynamic from 'next/dynamic';

const AdminDatasetListing = dynamic(() => import('modules/admin/AdminDatasetListing'), { ssr: false });
```

#### 2.2. Lazy Load Widget Components

**File**: `modules/widgets/WidgetsWrapper.tsx`

Dynamically import heavy widget components:

```typescript
const AGChartsWidgets = dynamic(() => import('@/modules/widgets/AgChartWidgets'), {
  ssr: false,
});
```

### Priority 3: Optimize Imports

#### 3.1. Tree Shaking

Ensure you're only importing what you need from ag-grid:

```typescript
// Instead of importing everything, import specific modules
import { ColDef, AgGridReact } from 'ag-grid-react';
```

#### 3.2. Check for Duplicate Imports

Some components might be importing the same heavy libraries multiple times.

## Expected Impact

After implementing dynamic imports:

| Page                        | Current | Expected    | Reduction |
| --------------------------- | ------- | ----------- | --------- |
| `/admin/datasets`           | 1.69 MB | ~400-500 KB | ~70%      |
| `/pages/[pageId]/[sheetId]` | 1.74 MB | ~500-600 KB | ~65%      |
| `/admin/datasets/dag`       | 1.73 MB | ~600-700 KB | ~60%      |

## Implementation Steps

1. **Start with highest impact**: Make Table component dynamic (affects most pages)
2. **Remove ag-charts-enterprise top-level import**: Move to dynamic import
3. **Make ReactFlow dynamic**: Only used in one page
4. **Make Monaco Editor dynamic**: Only used in admin pages
5. **Test each change**: Verify functionality and measure bundle size reduction
6. **Monitor**: Use Next.js build output to track improvements

## Additional Notes

- Use `ssr: false` for components that don't need server-side rendering (like ag-grid, charts, editors)
- Provide loading states for better UX during dynamic imports
- Consider using React Suspense boundaries for better loading experience
- Monitor bundle sizes after each change using `npm run build`
