import { createAsyncThunk } from '@reduxjs/toolkit';
import { bodyGet, newFetchData } from 'data/FetchApi';
import {  BookingDataTour } from 'redux/Reducer/StatisticalReducer';

export const getTourStatistics = createAsyncThunk<BookingDataTour[]>(
  'statistical/getTourStatistics',
  async () => {
    const response = await fetch(newFetchData.statisticalTour, bodyGet);
    if (!response.ok) {
      throw new Error('Failed to fetch tour statistics');
    }

    const result = await response.json();

    if (result.status === 'success' && Array.isArray(result.data)) {
      return result.data;
    } else {
      throw new Error('Invalid data format from API');
    }
  }
);
