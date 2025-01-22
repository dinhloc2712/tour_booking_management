import { createSlice } from "@reduxjs/toolkit";
import { getTypeSource } from "redux/API/GET/GetTypeSource";

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

const typeSourceReducer = createSlice({
  name: 'types',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTypeSource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTypeSource.fulfilled, (state, action) => {
        state.loading = false;
        state.types = action.payload;
      })
      .addCase(getTypeSource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch types';
      });
  },
});


export default typeSourceReducer.reducer