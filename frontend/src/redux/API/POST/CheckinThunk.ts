import { createAsyncThunk } from '@reduxjs/toolkit';
import { bodyPost, newFetchData } from 'data/FetchApi';


export const checkInThunk = createAsyncThunk(
  'checkin/submit',
  async (data: any, { rejectWithValue }) => {
    try {  
      console.log('Dữ liệu được gửi:', JSON.stringify(data, null, 2));

      const response = await fetch(newFetchData.checkin, bodyPost(data));


      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(
          error.message || 'Có lỗi xảy ra trong quá trình check-in'
        );
      }
      const result = await response.json();

      console.log('Dữ liệu trả về từ API:', result);

      return result;

      
    } catch (error) {
      return rejectWithValue('Lỗi kết nối server');
    }
  }
);
