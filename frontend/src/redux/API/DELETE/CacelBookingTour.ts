import { createAsyncThunk } from "@reduxjs/toolkit";
import { bodyPost, newFetchData } from "data/FetchApi";

// Cập nhật lại logic của CancelBooking để chỉ sử dụng booking_id trong URL và note trong body
export const CancelBookingTour = createAsyncThunk(
  'cancelBookingTour/cancelBookingTour',
  async ({ bookingID, note }: { bookingID: any, note: any }, { rejectWithValue }) => {
    try {
      // Payload chỉ cần chứa booking_id và note
      const payload = {
        note, // Ghi chú lý do hủy
      };

      console.log('payload', payload)
    console.log('bookingID', bookingID)

      // Gửi request với booking_id trong URL
      const response = await fetch(`${newFetchData.cancelBookingTour}/${bookingID}`, bodyPost(payload));

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
