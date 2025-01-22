import { createAsyncThunk } from '@reduxjs/toolkit';
import { bodyPut, newFetchData } from 'data/FetchApi'; // bodyPut: phương thức PUT cho cập nhật
import { setCurrentCheckIn } from 'redux/Reducer/CheckinReducer';

// Action update booking theo id
export const updateBooking = createAsyncThunk(
  'booking/updateBooking',
  async (
    { bookingId, dataToSend }: { bookingId: string; dataToSend: any },
    { dispatch, rejectWithValue }
    
  ) => {
    try {
      console.log('log ra dữ liệu updatebooking', dataToSend)
      const response = await fetch(
        `${newFetchData.booking}/${bookingId}`, // Đường dẫn API với bookingId
        bodyPut(dataToSend) // Dữ liệu cần cập nhật
      );

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          const updatedBookingData = result.data.booking;
          console.log('Updated booking data:', updatedBookingData);
          return updatedBookingData.id;
        } else {
          return rejectWithValue('Failed to update booking');
        }
      } else {
        const result = await response.json();
        return rejectWithValue(result.message || 'API Error');
      }
    } catch (error) {
      return rejectWithValue('Error connecting to the server');
    }
  }
);
