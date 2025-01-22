import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyPost, newFetchData } from "data/FetchApi";

export const CancelBookingTourUser = createAsyncThunk(
    'CancelBookingTourUser/CancelBookingTourUser',
    async ({ bookingID, note, customerIds }: { bookingID: any, note: any, customerIds: any[] }, { rejectWithValue }) => {
      try {
        // Payload cần có cả customerIds, booking_id và note
        const payload = {
        booking_id: bookingID, // ID booking
          note, // Lý do hủy
          customer_ids: customerIds, // Danh sách customer_ids
        };
  
        console.log('payload.......', payload);
        console.log('bookingID', bookingID);
  
        const response = await fetch(`${newFetchData.cancelBookingTourUser}/${bookingID}`, bodyPost(payload));
  
        if (response.ok) {
          const result = await response.json();
          if (result.status === "success") {
            return result.data; // return thành công
          } else {
            return rejectWithValue(result.message || 'Lỗi Api');
          }
        } else {
          return rejectWithValue('Không Thể Lấy Dữ Liệu');
        }
      } catch (error) {
        return rejectWithValue(error.message || 'Lỗi kết nối');
      }
    }
  );
  ;
