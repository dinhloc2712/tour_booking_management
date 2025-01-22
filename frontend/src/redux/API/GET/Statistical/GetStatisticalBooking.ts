import { createAsyncThunk } from '@reduxjs/toolkit';
import { bodyGet, newFetchData } from 'data/FetchApi';
import { setError, setLoading } from 'redux/Reducer/ObjectSliceReducer';
import { setBookingsDatas } from 'redux/Reducer/StatisticalReducer';

export const getBookingStatistics = createAsyncThunk(
  'statistical/getBookingStatistics',
  async (dateRange: { from_date?: string; to_date?: string }, { dispatch }) => {
    // Chuyển from_date và to_date thành query parameters nếu có
    const fromDate = dateRange.from_date ? `from_date=${encodeURIComponent(dateRange.from_date)}` : '';
    const toDate = dateRange.to_date ? `to_date=${encodeURIComponent(dateRange.to_date)}` : '';
    const query = [fromDate, toDate].filter(Boolean).join('&'); // Kết hợp các parameters có giá trị
    const url = `${newFetchData.statisticalBooking}${query ? `?${query}` : ''}`;

    dispatch(setLoading(true));

    try {
      const response = await fetch(url, bodyGet);
      if (!response.ok) {
        throw new Error('Không thể lấy dữ liệu');
      }

      const result = await response.json();

      if (result.status === 'success') {
        const bookingsDatas = result.data.map(item => ({
          date: item.date,
          total_bookings: item.total_bookings,
          total_deposit: item.total_deposit,
          paid_bookings: item.paid_bookings,
          unpaid_bookings: item.unpaid_bookings,
          partial_paid_bookings: item.partial_paid_bookings,
          sale_agent_bookings: item.sale_agent_bookings,
        }));

        // Dispatch dữ liệu bookings
        dispatch(setBookingsDatas(bookingsDatas));
        return bookingsDatas;
      } else {
        dispatch(setError(result.message || 'Lỗi API'));
        throw new Error(result.message || 'Lỗi API');
      }
    } catch (error) {
      dispatch(setError((error as Error).message || 'Đã xảy ra lỗi'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
