const fetchUrl = `127.0.0.1:8000`


export const bodyGet: any = () => {
  const token = localStorage.getItem('token')

  return {
    method: 'GET',

    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
     },

    mode: 'cors',
    // body: JSON.stringify(body),
  }
}
export const bodyPost: any = (body: any) => {
const token = localStorage.getItem('token')
  
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
    body: JSON.stringify(body),
  }
}

export const bodyPut: any = (body: any) => {
const token = localStorage.getItem('token')

  return {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
     },
    mode: 'cors',
    body: JSON.stringify(body),
  }
}

export const bodyDelete: any = () => {
const token = localStorage.getItem('token')

  return {
    method: 'DELETE',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  }
}

const login = `http://${fetchUrl}/api/login`
const forgetpass = `http://${fetchUrl}/api/auth/login`
const logout = `http://${fetchUrl}/api/logout`

const branches = `http://${fetchUrl}/api/branches`
const branchType = `http://${fetchUrl}/api/branch/create`
const branchID = `http://${fetchUrl}/api/banches/id`

const service = `http://${fetchUrl}/api/services`
const serviceType = `http://${fetchUrl}/api/service/create`
const serviceID = `http://${fetchUrl}/api/services/id`
const tour = `http://${fetchUrl}/api/tours`
const tourID = `http://${fetchUrl}/api/tours/id`

const getServiceTour = `http://${fetchUrl}/api/serviceTour` 
const getServiceTourNew = `http://${fetchUrl}/api/recommended-services2`

const voucher = `http://${fetchUrl}/api/vouchers`
const voucherType = `http://${fetchUrl}/api/voucher/type-voucher`
const voucherID = `http://${fetchUrl}/api/vouchers/id`
const checkVoucher = `http://${fetchUrl}/api/check-voucher-tour`

const saleAgentsh = `http://${fetchUrl}/api/sale-agents`
const saleAgents = `http://${fetchUrl}/api/sale-agents/get-types/service`
const saleAgentsAgent = `http://${fetchUrl}/api/sale-agents/get-types`
const saleAgentsType = `http://${fetchUrl}/api/saleAgent/create`
const saleAgentsID = `http://${fetchUrl}/api/sale-agents/id`

const staff = `http://${fetchUrl}/api/staffs`
const staffroles = `http://${fetchUrl}/api/staff/create`
const staffID = `http://${fetchUrl}/api/staffs/id`


const customer = `http://${fetchUrl}/api/customers`
const customerID = `http://${fetchUrl}/api/staffs/id`

// Post PassPort
const CheckPassport = `http://${fetchUrl}/api/searchPassPort`

// Booking Api
const booking = `http://${fetchUrl}/api/bookings`

// checkin
const checkin = `http://${fetchUrl}/api/checkin`


// getall user checkin

const checkinUserAll = `http://${fetchUrl}/api/bookings/get-one-booking-user`

// bill
const bill = `http://${fetchUrl}/api/bill/create`
const billOK = `http://${fetchUrl}/api/bills`

// history update booking

const historyUpdateBooking = `http://${fetchUrl}/api/staff/action`


// Cancel Booking

const cancelBooking = `http://${fetchUrl}/api/cancel`
const cancelBookingTour = `http://${fetchUrl}/api/booking-tours/cancel`
const cancelBookingTourUser = `http://${fetchUrl}/api/checkin/cancel`




//booking theo ngày
const statistical = `http://${fetchUrl}/api/statistic/bookings-per-day`
//booking theo tuần
const weeklyStatistical = `http://${fetchUrl}/api/statistic/bookings-per-week`
//booking theo tháng
const monthlyStatistical = `http://${fetchUrl}/api/statistic/bookings-per-month`
//booking theo chi tiết
const statisticalDeatilBooking = `http://${fetchUrl}/api/statistic/booking-of-day-details`
//bills theo ngày
const dailyBilling  = `http://${fetchUrl}/api/statistic/total-amount-per-day`
//bills theo tháng
const  monthlyBilling = `http://${fetchUrl}/api/statistic/total-amount-per-month`
//bills theo tuần
const weeklyBilling = `http://${fetchUrl}/api/statistic/total-amount-per-week`
//booking theo ngày số lượng
const statisticalBooking = `http://${fetchUrl}/api/statistic/booking`
//bills tổng
const statisticalBill = `http://${fetchUrl}/api/statistic/total-amount`
//số lượng tour đc booking
const statisticalTour = `http://${fetchUrl}/api/statistic/tour`
const statisticalTourAll = `http://${fetchUrl}/api/statistic/top10BookingTourNew`


const statisticalDeatilBills = `http://${fetchUrl}/api/statistic/refunds`

const statisticalService = `http://${fetchUrl}/api/statistic/debt-agents-service`


const bookingTour = `http://${fetchUrl}/api/booking-tours`
// 
const bookingActivity = `http://${fetchUrl}/api/get-all-statuses`
const getBookingTourAllUsers = `http://${fetchUrl}/api/get-one-booking-tours-all-users`
//số lượng tour đc booking
const statisticalTourBooking = `http://${fetchUrl}/api/statistic/tour-booking-by-month`

const statisticalSaleAgent = `http://${fetchUrl}/api/statistic/sale-agent`

const statisticalBills = `http://${fetchUrl}/api/statistic/bills`

//chat
const conversation = `http://${fetchUrl}/api/conversations`
const message = `http://${fetchUrl}/api/messages`
const statisticalAll = `http://${fetchUrl}/api/statistic/totalStatistical`


export const newFetchData = {
  login,
  forgetpass,
  logout,
  branches,
  branchType,
  branchID,
  service,
  serviceType,
  serviceID,
  tour,
  voucher,
  voucherType,
  voucherID,
  saleAgentsh,
  saleAgents,
  saleAgentsAgent,
  saleAgentsType,
  saleAgentsID,
  staff,
  staffroles,
  staffID,
  customer,
  customerID,


  CheckPassport,
  checkVoucher,
  booking,
  checkin,
  checkinUserAll,

  bill,
  billOK,

  // thống kê booking
  statistical,
  monthlyStatistical,
  weeklyStatistical,
  statisticalDeatilBooking,

  // thống kê bills
  dailyBilling,
  weeklyBilling,
  monthlyBilling,
  statisticalDeatilBills,

  //thống kê chi tiết booking,bills,tour
  statisticalBooking,
  statisticalBill,

  statisticalTour,
  statisticalTourBooking,
  statisticalTourAll,

  statisticalSaleAgent,
  statisticalService,
  statisticalBills,

  bookingTour,
  bookingActivity,
  getBookingTourAllUsers,
  statisticalAll,

  // history update booking
  historyUpdateBooking,

  // cancel booking
  cancelBooking,
  cancelBookingTour,
  cancelBookingTourUser,

  // chat
  message,
  conversation,
  // get service tour

  getServiceTour,
  getServiceTourNew
}

