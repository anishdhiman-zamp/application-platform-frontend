import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SheetFiltersState {
  selectedDatasetIds: string[];
  newFilterId: string;
}

const initialState: SheetFiltersState = {
  selectedDatasetIds: [],
  newFilterId: '',
};

export const sheetFiltersSlice = createSlice({
  name: 'sheetFilters',
  initialState,
  reducers: {
    setSelectedDatasetIds: (state, action: PayloadAction<string[]>) => {
      state.selectedDatasetIds = action.payload;
    },
    setNewFilterId: (state, action: PayloadAction<string>) => {
      state.newFilterId = action.payload;
    },
  },
});

export const { setSelectedDatasetIds, setNewFilterId } = sheetFiltersSlice.actions;

export default sheetFiltersSlice.reducer;
