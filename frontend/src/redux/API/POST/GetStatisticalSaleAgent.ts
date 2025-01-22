import { createAsyncThunk } from '@reduxjs/toolkit';
import { bodyGet, newFetchData } from 'data/FetchApi';
import { BookingDataSaleBooking } from 'redux/Reducer/StatisticalReducer';


export const ADDSaleAgentBookingStatistics = createAsyncThunk<BookingDataSaleBooking[], 
  { sale_agent_id: string, year_month: string}>(
  'statistical/getSaleAgentBookingStatistics',
  async ({ sale_agent_id,year_month }) => {
    try {
      // Kiểm tra giá trị tour_id và branch_id trước khi gửi
      console.log('Sending tour_id:', sale_agent_id);
      // console.log('Sending branch_id:', branch_id);

      const response = await fetch(newFetchData.statisticalSaleAgent, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sale_agent_id, year_month }),  // Đảm bảo tour_id là ID chứ không phải tên
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        console.error('Lỗi API:', errorResponse);
        throw new Error(`API call failed: ${response.status} - ${errorResponse}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
      throw new Error(`Error while fetching tour statistics: ${error.message || error}`);
    }
  }
);


