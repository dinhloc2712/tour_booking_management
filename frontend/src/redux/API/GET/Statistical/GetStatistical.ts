import { createAsyncThunk } from '@reduxjs/toolkit';
import { bodyGet, newFetchData } from 'data/FetchApi';
import { setError, setLoading } from 'redux/Reducer/ObjectSliceReducer';
import { setBookingsData, setMonthlyBookingsData } from 'redux/Reducer/StatisticalReducer';

export const getStatistical = createAsyncThunk(
  'statistical/getStatistical',
  async (type: 'daily' | 'weekly' | 'monthly', { dispatch }) => {
    let urlBookings: string;
    let urlBilling: string;

    // Xác định URL dựa trên loại thống kê
    switch (type) {
      case 'daily':
        urlBookings = newFetchData.statistical;
        urlBilling = newFetchData.dailyBilling; // URL cho thống kê billing
        break;
      case 'weekly':
        urlBookings = newFetchData.weeklyStatistical;
        urlBilling = newFetchData.weeklyBilling; // URL cho thống kê billing
        break;
      case 'monthly':
        urlBookings = newFetchData.monthlyStatistical;
        urlBilling = newFetchData.monthlyBilling; // URL cho thống kê billing
        break;
      default:
        throw new Error('Loại thống kê không hợp lệ');
    }

    dispatch(setLoading(true));
    try {
      // Gọi cả hai API
      const [responseBookings, responseBilling] = await Promise.all([
        fetch(urlBookings, bodyGet),
        fetch(urlBilling, bodyGet),
      ]);

      if (!responseBookings.ok || !responseBilling.ok) {
        throw new Error('Không thể lấy dữ liệu');
      }

      const resultBookings = await responseBookings.json();
      const resultBilling = await responseBilling.json();

      if (resultBookings.status === 'success' && resultBilling.status === 'success') {
        let bookingsData: any[] = [];
        let monthlyBookingsData: any[] = [];
        let weeklyBookingsData: any[] = []; // Định nghĩa biến weeklyBookingsData

        // Kiểm tra loại thống kê để lấy dữ liệu tương ứng từ bookings
        switch (type) {
          case 'daily':
            const billingMap = resultBilling.data.reduce((acc, item) => {
              acc[item.date] = item.total_amount; 
              return acc;
            }, {});

            bookingsData = resultBookings.data.map(item => ({
              day: item.day,
              date: item.date,
              total_bookings: item.total_bookings,
              total_amount: billingMap[item.date] || 0
            })) || [];
            break;
          case 'weekly':
            weeklyBookingsData = resultBookings.weeks_in_month || [];
            bookingsData = resultBookings.total_bookings_per_week || [];
            break;
          case 'monthly':
            monthlyBookingsData = resultBookings.bookings_per_month.map(item => ({
              month: item.month,
              total_bookings: item.total_bookings,
              total_amount: resultBilling.amounts_per_month && resultBilling.amounts_per_month[item.month - 1]
                ? resultBilling.amounts_per_month[item.month - 1].total_amount
                : 0 // Kiểm tra trước khi truy cập
            })) || [];
            bookingsData = resultBookings.total_bookings_per_month || [];
            break;
        }

        // Xử lý dữ liệu từ API Billing nếu cần
        const billingData = resultBilling.data; // Giả sử có trường data trong response billing

        // Dispatch dữ liệu bookings cho từng loại thống kê
        dispatch(setBookingsData(bookingsData));

        if (type === 'monthly') {
          dispatch(setMonthlyBookingsData(monthlyBookingsData));
        } else if (type === 'weekly') {
          dispatch(setMonthlyBookingsData(weeklyBookingsData));
        }

        // Trả về dữ liệu để log trong component
        return { bookings: bookingsData, monthlyBookings: monthlyBookingsData, weeklyBookings: weeklyBookingsData, billing: billingData };

      } else {
        dispatch(setError(resultBookings.message || 'Lỗi API'));
        throw new Error(resultBookings.message || 'Lỗi API');
      }
    } catch (error) {
      dispatch(setError((error as Error).message || 'Đã xảy ra lỗi'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
