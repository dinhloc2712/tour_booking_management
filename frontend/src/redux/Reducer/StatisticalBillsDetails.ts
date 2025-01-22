import { createSlice } from '@reduxjs/toolkit';
import { getStatisticsDeatilBills } from 'redux/API/GET/Statistical/GetStatisticalDetailBill';
import { getStatisticsDeatilBill } from 'redux/API/GET/Statistical/GetStatisticalDetailBills';


interface Bills {
  id: number;
  type: string;
  total_amount: string;
  deposit: string;
  created_at: string;
  updated_at: string;
  bill_tours: Array<any>;
  bill_services: Array<any>;
  customer: any;
  staff: any;
  payment: any;
}

interface BillsState {
  bills: Bills[];
  loading: boolean;
  error: string | null;
}

const initialState: BillsState = {
  bills: [],
  loading: false,
  error: null,
};

const billsSlice = createSlice({
  name: 'bills',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStatisticsDeatilBills.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStatisticsDeatilBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload;
      })
      .addCase(getStatisticsDeatilBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default billsSlice.reducer;
