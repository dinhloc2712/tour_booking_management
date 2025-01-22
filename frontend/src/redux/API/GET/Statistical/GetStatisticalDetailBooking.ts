import { createAsyncThunk } from '@reduxjs/toolkit';
import { newFetchData } from 'data/FetchApi';

export const getStatisticsDeatilBooking = createAsyncThunk(
  'statistical/getStatisticsDeatilBooking',
  async (date: string) => {
    try {
      // Truyền ngày vào query string
      const response = await fetch(`${newFetchData.statisticalDeatilBooking}?date=${date}`, {
        // method: 'GET', // Sử dụng phương thức GET
        // headers: {
        //   'Content-Type': 'application/json',
        // },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
);
