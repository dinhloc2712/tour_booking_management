<?php

use App\Http\Controllers\API\StatisticController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Đây là nơi bạn có thể đăng ký các route API cho ứng dụng của bạn. Những
| route này sẽ được tải bởi RouteServiceProvider và được nhóm vào middleware
| 'api'. Hãy làm gì đó tuyệt vời!
|
*/

// Định nghĩa các route cho StatisticController
Route::controller(StatisticController::class)->name('statistic.')
    ->prefix('statistic/')
    ->group(function() {
        Route::get('booking', 'statisticBooking')->name('booking');
        Route::get('bookings-per-day', 'statisticBookingsPerDay')->name('bookings-per-day');
        Route::get('bookings-per-month', 'statisticBookingsPerMonth')->name('bookings-per-month');
        Route::get('bookings-per-week', 'statisticBookingsPerWeek')->name('bookings-per-week');
        Route::get('booking-of-day-details', 'statisticBookingOfDayDetails')->name('booking-of-day-details');

        Route::get('total-amount', 'statisticTotalAmount')->name('total-amount');
        Route::get('total-amount-per-day', 'statisticTotalAmountPerDay')->name('total-amount-per-day');
        Route::get('total-amount-per-month', 'statisticTotalAmountPerMonth')->name('total-amount-per-month');
        Route::get('total-amount-per-week', 'statisticTotalAmountPerWeek')->name('total-amount-per-week');

        Route::get('tour', 'statisticTour')->name('tour');
        Route::post('tour-booking-by-month', 'statisticTourBookingByMonth')->name('tour-booking-by-month');

        Route::get('sale-agent', 'statisticSaleAgent')->name('sale-agent');

        //route thống kê hoàn tiền
        Route::get('refunds', 'statisticRefunds')->name('refunds');
        Route::get('bills', 'statisticBills')->name('bills');

        //route thống kê công nợ của đại lý dịch vụ
        Route::get('debt-agents-service', 'statisticDebtAgentService')->name('debt-agents-service');

        Route::get('totalStatistical', 'statisticTotalAll')->name('totalStatistical');

        //router thống kê top 10 tour
        Route::get('top10BookingTourNew', 'statisticTop10New')->name('top10BookingTourNew');

    });

