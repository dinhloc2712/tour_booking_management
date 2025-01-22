import { createAsyncThunk } from "@reduxjs/toolkit";
import { newFetchData } from "data/FetchApi";
import { Tour } from "redux/Reducer/TourReducer";

// Action async thunk để cập nhật tour
export const updateTour = createAsyncThunk(
  'tour/updateTour',
  async ({ id, body }: { id: string; body: Tour }, thunkAPI) => {
    try {
      const response = await fetch(`${newFetchData.tour}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 422) {
          return thunkAPI.rejectWithValue(errorData);
        }
        throw new Error('Something went wrong');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        throw error;
      }
    }
  }
);