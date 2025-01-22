import { createAsyncThunk } from '@reduxjs/toolkit'
import { bodyPost, newFetchData } from 'data/FetchApi'

export const getAddServiceBill = createAsyncThunk(
  'bill/getAddServiceBill',
  async (data: any) => {
    console.log('Dữ liệu được gửi:', data)

    const booking_tour_servicer_user_ids = data.booking_tour_servicer_user_ids
    const booking_tour_servicer_user_ids_array = booking_tour_servicer_user_ids.flat();
    console.log('Dữ liệu truyền vào convert:', booking_tour_servicer_user_ids_array)
    const payload = {
      customer_ids: data.user_id, 
      booking_id: data.booking_id, 
      bookingTour_ids: data.booking_tours, 
      bookingTourServiceUser_ids: booking_tour_servicer_user_ids_array,
    }

    const response = await fetch(newFetchData.bill, bodyPost(payload))

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