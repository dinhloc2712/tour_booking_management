import { createAsyncThunk } from '@reduxjs/toolkit';
import { bodyGet, newFetchData } from 'data/FetchApi';
import { setError, setLoading } from 'redux/Reducer/ObjectSliceReducer';
import { setBookingSaleAgentBooking } from 'redux/Reducer/StatisticalReducer';

export const getSaleStatistics = createAsyncThunk(
  'statistical/getSaleStatistics',
  async (dateRange: { sale_agent_id: string; year_month: string }, { dispatch }) => {
    // Kiểm tra giá trị của dateRange
    if (!dateRange.sale_agent_id || !dateRange.year_month) {
      throw new Error('Thông tin thiếu: sale_agent_id hoặc year_month không hợp lệ.');
    }

    // Nếu có dữ liệu hợp lệ, tiếp tục tạo URL
    const saleAgentId = `sale_agent_id=${encodeURIComponent(dateRange.sale_agent_id)}`;
    const yearMonth = `year_month=${encodeURIComponent(dateRange.year_month)}`;

    const query = [saleAgentId, yearMonth].join('&');
    const url = `${newFetchData.statisticalSaleAgent}?${query}`;

    dispatch(setLoading(true));

    try {
      const response = await fetch(url, bodyGet);
      if (!response.ok) {
        throw new Error('Không thể lấy dữ liệu');
      }

      const result: any = await response.json();

      if (result.status === 'success') {
        const bookingDataSaleBooking = result.data.map((item: any) => ({
          date: item.date,
          booking_count: item.booking_count,
          total_deposit: item.total_deposit,
          total_amount: item.total_amount,
          paid_commission: item.paid_commission,
          unpaid_commission: item.unpaid_commission,
        }));
        dispatch(setBookingSaleAgentBooking(bookingDataSaleBooking));
        return bookingDataSaleBooking;
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
