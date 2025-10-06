import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ScrollPosition {
  scrollTop: number;
  scrollLeft: number;
}

interface TableStateSlice {
  scrollPositions: Record<string, ScrollPosition>;
  highlightedRows: Record<string, number>;
}

const initialState: TableStateSlice = {
  scrollPositions: {},
  highlightedRows: {},
};

export const tableStateSlice = createSlice({
  name: 'tableState',
  initialState,
  reducers: {
    setScrollPosition: (state, action: PayloadAction<{ key: string; position: ScrollPosition }>) => {
      state.scrollPositions[action.payload.key] = action.payload.position;
    },
    clearScrollPosition: (state, action: PayloadAction<string>) => {
      delete state.scrollPositions[action.payload];
    },
    setHighlightedRow: (state, action: PayloadAction<{ key: string; rowIndex: number }>) => {
      state.highlightedRows[action.payload.key] = action.payload.rowIndex;
    },
    clearHighlightedRow: (state, action: PayloadAction<string>) => {
      delete state.highlightedRows[action.payload];
    },
    clearAllTableState: () => {
      return initialState;
    },
  },
});

export const { setScrollPosition, clearScrollPosition, setHighlightedRow, clearHighlightedRow, clearAllTableState } =
  tableStateSlice.actions;

export default tableStateSlice.reducer;
