// redux/API/GET/GetOneBooking.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { newFetchData, bodyGet } from 'data/FetchApi' // Ensure correct path to API
import { setCurrentCheckIn } from 'redux/Reducer/CheckinReducer'

export const getOneBooking = createAsyncThunk(
  'booking/getOneBooking',
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

        console.log('Booking Details:', result)

        if (result.status === 'success') {
          // console.log('Booking Details:', result.data)
          // console.log(result.data.booking.booking_tours)
          // Chuẩn hóa dữ liệu trước khi dispatch vào state của checkin
          const users = Array.isArray(result.data.users)
          ? result.data.users.map((user: any) => ({
              full_name: user.fullname,
              birthday: user.user_detail?.birthday || '',
              passport: user.user_detail?.passport || '',
              address: user.user_detail?.address || '',
              phone: user.user_detail?.phone || '',
              selectedTours: [], // Mặc định rỗng, sẽ được chọn sau
            }))
          : [];

          const booking_tours = Array.isArray(result.data.booking.booking_tours)
            ? result.data.booking.booking_tours.map((tour: any) => ({
                id: tour.id,
                tour_id: tour.tour_id,
                name: tour.name_tour,
                remainingSlots: tour.quantity_customer,
                services: Array.isArray(tour.booking_service_by_tours)
                  ? tour.booking_service_by_tours.map((service: any) => ({
                      id: service.id,
                      service_id: service.service_id,
                      name: service.service_name,
                      quantity: service.quantity,
                      unit: service.unit,
                      type: service.sale_agent?.type || '', // Dùng type mặc định nếu không có
                      price: service.price,
                      sale_agent_id: service.sale_agent_id,
                      // Kiểm tra nếu 'customer_ids' là mảng trước khi lấy chiều dài
                      quantity_customer: Array.isArray(service.customer_ids)
                        ? service.customer_ids.length
                        : 0, // Nếu không phải mảng, trả về 0
                      start_time: service.start_time,
                      end_time: service.end_time,
                      remainingQuantity: service.quantity, // Dữ liệu gốc từ API
                    }))
                  : [], // Nếu không phải mảng, trả về mảng rỗng
                booking_service_by_tours: [], // Mặc định rỗng, người dùng sẽ chọn
              
              }))
            : [] ;

            const checkInServiceForUser = Array.isArray(result.data.booking.booking_tours)
            ? result.data.booking.booking_tours.map(() => ({
                booking_tour_service_users: [], // Gán mảng rỗng cho mỗi tour
              }))
            : []; // Nếu không có dữ liệu trả về từ API, gán mảng rỗng
          
            // console.log('Normalized Booking Data:', users)
            // console.log('Normalized Booking Data:', booking_tours)

          const dataCheckin = { users, booking_tours, checkInServiceForUser }

          // console.log('Normalized Booking Data:', dataCheckin)

          // Cập nhật state của checkin
          dispatch(setCurrentCheckIn(dataCheckin))

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
