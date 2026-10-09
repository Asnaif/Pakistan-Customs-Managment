import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  startDate: string;
  endDate: string;
  portId: number | null;
  hsCode: string | null;
  inspectionStatus: string | null;
}

const initialState: FilterState = {
  startDate: '2025-01-01',
  endDate: '2026-12-31',
  portId: null,
  hsCode: null,
  inspectionStatus: null,
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setDateRange(state, action: PayloadAction<{ startDate: string; endDate: string }>) {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    setPortId(state, action: PayloadAction<number | null>) {
      state.portId = action.payload;
    },
    setHsCode(state, action: PayloadAction<string | null>) {
      state.hsCode = action.payload;
    },
    setInspectionStatus(state, action: PayloadAction<string | null>) {
      state.inspectionStatus = action.payload;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const { setDateRange, setPortId, setHsCode, setInspectionStatus, resetFilters } = filterSlice.actions;
export default filterSlice.reducer;
