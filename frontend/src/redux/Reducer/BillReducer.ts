// file: redux/slices/billSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import { clear } from 'console'
import { getBookingBill } from 'redux/API/GET/GetBill'
import { getRefundServiceBill } from 'redux/API/POST/CreateRefundServicesBill'
import { getAddServiceBill } from 'redux/API/POST/CreateBillAddService'

// Khai báo các kiểu dữ liệu chỉ sử dụng cho bill
export interface BillPayload {
  booking_id: any
  customer_id: string
  staff_id: string
  name_staff: any
  voucher_id: null
  code_voucher: null
  value_voucher: null
  quantity_customer: any
  deposit: number
  total_amount: number
  type_bill: string
  bill_tours: {
    tour_id: string
    name_tour: string
    customer_ids: string[]
    quantity_customer: number
    price: number
    note: string | null
  }[]
  bill_services: {
    sale_agent_id: string | null
    tour_id: string
    service_id: string
    name_service: string
    quantity: number
    unit: string
    price: number
    note: string | null
  }[]
  payment: {
    amount: any
    type: any
  }
}
export interface BillRefundServicePayload {
  booking_id: any
  customer_id: any
  staff_id: any
  name_staff: any
  voucher_id: null
  code_voucher: null
  value_voucher: null
  quantity_customer: any
  deposit: number
  total_amount: number
  type_bill: string
  refunds: {
    total_amount: any,
    refund_reason: any,
    refundServices: {
      booking_tour_service_user_id: any
      service_id: any
      name_service: any
      sale_agent_id: any
      quantity: any
      unit: any
      price: any
      refund_reason: any,
    }[]
  }
  payment: {
    amount: any
    type: any
  }
}

export interface BillAddServiceInfo {
  booking_id: any
  customer_id: string
  staff_id: string
  name_staff: any
  voucher_id: null
  code_voucher: null
  value_voucher: null
  quantity_customer: any
  deposit: number
  total_amount: number
  type_bill: string
  bill_services: {
    sale_agent_id: string | null
    tour_id: string
    service_id: string
    name_service: string
    quantity: number
    unit: string
    price: number
    note: string | null
  }[]
  payment: {
    amount: any
    type: any
  }
}

export interface ApiResponse {
  data: any
  status: string
  message?: string
}

interface BillState {
  data: any | null
  refundServiceBillData: any | null
  addServiceBillData: any | null
  loading: boolean
  error: string | null
}

const initialState: BillState = {
  data: null,
  refundServiceBillData: null,
  addServiceBillData: null,
  loading: false,
  error: null,
}

const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    clearBillData(state) {
      state.data = null
      state.refundServiceBillData = null
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBookingBill.pending, (state) => {
        state.loading = true
        state.error = null
        console.log('Đang tải dữ liệu bill...')
      })
      .addCase(getBookingBill.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
        console.log('Dữ liệu đã lưu vào Redux:', state.data) // Xác minh dữ liệu
      })
      .addCase(getBookingBill.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.error.message || 'Đã xảy ra lỗi khi lấy dữ liệu bill'
        console.error('Lỗi khi lấy dữ liệu bill:', state.error)
      })



      //////// Bill Refund ////////
      .addCase(getRefundServiceBill.pending, (state) => {
        state.loading = true
        state.error = null
        console.log('Đang tạo hóa đơn hoàn tiền...')
      })
      .addCase(getRefundServiceBill.fulfilled, (state, action) => {
        state.loading = false
        state.refundServiceBillData = action.payload
        console.log('Dữ liệu đã lưu vào Redux:', state.refundServiceBillData) // Xác minh dữ liệu
      })
      .addCase(getRefundServiceBill.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.error.message || 'Đã xảy ra lỗi khi tạo hóa đơn hoàn tiền'
        console.error('Lỗi khi tạo hóa đơn hoàn tiền:', state.error)
      })

       //////// Bill Refund ////////
       .addCase(getAddServiceBill.pending, (state) => {
        state.loading = true
        state.error = null
        console.log('Đang tạo hóa đơn hoàn tiền...')
      })
      .addCase(getAddServiceBill.fulfilled, (state, action) => {
        state.loading = false
        state.addServiceBillData = action.payload
        console.log('Dữ liệu đã lưu vào Redux:', state.addServiceBillData) // Xác minh dữ liệu
      })
      .addCase(getAddServiceBill.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.error.message || 'Đã xảy ra lỗi khi tạo hóa đơn hoàn tiền'
        console.error('Lỗi khi tạo hóa đơn hoàn tiền:', state.error)
      })
  },
})

export const { clearBillData } = billSlice.actions
export default billSlice.reducer
