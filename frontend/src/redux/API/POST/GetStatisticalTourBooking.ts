// import { createAsyncThunk } from '@reduxjs/toolkit';
// import { bodyGet, newFetchData } from 'data/FetchApi';
// import { BookingDataTourBooking } from 'redux/Reducer/StatisticalReducer';

// export const ADDTourBookingStatistics = createAsyncThunk<BookingDataTourBooking[], 
//   { tour_id: string, branch_id: string, year: string }>(
//   'statistical/getTourBookingStatistics',
//   async ({ tour_id, branch_id , year }) => {
//     try {
//       // Gửi dữ liệu đến API
//       const response = await fetch(newFetchData.statisticalTourBooking, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ tour_id, branch_id, year }),
//       });

//       if (!response.ok) {
//         const errorResponse = await response.text();
//         console.error('Lỗi API:', errorResponse);
//         throw new Error(`API call failed: ${response.status} - ${errorResponse}`);
//       }

//       const data = await response.json();

//       // Kiểm tra xem dữ liệu có đúng cấu trúc không
//       if (data && data.status === "success" && Array.isArray(data.data)) {
//         return data.data; // Trả về dữ liệu từ `data.data` 
//       } else {
//         throw new Error("Dữ liệu không đúng cấu trúc");
//       }
      
//     } catch (error) {
//       console.error('Lỗi khi gọi API:', error);
//       throw new Error(`Error while fetching tour statistics: ${error.message || error}`);
//     }
//   }
// );


import { createAsyncThunk } from '@reduxjs/toolkit';
import { newFetchData } from 'data/FetchApi';
import { BookingDataTourBooking } from 'redux/Reducer/StatisticalReducer';

interface BookingStatisticsResponse {
  status: string;
  message: string;
  data: BookingDataTourBooking[];
  inforTour: any; // Cập nhật với kiểu dữ liệu phù hợp
}

export const ADDTourBookingStatistics = createAsyncThunk<
  BookingStatisticsResponse, // Cập nhật kiểu trả về của createAsyncThunk
  { tour_id: string, branch_id: string, year: string }
>(
  'statistical/getTourBookingStatistics',
  async ({ tour_id, branch_id, year }) => {
    try {
      // Gửi dữ liệu đến API
      const response = await fetch(newFetchData.statisticalTourBooking, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tour_id, branch_id, year }),
      });

      // Kiểm tra mã trạng thái HTTP
      if (!response.ok) {
        const errorResponse = await response.text();
        console.error('Lỗi API:', errorResponse);
        throw new Error(`API call failed: ${response.status} - ${errorResponse}`);
      }

      // Lấy dữ liệu JSON từ API
      const data = await response.json();

      // Kiểm tra xem dữ liệu trả về có đúng cấu trúc không
      if (data && data.status === "success" && Array.isArray(data.data)) {
        return {
          status: data.status,
          message: data.message,
          data: data.data,
          inforTour: data.inforTour, // Trả về thông tin tour
        };
      } else {
        // Thông báo lỗi rõ ràng nếu dữ liệu không đúng
        console.error('Dữ liệu trả về không đúng cấu trúc:', data);
        throw new Error("Dữ liệu không đúng cấu trúc");
      }
      
    } catch (error) {
      // Xử lý lỗi tốt hơn với thông báo rõ ràng
      console.error('Lỗi khi gọi API:', error);
      throw new Error(`Error while fetching tour statistics: ${error.message || error}`);
    }
  }
);

