<?php

namespace App\Traits;

use App\Models\Booking;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Support\Facades\DB;
use App\Http\Responses\BaseResponse;
use App\Models\BookingTourServiceUser;
use Illuminate\Http\Response as HttpResponse;
trait UpdateData
{
    public function updateData($request)
    {
        // return $request["booking"]['booking_tours'][0]['booking_tour_service_users'];

        DB::beginTransaction();
        try {
            $userDetail = UserDetail::where('passport', $request->user_details['passport'])->first();
            if ($userDetail) {
                $userDetail->update($request->user_details);
                $userId = $userDetail->user_id;


                $user = User::find($userId);
                if ($user) {
                    $user->update($request->users);
                }
            }

            $bookingData = $request->input('booking');
            $booking = Booking::find($bookingData['id']);

            if ($booking) {
                $booking->update($bookingData);

                if (isset($bookingData['sale_agent'])) {
                    $booking->saleAgent()->update($bookingData['sale_agent']);
                }

                if (isset($bookingData['staff'])) {
                    $booking->staff()->update($bookingData['staff']);
                }

                // if (isset($bookingData['booker'])) {
                //     $booking->booker()->update($bookingData['booker']);
                // }


                foreach ($bookingData['booking_tours'] as $tourData) {
                    $bookingTour = $booking->bookingTours()->find($tourData['id']);
                    if ($bookingTour) {
                        $bookingTour->update($tourData);

                        foreach ($tourData['booking_service_by_tours'] as $serviceData) {
                            $service = $bookingTour->bookingServices()->find($serviceData['id']);
                            if ($service) {
                                $service->update($serviceData);
                            }
                        }
                        foreach ($tourData['booking_tour_service_users'] as $serviceData) {
                            $bookingTourServicerUser = BookingTourServiceUser::find($serviceData['id']);
                            if ($bookingTourServicerUser) {
                                $bookingTourServicerUser->update($serviceData);
                            }
                            // $service = $bookingTour->bookingServices()->find($serviceData['id']);
                            // if ($service) {
                            //     $service->update($serviceData);
                            // }
                        }

                    }
                }
            }

            // Xác nhận transaction không bị lỗi
            DB::commit();
            return true;
        } catch (\Exception $e) {
            // Rollback transaction nếu có lỗi 
            DB::rollBack();
            return false;
        }

    }
}
