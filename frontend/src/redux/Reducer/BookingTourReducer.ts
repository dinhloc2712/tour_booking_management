import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { bodyGet, newFetchData } from 'data/FetchApi'
import { fetchBookingToursWithStatus } from 'redux/API/GET/getBookingActive/GetBookingTour'
import { getBookingActiverALlUser } from 'redux/API/GET/getBookingActive/getBookingAllUser'
import { getBookingActiveUser } from 'redux/API/GET/getBookingActive/getBookingActiveUser'

// Types for bookings, services, users
export interface Tour {
  id: number
  name: string
  price_min: string
  price_max: string
  image: string
}

export interface Service {
  id: number
  name: string
  price: string
  description: string
  is_active: boolean
  type: string
}
export interface BookingServiceUser {
  id: number
  booking_tour_id: number
  service_id: number
  quantity: number
  unit: string
  note: string | null
  start_time: string
  end_time: string
  user_id: number
  price: any
  status: any
  service: Service
  source_service: any
}

export interface User {
  id: number
  fullname: string
  email: string
  passport: string
  phone: string
  address: string
  is_active: boolean
  booking_tour_service_users: BookingServiceUser[]
}

interface BookingActivity {
  id: number
  parent_activity_id: number | null
  booking_tour_id: number
  staff_id: number
  name_staff: string
  customer_ids: number[]
  name: string
  note: string | null
  created_at: string
  updated_at: string
}

export interface BookingTour {
  bookingTour: {
    id: any
    booking_id: any
    tour_id: number
    voucher_id: number | null
    name_tour: any
    quantity_customer: any
    status: any
    start_time: any
    end_time: any
    price: any
    tour: Tour
    booking_activities: BookingActivity[]
    customer_ids: string[]
  }
}


interface BookingTourState {
  bookings: BookingTour[]
  bookingTourDetail: BookingTour | null
  bookingActiveUser: any[]
  users: User[]
  loading: boolean
  status: Record<string, string>
  error: string | null
}

const initialState: BookingTourState = {
  bookings: [],
  bookingTourDetail: null,
  bookingActiveUser: [],
  users: [],
  status: {},
  loading: false,
  error: null,
}

const BookingTourReducer = createSlice({
  name: 'bookingTour',
  initialState,
  reducers: {
    // Clear booking tour state
    clearBookingTourState: (state) => {
        state.bookingTourDetail = null
        state.users = []
    },

    addUserIdActive: (state, action: PayloadAction<any>) => {
        state.bookingActiveUser.push(action.payload)
        console.error('Error!!!')
    },
    removerUserIdActive: (state, action: PayloadAction<any>) => {
        state.bookingActiveUser = state.bookingActiveUser.filter(
            (item) => item !== action.payload
          )
    },
    clearBookingUserActive: (state) => {
        state.bookingActiveUser = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingToursWithStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBookingToursWithStatus.fulfilled, (state, action) => {
        state.loading = false
        state.bookings = action.payload.bookingTours
        state.status = action.payload.status
        console.log('Dữ liệu trả về:', action.payload)
      })
      .addCase(fetchBookingToursWithStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Có lỗi xảy ra'
      })
      // Xử lý getBookingActiverALlUser
      .addCase(getBookingActiverALlUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getBookingActiverALlUser.fulfilled, (state, action) => {
        console.log('Dữ liệu trả về từ API User:', action.payload)
        state.loading = false

        const payload = action.payload

        // Giả sử payload có cấu trúc: { booking_tour: { ..., users: [ ... ] } }
        const usersData = payload.booking_tour?.users ?? []

        const transformedUsers: User[] = usersData.map((u: any) => {
          return {
            id: Number(u.id),
            fullname: u.fullname,
            email: u.email,
            passport: u.user_detail?.passport ?? '',
            phone: u.user_detail?.phone ?? '',
            address: u.user_detail?.address ?? '',
            is_active: Boolean(u.is_active),
            booking_tour_service_users: (
              u.booking_tour_service_users ?? []
            ).map((s: any) => ({
              id: Number(s.id),
              booking_tour_id: Number(s.booking_tour_id),
              service_id: Number(s.service_id),
              quantity: Number(s.quantity),
              unit: s.unit,
              note: s.note,
              start_time: s.start_time,
              end_time: s.end_time,
              user_id: Number(s.user_id),
              price: s.price,
              status: s.status,
              service: {
                id: Number(s.service.id),
                name: s.service.name,
                price: s.service.price,
                description: s.service.description,
                is_active: s.service.is_active,
                type: s.service.type,
              },
            })),
          }
        })
        // console.log('Dữ liệu đã chuyển đổi:', transformedUsers)

        state.users = transformedUsers
      })

      .addCase(getBookingActiverALlUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string // Gán lỗi
      })
      // Xử lý getBookingActiveUser
      .addCase(getBookingActiveUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getBookingActiveUser.fulfilled, (state, action) => {
        state.loading = false
        const payload = action.payload

        const bookingTourData = payload.bookingTour

        const transformedBookingTour: BookingTour['bookingTour'] = {
          id: Number(bookingTourData.id),
          booking_id: bookingTourData.booking_id,
          tour_id: Number(bookingTourData.tour_id),
          voucher_id: bookingTourData.voucher_id
            ? Number(bookingTourData.voucher_id)
            : null,
          name_tour: bookingTourData.name_tour,
          quantity_customer: Number(bookingTourData.quantity_customer),
          status: bookingTourData.status,
          start_time: bookingTourData.start_time,
          end_time: bookingTourData.end_time,
          price: bookingTourData.price,
          tour: {
            id: Number(bookingTourData.tour.id),
            name: bookingTourData.tour.name,
            price_min: bookingTourData.tour.price_min,
            price_max: bookingTourData.tour.price_max,
            image: bookingTourData.tour.image,
          },
          booking_activities: bookingTourData.booking_activities.map(
            (activity: any) => ({
              id: Number(activity.id),
              parent_activity_id: activity.parent_activity_id
                ? Number(activity.parent_activity_id)
                : null,
              booking_tour_id: Number(activity.booking_tour_id),
              staff_id: Number(activity.staff_id),
              name_staff: activity.name_staff,
              customer_ids: activity.customer_ids.map((id: any) => Number(id)),
              name: activity.name,
              note: activity.note,
              created_at: activity.created_at,
              updated_at: activity.updated_at,
            })
          ),
          customer_ids: bookingTourData.customer_ids,
        }
        // console.log('Dữ liệu đã chuyển đổi:', transformedBookingTour)
        state.bookingTourDetail = { bookingTour: transformedBookingTour }
      })
      .addCase(getBookingActiveUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string // Gán lỗi
      })
  },
})

export default BookingTourReducer.reducer

export const { clearBookingTourState, addUserIdActive, removerUserIdActive ,clearBookingUserActive} = BookingTourReducer.actions
