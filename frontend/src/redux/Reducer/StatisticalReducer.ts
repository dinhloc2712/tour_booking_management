import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getStaticalAll } from 'redux/API/GET/Statistical/GetStatisticalAll';
import { getBillStatistics } from 'redux/API/GET/Statistical/GetStatisticalBill';
import { getBookingStatistics } from 'redux/API/GET/Statistical/GetStatisticalBooking';
import { getStatisticsDeatilBooking } from 'redux/API/GET/Statistical/GetStatisticalDetailBooking';
import { getTourStatistics } from 'redux/API/GET/Statistical/GetStatisticalTour';
import { getSaleStatistics } from 'redux/API/GET/Statistical/GetStatisticaSale';
import { getStatisticalTour } from 'redux/API/GET/Statistical/GetTour';
import { ADDSaleAgentBookingStatistics } from 'redux/API/POST/GetStatisticalSaleAgent';
import { ADDTourBookingStatistics } from 'redux/API/POST/GetStatisticalTourBooking';

export interface BookingData {
  day: number;
  date: string;
  total_bookings: number;
  total_amount: number;
}

export interface BookingDatas {
  day: number;
  date: string;
  total_bookings: number;
  total_deposit: number;
  paid_bookings: number;
  unpaid_bookings: number;
  partial_paid_bookings: number;
  sale_agent_bookings: number;
}

export interface BookingDatasBill {
  day: number;
  date: string;
  total_amount_bill: number;
  total_amount_refund: number;
  total_amount_deposit: number;
  total_revenue: number;
  count_bill_paid: number;
  count_bill_refund: number;
  count_booking_deposit: number;
}


export interface BookingDatasAll {
    date: string;
    total_customers: number;
    checked_in_customers: number;
    not_checked_in_customers: number;
    check_in_ratio: string;
    revenue: string;
    refund_amount: string;
    booking_count: number;
  }


export interface MonthlyBookingData {
  month: string;
  total_bookings: number;
  total_amount: number;
}

export interface WeeklyBookingData {
  week: number;
  total_bookings: number;
  total_amount: number;
}

export interface BookingDataTour {
  tour_id: number;
  tour_name: string;
  booking_count: number;
  percentage: number;
}

export interface Customer {
  fullName: string;
  phone: string;
}

export interface StatisticalTour {
  tour_id: number;
  tour_name: string;
  booking_tour_id: number;
  start_time: string;
  end_time: string;
  quantity_customer: number;
  status: string;
  last_booking_date: string;
  customers: Customer[];
  bill: any | null;
  refund: any | null;
  payment: number;
}

export interface BookingDetails {
  created_at: string;
  tour_name: string;
  status_payment: string;
  deposit: number | null;
  booker_name: string;
  booker_phone: string;
  branch_name: string;
  staff_name: string;
  sale_agent_name: string;
}

export interface TourInfo {
  tour_name: string;
  branch_name: string;
  '4month_max': number[];
  '4month_min': string;
  favorite_amount_days: string;
  grouped_by_days: { [key: string]: number };
}

export interface BookingStatisticsResponse {
  status: string;
  message: string;
  data: BookingDataTourBooking[];
  inforTour: TourInfo;
}


export interface BookingDataTourBooking {
  month: number;
  total_bookings: number;
  average_days: number;
  "4month_max": number[];
  "4month_min": string;
  tour_name: string;
  branch_name: string;
}


export interface BookingDataSaleBooking {
  date: string;
  booking_count: number;
  total_deposit: number;
  total_amount: number;
  paid_commission: number;
  unpaid_commission: number;
}



