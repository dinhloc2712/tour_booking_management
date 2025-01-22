import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { deleteService } from 'redux/API/DELETE/DeleteService';
import { getService } from 'redux/API/GET/getService/GetService';
import { getStatiscalService } from 'redux/API/GET/Statistical/GetStatisticalService';
import { updateService } from 'redux/API/PUT/EditService';

export interface DebtDetail {
  id: string; 
  service_id: string; 
  name_service: string; 
  price: string; 
  quantity: string; 
  unit: string; 
  note: string; 
  created_at: string; 
  updated_at: string; 
}

export interface SaleAgent {
  id: string; 
  name: string; 
  type: string; 
  email: string; 
  phone: string; 
  address: string; 
  is_active: boolean; 
  created_at: string;
  updated_at: string; 
}

export interface StatisticalService {
  id: string; 
  sale_agent_id: string; 
  revenue: string;
  paid_amount: string; 
  status_debt: string; 
  created_at: string; 
  updated_at: string; 
  sale_agent: SaleAgent;
  debt_details: DebtDetail[]; 
}


interface StatisticalServiceState {
  StatisticalService: StatisticalService[];
  editingService: StatisticalService | null;
  loading: boolean;
  error: string | null;
}

const initialState: StatisticalServiceState = {
  StatisticalService: [],
  editingService: null,
  loading: false,
  error: null,
};

const StatisticalServiceReducer = createSlice({
  name: 'Statisticalservice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStatiscalService.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStatiscalService.fulfilled, (state, action) => {
        state.StatisticalService = action.payload;
        state.loading = false;
      })
      .addCase(getStatiscalService.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch services';
        state.loading = false;
      })
  },
});

export default StatisticalServiceReducer.reducer;