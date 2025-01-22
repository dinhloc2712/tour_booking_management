// import { createAsyncThunk } from '@reduxjs/toolkit';
// import { bodyGet, newFetchData } from 'data/FetchApi';
// import { setError, setLoading } from 'redux/Reducer/ObjectSliceReducer';
// import { setBookingsDatasAll, setBookingsDatasBill } from 'redux/Reducer/StatisticalReducer';

// export const getStaticalAll = createAsyncThunk(
//   'statical/getStaticalAll',
//   async (_, { dispatch }) => {  // Không cần tham số ngày tháng nữa
//     dispatch(setLoading(true));

//     try {
//       const response = await fetch(newFetchData.statisticalAll, bodyGet);  // Gọi API mà không cần tham số ngày tháng
//       if (!response.ok) {
//         throw new Error('Không thể lấy dữ liệu');
//       }

//       const result = await response.json();
//       if (result.status === 'success') {
//         const bookingDatasAll = result.data.map(item => ({
//           date: item.date,
//           revenue: item.revenue,
//           customer_count: item.customer_count,
//           refund_amount: item.refund_amount,
//           booking_count: item.booking_count,
//           check_in_today: item.check_in_today,
//         }));
//         // Dispatch dữ liệu bookings
//         dispatch(setBookingsDatasAll(bookingDatasAll));
//         return bookingDatasAll;
//       } else {
//         dispatch(setError(result.message || 'Lỗi API'));
//         throw new Error(result.message || 'Lỗi API');
//       }
//     } catch (error) {
//       dispatch(setError((error as Error).message || 'Đã xảy ra lỗi'));
//       throw error;
//     } finally {
//       dispatch(setLoading(false));
//     }
//   }
// );


import { createAsyncThunk } from '@reduxjs/toolkit';
import { bodyGet, newFetchData } from 'data/FetchApi';
import { setError, setLoading } from 'redux/Reducer/ObjectSliceReducer';
import { setBookingsDatasAll, setBookingsDatasBill } from 'redux/Reducer/StatisticalReducer';

export const getStaticalAll = createAsyncThunk(
  'statical/getStaticalAll',
  async (_, { dispatch }) => {  // Không cần tham số ngày tháng nữa
    dispatch(setLoading(true));

    try {
      const response = await fetch(newFetchData.statisticalAll, bodyGet);  // Gọi API mà không cần tham số ngày tháng
      if (!response.ok) {
        throw new Error('Không thể lấy dữ liệu');
      }

      const result = await response.json();
      if (result.status === 'success') {
        // Dispatch dữ liệu bookings dưới dạng JSON
        dispatch(setBookingsDatasAll(result.data));  // Trực tiếp truyền dữ liệu từ API
        return result.data; // Trả về dữ liệu JSON trực tiếp từ API
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
