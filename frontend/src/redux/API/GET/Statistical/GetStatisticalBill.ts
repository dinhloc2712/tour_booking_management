import { createAsyncThunk } from '@reduxjs/toolkit';
import { bodyGet, newFetchData } from 'data/FetchApi';
import { setError, setLoading } from 'redux/Reducer/ObjectSliceReducer';
import { setBookingsDatasBill } from 'redux/Reducer/StatisticalReducer';

export const getBillStatistics = createAsyncThunk(
  'statistical/getBillStatistics',
  async (dateRange: { from_date?: string; to_date?: string }, { dispatch }) => {
    // Chuyển from_date và to_date thành query parameters nếu có
    const fromDate = dateRange.from_date ? `from_date=${encodeURIComponent(dateRange.from_date)}` : '';
    const toDate = dateRange.to_date ? `to_date=${encodeURIComponent(dateRange.to_date)}` : '';
    const query = [fromDate, toDate].filter(Boolean).join('&'); // Kết hợp các parameters có giá trị
    const url = `${newFetchData.statisticalBill}${query ? `?${query}` : ''}`;

    dispatch(setLoading(true));

    try {
      const response = await fetch(url, bodyGet);
      if (!response.ok) {
        throw new Error('Không thể lấy dữ liệu');
      }

      const result = await response.json();
      if (result.status === 'success') {
        const bookingsDatasBill = result.data.map(item => ({
          date: item.date,
          total_amount_bill: item.total_amount_bill,
          total_amount_refund: item.total_amount_refund,
          total_amount_deposit: item.total_amount_deposit,
          total_revenue: item.total_revenue,
          count_bill_paid: item.count_bill_paid,
          count_bill_refund: item.count_bill_refund,
          count_booking_deposit: item.count_booking_deposit,
        }));
    // Dispatch dữ liệu bookings
        dispatch(setBookingsDatasBill(bookingsDatasBill));
        return bookingsDatasBill;
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

