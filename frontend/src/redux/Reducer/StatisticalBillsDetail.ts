import { createSlice } from '@reduxjs/toolkit';
import { getStatisticsDeatilBill } from 'redux/API/GET/Statistical/GetStatisticalDetailBills';


interface Refund {
  id: number;
  bill_id: number;
  total_amount: string;
  refund_reason: string;
  created_at: string;
  updated_at: string;
  refund_tour: Array<any>;
  refund_service: Array<any>;
  customer: any;
  staff: any;
  payments: any;
}

interface RefundState {
  refunds: Refund[];
  loading: boolean;
  error: string | null;
}

const initialState: RefundState = {
  refunds: [],
  loading: false,
  error: null,
};

const refundSlice = createSlice({
  name: 'refunds',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStatisticsDeatilBill.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStatisticsDeatilBill.fulfilled, (state, action) => {
        state.loading = false;
        state.refunds = action.payload;
      })
      .addCase(getStatisticsDeatilBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default refundSlice.reducer;
