import { createAsyncThunk } from '@reduxjs/toolkit';
import { newFetchData } from 'data/FetchApi';

export const getStatisticsDeatilBill = createAsyncThunk(
  'statistical/getStatisticsDeatilBill',
  async (day: string) => {
    try {
      // Truyền ngày vào query string
      const response = await fetch(`${newFetchData.statisticalDeatilBills}?day=${day}`, {
      });
      //const response = await fetch(newFetchData.statisticalDeatilBills);

      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      throw error;
    }
  }
);
