// redux/API/GET/GetOneBooking.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { newFetchData, bodyGet } from 'data/FetchApi' // Ensure correct path to API


export const getHistoryUpdateBooking = createAsyncThunk(
  'historyUpdateBooking/getHistoryUpdateBooking',
  async (bookingId: string, { dispatch, rejectWithValue }) => {
    const apibodyGet = bodyGet()
    console.log('Fetching booking details:', bookingId)
    try {
      const response = await fetch(
        `${newFetchData.booking}/${bookingId}`,
        apibodyGet
      )
      if (response.ok) {
        const result = await response.json()

        if (result.status === 'success') {
          return result.data
        } else {
          throw new Error(result.message || 'API Error')
        }
      } else {
        throw new Error('Unable to fetch booking details')
      }
    } catch (error) {
      console.error('Error fetching booking details:', error)
      throw error
    }
  }
)
