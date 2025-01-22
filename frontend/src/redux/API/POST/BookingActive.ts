import { createAsyncThunk } from '@reduxjs/toolkit'
import { bodyPost, newFetchData } from 'data/FetchApi'


export const BookingActivityOk = createAsyncThunk(
  'bookingTour/updateStatus',
  async ({ payload, bookingId }: { payload: any; bookingId: any }, { rejectWithValue }) => {
    console.log('Log payload:', payload);
    console.log('Log bookingId:', bookingId);
    try {
      const response = await fetch(`${newFetchData.checkin}/${bookingId}`, bodyPost(payload));

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          console.log('Log result ID:', result.id);
          return result.id;
        } else {
          return rejectWithValue(result.message || 'Cập nhật thất bại!');
        }
      } else {
        const result = await response.json();
        return rejectWithValue(result.message || 'Lỗi từ server!');
      }
    } catch (error) {
      console.error('Error:', error);
      return rejectWithValue('Lỗi kết nối đến server!');
    }
  }
);
