import { createAsyncThunk } from '@reduxjs/toolkit'
import { bodyPost, newFetchData } from 'data/FetchApi'


export const AddBooking = createAsyncThunk(
  'booking/addBooking',
  async (
    { dataToSend }: { dataToSend: any },
    { dispatch, rejectWithValue }
  ) => {
    console.log('log ra dữ liệu', dataToSend)
    try {
      const response = await fetch(newFetchData.booking, bodyPost(dataToSend))

      if (response.ok) {
        console.log('log ra dữ liệu response', response)
        const result = await response.json()
        if (result.status === 'success') {
          console.log('log ra dữ liệu', result.id)
          return result.id
        } else {
          return rejectWithValue('Failed to add booking')
        }
      } else {
        const result = await response.json()
        return rejectWithValue(result.message || 'API Error')
      }
    } catch (error) {
      return rejectWithValue('Error connecting to the server')
    }
  }
)
