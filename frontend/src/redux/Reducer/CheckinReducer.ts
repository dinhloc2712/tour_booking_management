import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { checkInThunk } from 'redux/API/POST/CheckinThunk'

interface CheckInService {
  id: any
  service_id: any
  name: any
  quantity: any
  unit: any
  type: any
  price: any
  sale_agent_id: any
  quantity_customer: any
  start_time: any
  end_time: any
  remainingQuantity: any
}

interface CheckInTour {
  id: any
  tour_id: any
  name: any
  remainingSlots: any
  booking_service_by_tours: CheckInService[]
  services: CheckInService[]
}

export interface CheckInUserDetails {
  full_name: any
  birthday?: any
  passport: any
  address: any
  phone: any
  email: any
  selectedTours: CheckInTour[] 
}

interface CheckInData {
  users: CheckInUserDetails[]
  booking_tours: CheckInTour[]
  checkInServiceForUser: CheckInServiceForUser[]
}

interface CheckInState {
  currentCheckIn: CheckInData
  loading: boolean
  error: string | null
  checkInResult: any | null
}
interface CheckInServiceForUser {
  booking_tour_service_users: CheckInService[]
}

const initialState: CheckInState = {
  currentCheckIn: {
    users: [],
    booking_tours: [],
    checkInServiceForUser: [],
  },
  loading: false,
  error: null,
  checkInResult: null,
}

