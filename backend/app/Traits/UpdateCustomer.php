<?php

namespace App\Traits;

use App\Http\Responses\BaseResponse;
use App\Models\BookingServiceByTour;
use App\Models\BookingTour;
use App\Models\BookingTourServiceUser;
use App\Models\SaleAgent;
use App\Models\Service;
use App\Models\Tour;

trait UpdateCustomer
{
    public function updateCustomer($request, $customerId)
{
    $bookingTourServicerUserIDs = [];
    
    foreach ($request as $req) {
        $bookingTour = BookingTour::find($req['id']);
        if (!$bookingTour) {
            return BaseResponse::error('Không tìm thấy Booking Tour!');
        }

        $customerIds = $bookingTour->customer_ids ?? [];
        if (!is_array($customerIds)) {
            $customerIds = [];
        }

        if (!in_array($customerId, $customerIds)) {
            $customerIds[] = $customerId;
            sort($customerIds);
            $bookingTour->update(['customer_ids' => $customerIds]);
        }

        foreach ($req['booking_service_by_tours'] as $bookingSer) {
            $bookingServiceByTour = BookingServiceByTour::find($bookingSer['id']);
            if (!$bookingServiceByTour) {
                return BaseResponse::error('Không tìm thấy thông tin Booking Service by Tour!');
            }

            $customerIds = $bookingServiceByTour->customer_ids ?? [];
            if (!is_array($customerIds)) {
                $customerIds = [];
            }

            if (!in_array($customerId, $customerIds)) {
                $customerIds[] = $customerId;
                sort($customerIds);
                $bookingServiceByTour->update(['customer_ids' => $customerIds]);
            }

            $bookingTourServicerUser = BookingTourServiceUser::where('booking_tour_id', $req['id'])
                ->where('service_id', $bookingServiceByTour->service_id)
                ->where('user_id', $customerId)
                ->first();

            if (!$bookingTourServicerUser) {
                $data = [
                    'booking_tour_id' => $req['id'],
                    'service_id' => $bookingServiceByTour->service_id,
                    'quantity' => $bookingSer['quantity'],
                    'start_time' => $bookingSer['start_time'] ?? $bookingServiceByTour->start_time,
                    'end_time' => $bookingSer['end_time'] ?? $bookingServiceByTour->end_time,
                    'unit' => $bookingSer['unit'] ?? 1,
                    'price' => Service::find($bookingServiceByTour->service_id)?->price ?? 0,
                    'note' => $bookingSer['note'] ?? null,
                    'sale_agent_id' => SaleAgent::find($bookingServiceByTour->sale_agent_id)?->id ?? null,
                    'user_id' => $customerId,
                ];
                $bookingTourServiceUser = BookingTourServiceUser::create($data);
                $bookingTourServicerUserIDs[] = $bookingTourServiceUser->id;
            }
        }
    }

    return $bookingTourServicerUserIDs;
}

}
