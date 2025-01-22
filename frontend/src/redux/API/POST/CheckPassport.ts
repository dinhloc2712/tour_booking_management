import { createAsyncThunk } from '@reduxjs/toolkit'
import { bodyPost, newFetchData } from 'data/FetchApi'
import { Passport } from 'redux/Reducer/PassportReducer'

export const checkPassport = createAsyncThunk<Passport, Passport>(
  'passport/checkPassport',
  async (passport: Passport) => {
    const dataToSend = {
      passport: passport,
    }

    const response = await fetch(
      newFetchData.CheckPassport,
      bodyPost(dataToSend)
    )

    if (response.ok) {
      const result = await response.json()
      if (result.status === 'success') {
        return result.data
      } else {
        throw new Error('Failed to check passport')
      }
    } else if (response.status === 404) {
      throw new Error('Passport does not exist')
    } else {
      throw new Error('API Error')
    }
  }
)
