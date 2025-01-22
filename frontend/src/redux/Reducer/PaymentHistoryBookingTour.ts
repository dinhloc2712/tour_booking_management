import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Customer {
    id: number;
    fullname: string;
    email?: string; 
    is_active: boolean;
}

interface BillService {
    id: number;
    bill_id: number;
    tour_id: number;
    quantity: number;
    name_service: string;
}


interface BillTour {
    id: number;
    bill_id: number;
    customer_ids: number[];
    price: string;
    created_at: string;
    total_amount: string;
    name_tour: string;
}

interface Payment {
    id: number;
    bill_id: number;
    amount: number;
    type: string;
    created_at: string;
    updated_at: string
}

interface Tour {
    id: number;
    name_tour: string;
    price: string;
    created_at: string;
    booking_tour_id: number;
    customers: Customer[];
    bill_services: BillService[];  
    bill_tours: BillTour[];        
    payments: Payment[];         
    quantity_customer: number;    
    total_amount: string;        
    deposit: string;            
    value_voucher?: string | null; 
}

interface TourState {
    tours: Tour[];
    loading: boolean;
    error: string | null;
}

const initialState: TourState = {
    tours: [],
    loading: false,
    error: null,
};

export const paymentHistoryBookingTour = createAsyncThunk(
    'tours/paymentHistoryBookingTour',
    async (id: string) => {
        const response = await fetch(`http://127.0.0.1:8000/api/bill/booking/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        return data.data;
    }
);

const PaymentHistoryBookingTour = createSlice({
    name: 'paymentHistoryBookingTour',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(paymentHistoryBookingTour.pending, (state) => {
                state.loading = true;
            })
            .addCase(paymentHistoryBookingTour.fulfilled, (state, action: PayloadAction<Tour[]>) => {
                state.loading = false;
                state.tours = action.payload;
            })
            .addCase(paymentHistoryBookingTour.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch data';
            });
    },
});

export default PaymentHistoryBookingTour.reducer;
