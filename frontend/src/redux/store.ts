import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import modalReducer from "redux/Redux/modal/modalSlice"
import DarkMode from "redux/Redux/DarkMode/DarkMode";
import authLoginReducer from "redux/Reducer/AuthReducer";
import BranchReducer from "./Reducer/BranchReducer";
import TypeBranchReducer from "./Reducer/TypeBranchReducer";
import ServiceReducer from "./Reducer/ServiceReducer";
import TypeServiceReducer from "./Reducer/TypeServiceReducer";
import TourReducer from "./Reducer/TourReducer";
import VoucherReducer from "./Reducer/VoucherReducer";
import SourceReducer from "./Reducer/SourceReducer";
import TypeSourceReducer from "./Reducer/TypeSourceReducer";
import StaffReducer from "./Reducer/StaffReducer";
import TypeVoucherReducer from "./Reducer/TypeVoucherReducer";
import PassportReducer from "./Reducer/PassportReducer";
import SourceReducerAgent from "./Reducer/SourceReducerAgent";
import statisticalSlice from "./Reducer/StatisticalReducer";
import checkinReducer from "./Reducer/CheckinReducer";
import bookingReducer  from "./Reducer/Booking";
import checkInReducer from "./Reducer/CheckinReducer";
import BookingTourReducer from './Reducer/BookingTourReducer';
import checkinUserAllReducer  from "./Reducer/BookingUserdetailReducer";
import billReducer from "./Reducer/BillReducer";
import customerReducer from "./Reducer/CustomerReducer";
import PaymentHistoryReducer from './Reducer/PaymentHistory'
import TypeCustomerReducer from './Reducer/TypeCustomerReducer'
import refundReducerDetails from './Reducer/StatisticalBillsDetail'
import StatisticalServiceReducer from './Reducer/StatisticalServiceReducer'
import PaymentHistoryBookingTour from './Reducer/PaymentHistoryBookingTour'
import ConversationReducer from './Reducer/ConversationReducer'
import changePasswordSlice from './Reducer/ChangePassword'
import SearchReducer from './Reducer/SearchReducer'
import billsReducerDetails from './Reducer/StatisticalBillsDetails'

export const store = configureStore({
    reducer: {
        modal: modalReducer,
        darkMokde: DarkMode,
        auth: authLoginReducer,
        branch: BranchReducer,
        typeBrach: TypeBranchReducer,
        service: ServiceReducer,
        typeService: TypeServiceReducer,
        tour: TourReducer,
        voucher: VoucherReducer,
        source: SourceReducer,
        sourceAgent:SourceReducerAgent,
        typeSource: TypeSourceReducer,
        staff: StaffReducer,
        typeVoucher: TypeVoucherReducer,
        customer: customerReducer,
        refunds: refundReducerDetails,
        bills: billsReducerDetails,

        passport: PassportReducer,
        booking: bookingReducer,


        statistical: statisticalSlice,
        BookingTourReducer: BookingTourReducer,
        StatisticalServiceReducer:StatisticalServiceReducer,

        checkin: checkinReducer,
        checkinAllUser: checkinUserAllReducer,
        bill: billReducer,
        paymentHistory: PaymentHistoryReducer,
        typeBranchAndRole: TypeCustomerReducer,
        PaymentHistoryBookingTour: PaymentHistoryBookingTour,
        ChangePassword: changePasswordSlice,
        ConversationReducer: ConversationReducer,
        SearchReducer: SearchReducer
    }
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()

export default store

