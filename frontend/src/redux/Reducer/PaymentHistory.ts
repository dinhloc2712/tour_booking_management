// redux/paymentHistory/PaymentHistoryReducer.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface BillTour {
  id: number;
  bill_id: number;
  tour_id: number;
  customer_ids: number[];
  price: string;
  note: string;
  created_at: string;
  updated_at: string;
  name_tour: string;
}

interface BillService {
  id: number;
  bill_id: number;
  tour_id: number;
  service_id: number;
  sale_agent_id: string | null;
  quantity: number;
  unit: string | null;
  price: string;
  note: string | null;
  name_service: string;
}

interface PaymentHistory {
  id: number;
  booking_id: number;
  staff_id: number;
  customer_id: number;
  total_amount: string;
  deposit: string;
  value_voucher: string | null;
  created_at: string;
  updated_at: string;
  bill_tours: BillTour[];
  bill_services: BillService[];
}

interface PaymentHistoryState {
  historyData: PaymentHistory[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentHistoryState = {
  historyData: [],
  loading: false,
  error: null,
};

// Fetch dữ liệu thanh toán
export const fetchPaymentHistory = createAsyncThunk(
  'paymentHistory/fetchPaymentHistory',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bill/booking/${id}`);

      if (!response.ok) {
        throw new Error('Có lỗi xảy ra khi tải dữ liệu');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Lỗi không xác định');
    }
  }
);

const PaymentHistoryReducer = createSlice({
  name: 'paymentHistory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action: PayloadAction<PaymentHistory[]>) => {
        state.loading = false;
        state.historyData = action.payload;
      })

  },
});

export default PaymentHistoryReducer.reducer;
