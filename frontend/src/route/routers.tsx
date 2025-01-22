import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Main from 'layout/index/index';
import UpdateBooking from 'layout/UpdateBooking/UpdateBooking';
import PrivateRoute from './PrivateRoute';
import PaymentHistory from 'layout/PaymentHistory/PaymentHistory';
import PaymentHistoryBookingTour from 'layout/PaymentHistoryBookingTour/PaymentHistoryBookingTour';
import HistoryUpdateBookingActive from 'layout/HistoryUpdateBookingActive/HistoryUpdateBookingActive';
import Login from 'layout/login/login';
import ResetPassword from 'layout/ResetPassword/ResetPassword';



const AppContainer: React.FC = () => {
    return (
        <div className='wrapper_container'>
            <Routes>
                <Route element={<PrivateRoute />}>
                </Route>
                <Route path='/' element={<Login />} />
                <Route path="/home" element={<Main />} />
                <Route path="/updatebooking" element={<UpdateBooking />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/payment-history/:id" element={<PaymentHistory />} />
                <Route path="/payment-history-booking-tour/:id" element={<PaymentHistoryBookingTour />} />
                <Route path="/history-update/:id" element={<HistoryUpdateBookingActive />} />
            </Routes>
        </div>
    );
}

export default AppContainer;