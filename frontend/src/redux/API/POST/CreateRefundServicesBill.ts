import { createAsyncThunk } from '@reduxjs/toolkit'
import { bodyPost, newFetchData } from 'data/FetchApi'

export const getRefundServiceBill = createAsyncThunk(
  'bill/getRefundServiceBill',
  async (DatatoSend: any) => {
    console.log('Dữ liệu được gửi:', DatatoSend)

    const response = await fetch(newFetchData.bill, bodyPost(DatatoSend))

    if (response.ok) {
      const result = await response.json()
      console.log('Dữ liệu trả về từ API:', result)
      if (result.status === 'success') {
        return result.data
      } else {
        throw new Error(result.message || 'Lỗi Api')
      }
    } else {
      throw new Error('Không Thể Lấy Dữ Liệu')
    }
  }
)