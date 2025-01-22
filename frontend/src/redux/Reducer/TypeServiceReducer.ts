import { createSlice } from "@reduxjs/toolkit";
import { getTypeService } from "redux/API/GET/GetTypeService";

interface TypeState {
  types: string[];
  loading: boolean;
  error: string | null;
}

const initialState: TypeState = {
  types: [],
  loading: false,
  error: null,
};

const typeServiceReducer = createSlice({
  name: 'types',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTypeService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTypeService.fulfilled, (state, action) => {
        state.loading = false;
        state.types = action.payload;
      })
      .addCase(getTypeService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch types';
      });
  },
});

export default typeServiceReducer.reducer