const checkInReducer = createSlice({
  name: 'checkin',
  initialState,
  reducers: {
    setCurrentCheckIn: (state, action: PayloadAction<CheckInData>) => {
      state.currentCheckIn.users = action.payload.users.map((user, index) => ({
        ...user,
        ...(index !== 0 && {
          full_name: '',
          passport: '',
          address: '',
          phone: '',
        }),
      }))
      state.currentCheckIn.booking_tours = action.payload.booking_tours
    },

    addUserToCheckIn: (state , action: PayloadAction<CheckInUserDetails>) => {
      if (state.currentCheckIn) {
        state.currentCheckIn.users.push(action.payload)
      }
    },

    updateUserField: (
      state,
      action: PayloadAction<{
        userIndex: number
        field: keyof CheckInUserDetails
        value: any
      }>
    ) => {
      const { userIndex, field, value } = action.payload
      state.currentCheckIn.users[userIndex][field] = value
    },

    selectTourForUser: (
      state: CheckInState,
      action: PayloadAction<{ passPort: string; bookingId: number }>
    ) => {
      console.log('log ra dữ liệu action', action.payload)
      const { passPort, bookingId } = action.payload
      const user = state.currentCheckIn?.users.find(
        (user) => user.passport === passPort
      )

      if (user && !user.selectedTours.some((tour) => tour.id === bookingId)) {
        const selectedTour = state.currentCheckIn?.booking_tours.find(
          (tour) => tour.id === bookingId
        )

        if (selectedTour && selectedTour.remainingSlots > 0) {
          selectedTour.remainingSlots -= 1 // Giảm số lượng chỗ trống

          // Không lưu `services` trong `selectedTours` của `user`
          user.selectedTours.push({
            id: selectedTour.id,
            tour_id: selectedTour.tour_id,
            name: selectedTour.name,
            remainingSlots: selectedTour.remainingSlots,
            services: selectedTour.services,
            booking_service_by_tours: [], // Dịch vụ đã chọn ban đầu là rỗng
          })
        }
      }
    },

    selectServiceForTour: (
      state: CheckInState,
      action: PayloadAction<{
        passPort: string
        bookingId: number
        serviceData: {
          service_id: number
          quantity: number
          unit: number
          price: number
          sale_agent_id: number
          quantity_customer: number
          start_time: string
          end_time: string
          remainingQuantity: number
        }
      }>
    ) => {
      const { passPort, bookingId, serviceData } = action.payload
    
      const user = state.currentCheckIn?.users.find(
        (u) => u.passport === passPort
      )
      if (!user) {
        console.warn(`User with passport ${passPort} not found.`)
        return
      }
    
      const tour = user.selectedTours.find((t) => t.id === bookingId)
      if (!tour) {
        console.warn(`Tour with ID ${bookingId} not found for user.`)
        return
      }
    
      const originalTour = state.currentCheckIn.booking_tours.find(
        (t) => t.id === bookingId
      )
      if (!originalTour) {
        console.warn(`Original tour with ID ${bookingId} not found.`)
        return
      }
    
      const selectedService = originalTour.services.find(
        (s) => s.service_id === serviceData.service_id
      )
      if (!selectedService) {
        console.warn(
          `Service ID ${serviceData.service_id} not found in original tour services.`
        )
        return
      }
    
      if (selectedService.remainingQuantity < serviceData.quantity) {
        console.warn(
          `Service ID ${serviceData.service_id} does not have enough quantity.`
        )
        return
      }
    
      const serviceExists = tour.booking_service_by_tours.some(
        (s) => s.service_id === serviceData.service_id
      )
      if (serviceExists) {
        console.warn(
          `Service ID ${serviceData.service_id} already exists in booking_service_by_tours.`
        )
        return
      }
    
      selectedService.remainingQuantity -= serviceData.quantity
    
      tour.booking_service_by_tours.push({
        ...serviceData,
        id: selectedService.id,
        name: selectedService.name,
        unit: selectedService.unit,
        type: selectedService.type,
        price: selectedService.price,
        sale_agent_id: selectedService.sale_agent_id,
        quantity_customer: selectedService.quantity_customer,
        start_time: selectedService.start_time,
        end_time: selectedService.end_time,
        remainingQuantity: selectedService.remainingQuantity,
      })
    
      console.log(
        'Updated booking_service_by_tours:',
        tour.booking_service_by_tours
      )
    },
    

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },

    clearCurrentCheckIn: (state) => {
      state.currentCheckIn = initialState.currentCheckIn
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    // Trong CheckinReducer
    incrementRemainingSlots: (state, action: PayloadAction<number[]>) => {
      const tourIds = action.payload
      state.currentCheckIn.booking_tours =
        state.currentCheckIn.booking_tours.map((tour) => {
          if (tourIds.includes(tour.id)) {
            return {
              ...tour,
              remainingSlots: tour.remainingSlots + 1,
              services: tour.services.map((service) => ({
                ...service,
                remainingQuantity: service.remainingQuantity + 1, // Tăng lại số lượng
              })),
            }
          }
          return tour
        })
    },

    // Thêm dịch vụ vào booking_tour_service_users
    addServiceToBookingTourUsers: (
      state,
      action: PayloadAction<CheckInService>
    ) => {
      console.log('Adding service to booking_tour_service_users:', action.payload);

      if (!state.currentCheckIn.checkInServiceForUser.length) {
        state.currentCheckIn.checkInServiceForUser.push({
          booking_tour_service_users: [],
        });
      }

      state.currentCheckIn.checkInServiceForUser.forEach((serviceUser) => {

        console.log('serviceUser:', serviceUser);
    
        // Push trực tiếp phần tử vào mảng
        serviceUser.booking_tour_service_users.push(action.payload);
    
        // Log trạng thái mảng sau khi thêm
        console.log(
          'Updated booking_tour_service_users:',
          serviceUser.booking_tour_service_users
        );
        
      });
    },

    updateServiceQuantityAndUnit: (
      state,
      action: PayloadAction<{
        serviceId: number;
        quantity: number;
        unit: number;
      }>
    ) => {
      state.currentCheckIn.checkInServiceForUser.forEach((serviceUser) => {
        const serviceToUpdate = serviceUser.booking_tour_service_users.find(
          (service) => service.service_id === action.payload.serviceId
        );

        console.log('serviceToUpdate:', action.payload.serviceId);
        if (serviceToUpdate) {
          console.log('Updating service with new quantity and unit:', action.payload);
          serviceToUpdate.quantity = action.payload.quantity;
          serviceToUpdate.unit = action.payload.unit;
        }
      });
      console.log('Updated service with new quantity and unit:', state.currentCheckIn);
    },
    
    
    removeServiceFromBookingTourUsers: (
      state,
      action: PayloadAction<{ id: string | number }>
    ) => {
      state.currentCheckIn.checkInServiceForUser.forEach((serviceUser) => {
        if (serviceUser.booking_tour_service_users) {
          serviceUser.booking_tour_service_users = serviceUser.booking_tour_service_users.filter(
            (service) => service.id !== action.payload.id
          );
        }
      });
    },
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkInThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkInThunk.fulfilled, (state, action) => {
        state.loading = false
        state.checkInResult = action.payload // Lưu kết quả check-in vào state
      })
      .addCase(checkInThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Check-in failed'
      })
  },
})

export const {
  setCurrentCheckIn,
  addUserToCheckIn,
  updateUserField,
  selectTourForUser,
  selectServiceForTour,
  incrementRemainingSlots,
  clearCurrentCheckIn,
  setLoading,
  setError,
  addServiceToBookingTourUsers,
  removeServiceFromBookingTourUsers,
  updateServiceQuantityAndUnit,
} = checkInReducer.actions

export default checkInReducer.reducer


