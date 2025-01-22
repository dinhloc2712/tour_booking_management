import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { getBooking } from 'redux/API/GET/getBooking/GetBooking'
import { getOneBooking } from 'redux/API/GET/getBooking/getOneBooking'
import { AddBooking } from 'redux/API/POST/Booking'
import { removeService } from './BookingUserdetailReducer'

// Interface cho dịch vụ (Service) trong tour
export interface SelectedService {
  id?: any
  service_id: any
  service_name: any
  service_quantity: any
  service_unit: any
  service_price: any
  total_service_price: any
  service_note?: any
  service_status: any
  time_service_start: any
  time_service_end?: any
  source_service?: any
  // source_service_name?: any
  service_quantity_customer: any
}

// Interface cho một tour
export interface Tour {
  id?: any
  tour_id: any
  tour_name: any
  tour_start_time: any
  tour_end_time: any
  tour_quantity_customers: any
  tour_price: any
  voucher_code: any
  voucher_value: any
  voucher_id: any
  services: SelectedService[] // Mỗi tour có danh sách các dịch vụ đã chọn
  tour_price_min: any
  tour_price_max: any
  total_tour_price: any
  tour_status: any
  note?: any
}

// Interface cho toàn bộ booking
export interface Booking {
  booking_id?: any
  fullname: any
  passport: any
  phone: any
  address: any
  checkin_time: any
  quantity_customer: any
  deposit: any
  status_payment: any
  status_touring: any
  source_id: any
  note?: any
  total_amount: any
  tours: Tour[] // Mỗi booking có thể có nhiều tour
  customers: Customers[]
}

export interface Customers {
  id: any
  Fullname: any
  Passport: any
  Birthday: any
  Phone: any
  Address: any
  Email: any
}

// State của booking slice
interface BookingState {
  currentBooking: Booking | null // Booking hiện tại đang được chọn
  bookingList: Booking[] // Danh sách booking
  detailBooking: Booking | null
  loading: boolean
  error: string | null
  checkInStatus: boolean
}

// Khởi tạo state ban đầu
const initialState: BookingState = {
  currentBooking: {
    booking_id: '',
    fullname: '',
    passport: '',
    phone: '',
    address: '',
    checkin_time: '',
    quantity_customer: 1,
    deposit: 0,
    status_payment: 'unpaid',
    status_touring: 'waiting',
    source_id: '',
    note: '',
    total_amount: 0,
    tours: [], // Khởi tạo danh sách tour rỗng
    customers: [],
  },
  detailBooking: null,
  bookingList: [],
  loading: false,
  error: null,
  checkInStatus: false,
}

