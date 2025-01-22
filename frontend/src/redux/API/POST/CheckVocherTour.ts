import { createAsyncThunk } from '@reduxjs/toolkit'
import { bodyPost, newFetchData } from 'data/FetchApi'

export const checkVoucherTour = createAsyncThunk(
  'voucher/checkVoucherTour',
  async (
    {
      voucher,
      tour_id,
      user_id,
    }: { voucher: string; tour_id: string; user_id: string },
    { rejectWithValue }
  ) => {
    const dataToSend = {
      code: voucher,
      tour_id,
      user_id,
    }

    try {
      const response = await fetch(
        newFetchData.checkVoucher,
        bodyPost(dataToSend)
      )

      if (response.ok) {
        const result = await response.json()

        if (result.status === 'success') {
          return result.voucher
        } else {
          return rejectWithValue('Failed to check voucher')
        }
      } else if (response.status === 404) {
        const result = await response.json()
        return rejectWithValue(result.message || 'Voucher does not exist')
      } else {
        const result = await response.json()
        return rejectWithValue(result.message || 'API Error')
      }
    } catch (error) {
      return rejectWithValue('Error connecting to the server')
    }
  }
)