export interface StatisticalState {
  bookingsData: BookingData[];
  bookingsDatas: BookingDatas[];
  bookingDatasBill: BookingDatasBill[];
  bookingDataTour: BookingDataTour[];
  monthlyBookingsData: MonthlyBookingData[];
  weeklyBookingsData: WeeklyBookingData[];
  bookingDetails: {
    status: string;
    message: string;
    data: BookingDetails[];
  };
  bookingDataSaleBooking: BookingDataSaleBooking[];
  statisticalTour: StatisticalTour[];
  loading: boolean;
  error: string | null;
  bookingDataTourBooking: BookingStatisticsResponse | null;
  bookingDatasAll: BookingDatasAll | null;
  
  
}

const initialState: StatisticalState = {
  bookingsData: [],
  bookingsDatas: [],
  bookingDatasBill: [],
  bookingDataTour: [],
  monthlyBookingsData: [],
  weeklyBookingsData: [],
  bookingDetails: { 
    status: '',
    message: '',
    data: [],
  },
  bookingDataSaleBooking: [],
  statisticalTour: [],
  loading: false,
  error: null,
  bookingDataTourBooking: null,
  bookingDatasAll: null,
};


const statisticalSlice = createSlice({
  name: 'statistical',
  initialState,
  reducers: {
    setBookingsData(state, action: PayloadAction<BookingData[]>) {
      state.bookingsData = action.payload;
    },
    setBookingsDatas(state, action: PayloadAction<BookingDatas[]>) {
      state.bookingsDatas = action.payload;
    },
    setBookingsDatasBill(state, action: PayloadAction<BookingDatasBill[]>) {
      state.bookingDatasBill = action.payload;
    },
    setBookingsDatasAll(state, action: PayloadAction<BookingDatasAll>) {
      state.bookingDatasAll = action.payload;
    },
    setMonthlyBookingsData(state, action: PayloadAction<MonthlyBookingData[]>) {
      state.monthlyBookingsData = action.payload;
    },
    setWeeklyBookingsData(state, action: PayloadAction<WeeklyBookingData[]>) {
      state.weeklyBookingsData = action.payload;
    },
    setBookingDataTour(state, action: PayloadAction<BookingDataTour[]>) {
      state.bookingDataTour = action.payload;
    },
    setBookingTour(state, action: PayloadAction<StatisticalTour[]>) {
      state.statisticalTour = action.payload;
    },
    setBookingSaleAgentBooking(state, action: PayloadAction<BookingDataSaleBooking[]>) {
      state.bookingDataSaleBooking = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetStatistics(state) {
      state.bookingsData = [];
      state.monthlyBookingsData = [];
      state.weeklyBookingsData = [];
      state.bookingDataTour = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBookingStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBookingStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getBookingStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi lấy dữ liệu';
      })
      .addCase(getBillStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBillStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getBillStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi lấy dữ liệu';
      })
      .addCase(getStaticalAll.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStaticalAll.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getStaticalAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi lấy dữ liệu';
      })
      .addCase(getTourStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi lấy dữ liệu';
      })
      .addCase(getStatisticalTour.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi lấy dữ liệu';
      })
      .addCase(getSaleStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSaleStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getSaleStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi lấy dữ liệu';
      })
      .addCase(ADDTourBookingStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ADDTourBookingStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingDataTourBooking = action.payload;
      })
      .addCase(ADDTourBookingStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong'; 
      })
      .addCase(getStatisticsDeatilBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStatisticsDeatilBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingDetails = action.payload; 
      })
      .addCase(getStatisticsDeatilBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch booking details';
      })

      .addCase(ADDSaleAgentBookingStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ADDSaleAgentBookingStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingDataSaleBooking = action.payload;
      })
      .addCase(ADDSaleAgentBookingStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  },
});

export const {
  setBookingsData,
  setBookingsDatas,
  setBookingsDatasBill,
  setMonthlyBookingsData,
  setWeeklyBookingsData,
  setBookingDataTour,
  setBookingSaleAgentBooking,
  setBookingsDatasAll,
  setBookingTour,
  setLoading,
  setError,
  resetStatistics,
} = statisticalSlice.actions;

export default statisticalSlice.reducer