// Tạo slice để quản lý booking
const bookingReducer = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    // Cập nhật toàn bộ booking hiện tại
    setCurrentBooking: (state, action: PayloadAction<Booking>) => {
      state.currentBooking = action.payload
    },
    setCheckInStatus: (state, action: PayloadAction<boolean>) => {
      state.checkInStatus = action.payload
    },

    // Cập nhật một trường cụ thể trong booking

    addCustomer: (state, action: PayloadAction<Customers>) => {
      if (state.currentBooking) {
        state.currentBooking.customers.push(action.payload);
      } else {
        console.error('No current booking found to add customer.');
      }
    },

    // Cập nhật thông tin khách hàng trong currentBooking
    updateCustomer: (
      state,
      action: PayloadAction<{ customerIndex: number; fields: Partial<Customers> }>
    ) => {
      if (state.currentBooking) {
        const { customerIndex, fields } = action.payload;
        const selectedCustomer = state.currentBooking.customers[customerIndex];
        if (selectedCustomer) {
          Object.assign(selectedCustomer, fields); // Cập nhật các trường của khách hàng
        } else {
          console.error(`No customer found at index ${customerIndex}.`);
        }
      }
    },
    importCustomers: (state, action: PayloadAction<Customers[]>) => {
      if (state.currentBooking) {
        state.currentBooking.customers = action.payload
      }
    },

    // Xóa khách hàng khỏi currentBooking
    removeCustomer: (state, action: PayloadAction<number>) => {
      if (state.currentBooking) {
        state.currentBooking.customers = state.currentBooking.customers.filter(
          (_, index) => index !== action.payload
        );
      } else {
        console.error('No current booking found to remove customer.');
      }
    },

    // Cập nhật một trường cụ thể trong booking
    updateBookingField: (
      state,
      action: PayloadAction<{ field: keyof Booking; value: any }>
    ) => {
      if (state.currentBooking) {
        state.currentBooking[action.payload.field] = action.payload.value
      } else {
        console.error('No current booking found to update.')
      }
    },

    // Cập nhật một trường trong tour dựa trên tourIndex
    // Reducer để cập nhật nhiều trường trong một tour
    updateTourFields: (
      state,
      action: PayloadAction<{ tourIndex: number; fields: Partial<Tour> }>
    ) => {
      if (state.currentBooking) {
        const { tourIndex, fields } = action.payload
        const selectedTour = state.currentBooking.tours[tourIndex]
        if (selectedTour) {
          Object.assign(selectedTour, fields)
        } else {
          console.error(`No tour found at index ${tourIndex}.`)
        }
      }
    },

    // Reducer xử lý thêm và xóa dịch vụ
    updateServiceField: (
      state,
      action: PayloadAction<{
        tourIndex: number
        serviceIndex: number
        fields: Partial<SelectedService>
      }>
    ) => {
      if (state.currentBooking) {
        const { tourIndex, serviceIndex, fields } = action.payload
        const selectedTour = state.currentBooking.tours[tourIndex]
        if (selectedTour) {
          const selectedService = selectedTour.services[serviceIndex]
          if (selectedService) {
    
            // Cập nhật các trường theo đối tượng fields
            Object.assign(selectedService, fields);
    
           
          } else {
            console.error(
              `No service found at index ${serviceIndex} in tour ${tourIndex}.`
            )
          }
        } else {
          console.error(`No tour found at index ${tourIndex}.`)
        }
      }
    },

    // Thêm action này vào reducers trong bookingReducer
    updateVoucherForTour: (
      state,
      action: PayloadAction<{
        tourIndex: number
        voucher_id: any
        voucher_code: any
        voucher_value: any
      }>
    ) => {
      const { tourIndex, voucher_id, voucher_code, voucher_value } =
        action.payload
      if (state.currentBooking) {
        const selectedTour = state.currentBooking.tours[tourIndex]
        if (selectedTour) {
          selectedTour.voucher_id = voucher_id
          selectedTour.voucher_code = voucher_code
          selectedTour.voucher_value = voucher_value
        } else {
          console.error(`No tour found at index ${tourIndex}.`)
        }
      } else {
        console.error('No current booking found.')
      }
    },

    // Thêm một tour mới vào booking
    addTour: (state, action: PayloadAction<Tour>) => {
      if (state.currentBooking) {
        state.currentBooking.tours.push(action.payload)
      } else {
        console.error('No current booking to add a tour to.')
      }
    },

    // Xóa tour khỏi danh sách
    removeTour: (state, action: PayloadAction<number>) => {
      if (state.currentBooking) {
        state.currentBooking.tours = state.currentBooking.tours.filter(
          (_, index) => index !== action.payload
        )
      } else {
        console.error('No current booking to remove a tour from.')
      }
    },

    addServiceToTour: (
      state,
      action: PayloadAction<{ tourIndex: number; service: SelectedService }>
    ) => {

      if (state.currentBooking) {
        
        const selectedTour = state.currentBooking.tours[action.payload.tourIndex];
        if (selectedTour) {
          // Khởi tạo mảng services nếu chưa có
          if (!selectedTour.services) {
            selectedTour.services = [];
          }
    
          // Kiểm tra nếu dịch vụ đã được thêm vào
          const serviceAlreadyAdded = selectedTour.services.some(
            (service) => service.service_id === action.payload.service.service_id // So sánh service_id đúng
          );
    
          // Nếu chưa có, thêm dịch vụ vào mảng
          if (!serviceAlreadyAdded) {
            selectedTour.services.push(action.payload.service);
            console.log('Added service:', action.payload.service);
          }
        }
      }
    },
    removeServiceFromTour: (
      state,
      action: PayloadAction<{ tourIndex: number; serviceId: number }>
    ) => {
      if (state.currentBooking) {
        const selectedTour = state.currentBooking.tours[action.payload.tourIndex];
    
        if (selectedTour && selectedTour.services) {
          // Loại bỏ dịch vụ khỏi mảng services dựa trên service_id
          selectedTour.services = selectedTour.services.filter(
            (service) => service.service_id !== action.payload.serviceId // So sánh với service_id đúng
          );
        }
      }
    },

    // Xóa toàn bộ booking hiện tại
    clearCurrentBooking: (state) => {
      state.currentBooking = null
    },

    // Lấy danh sách booking
    setBookingList: (state, action: PayloadAction<Booking[]>) => {
      state.bookingList = action.payload
    },
  },
  //Lấy danh sách booking
  extraReducers: (builder) => {
    // Xử lý các trạng thái của getBooking
    builder
      .addCase(getBooking.pending, (state) => {
        state.loading = true
        state.error = null // Xóa lỗi trước đó nếu có
      })
      .addCase(
        getBooking.fulfilled,
        (state, action: PayloadAction<Booking[]>) => {
          state.bookingList = action.payload // Cập nhật danh sách booking
          state.loading = false
        }
      )
      .addCase(getBooking.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load bookings' // Xử lý lỗi
      })
      // Xử lý các trạng thái của getOneBooking (chi tiết một booking)
      .addCase(getOneBooking.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getOneBooking.fulfilled, (state, action: PayloadAction<any>) => {
        const apiData = action.payload
        console.log('apiData', apiData)

        // Chuyển đổi dữ liệu từ `apiData.booking` để phù hợp với cấu trúc `Booking`
        const transformedBooking: Booking = {
          booking_id: apiData.booking.id,
          fullname: apiData.booking.booker?.fullname || '',
          passport: apiData.booking.booker?.user_detail.passport || '',
          phone: apiData.booking.booker?.user_detail.phone || '',
          address: apiData.booking.booker?.user_detail.address || '',
          checkin_time: apiData.booking.checkin_time,
          quantity_customer: apiData.booking.quantity_customer,
          deposit: parseFloat(apiData.booking.deposit) || 0,
          status_payment: apiData.booking.status_payment,
          status_touring: apiData.booking.status_touring,
          source_id: apiData.booking.sale_agent.id,
          note: apiData.booking.note,
          customers: apiData.customers?.map((customer: any) => ({
            id: customer.id,
            Fullname: customer.fullname,
            Passport: customer.user_detail.passport,
            Birthday: customer.user_detail.birthday,
            Phone: customer.user_detail.phone,
            Address: customer.user_detail.address,
            Email: customer.email
          })) || [],
          total_amount: parseFloat(apiData.booking.total_amount) || 0,
          tours: apiData.booking.booking_tours?.map((tour: any) => ({
            id: tour?.id || null,
            tour_id: tour?.tour_id || null,
            tour_name: tour?.name_tour || '',
            tour_start_time: tour?.start_time || null,
            tour_end_time: tour?.end_time || null,
            tour_quantity_customers: tour?.quantity_customer || 0,
            tour_price: parseFloat(tour?.price) || 0,
            voucher_code: tour?.voucher_code || '',
            voucher_value: parseFloat(tour?.voucher_value) || 0,
            voucher_id: tour?.voucher_id || null,
            services: tour?.booking_service_by_tours?.map((service: any) => ({
              id: service?.id || null,
              service_id: service?.service_id || null,
              service_name: service?.name_service || '',
              service_quantity: service?.quantity || 0,
              service_unit: service?.unit || '',
              service_price: parseFloat(service?.price) || 0,
              total_service_price: service?.price && service?.quantity ? Number(service.price * service.quantity) : 0,
              service_note: service?.note || '',
              service_status: service?.status || '',
              time_service_start: service?.start_time || null,
              time_service_end: service?.end_time || null,
              source_service: service?.sale_agent?.id || null,
              service_quantity_customer: service?.quantity_customer || 0
            })) || [],
            tour_price_min: parseFloat(tour.min_price) || 0,
            tour_price_max: parseFloat(tour.price) || 0,
            total_tour_price: parseFloat(tour.total_price) || 0,
            tour_status: tour.status,
            note: tour.note,
          })),
        }

        console.log('transformedBooking', transformedBooking)
        // Cập nhật state `currentBooking` thay vì tạo `detailBooking`
        state.currentBooking = transformedBooking
        state.loading = false
      })
      .addCase(getOneBooking.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load booking details'
      })

      // Xử lý các trạng thái của AddBooking``
      .addCase(AddBooking.fulfilled, (state, action) => {
        if (state.currentBooking) {
          console.log('log ra dữ liệu', action.payload)
          state.currentBooking.booking_id = action.payload
        }
        state.loading = false
      })
      .addCase(AddBooking.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(AddBooking.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to add booking'
      })
  },
})

// Export các action để sử dụng ở các nơi khác
export const {
  setCurrentBooking,
  setCheckInStatus,
  updateBookingField,
  updateTourFields,
  updateServiceField,
  updateVoucherForTour,
  addTour,
  addServiceToTour,
  removeTour,
  removeServiceFromTour,
  clearCurrentBooking,
  setBookingList,
  addCustomer,
  updateCustomer,
  removeCustomer,
  importCustomers,
} = bookingReducer.actions

// Export reducer của slice
export default bookingReducer.reducer
