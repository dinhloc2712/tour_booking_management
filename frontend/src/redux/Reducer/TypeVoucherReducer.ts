import { createSlice } from "@reduxjs/toolkit";
import { getTypeVoucher } from "redux/API/GET/GetTypeVoucher";


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

const typeVoucherReducer = createSlice({
  name: 'types',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTypeVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTypeVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.types = action.payload;
      })
      .addCase(getTypeVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch types';
      });
  },
});

export default typeVoucherReducer.reducer