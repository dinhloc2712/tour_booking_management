<?php

namespace App\Traits;

use App\Http\Responses\BaseResponse;
use App\Models\Booking;
use App\Models\BookingActivity;
use App\Models\BookingTour;

trait BookingActivities
{
    public function bookingActivity($data)
    {
        $bookingActivity = BookingActivity::where('booking_tour_id', $data['booking_tour_id'])->where('name', BookingActivity::NAME_CHECKIN)->latest()->first();

        if ($bookingActivity) {

            if (in_array($data['customer_ids'], $bookingActivity->customer_ids)) {
                // return BaseResponse::error('Khách hàng đã checkin!');
            } else {
                // Lấy giá trị hiện tại của customer_ids
                $currentCustomerIds = $bookingActivity->customer_ids ?? []; // Nếu không tồn tại, khởi tạo là mảng rỗng

                // Thêm phần tử mới vào mảng
                array_push($currentCustomerIds, $data['customer_ids']);

                // Gán lại giá trị cho customer_ids
                $bookingActivity->customer_ids = $currentCustomerIds;
                $bookingActivity->update([
                    'customer_ids' => $currentCustomerIds,
                ]);
            }

        } else {
            BookingActivity::create([
                'booking_tour_id' => $data['booking_tour_id'],
                'staff_id' => $data['staff_id'],
                'name_staff' => $data['name_staff'],
                'customer_ids' => [$data['customer_ids']],
                'name' => BookingActivity::NAME_CHECKIN,
            ]);
        }

        // return $bookingActivity = BookingActivity::findOrFail($bookingActivityId);
    }

    public function bookingActivities($bookingActivityId, $data)
    {
        // nếu $bookingActivityId có giá trị : từ check-in
        if ($bookingActivityId) {
            $bookingActivity = BookingActivity::findOrFail($bookingActivityId);
            BookingActivity::create([
                'parent_activity_id' => $bookingActivity->id,
                'booking_tour_id' => $data['booking_tour_id'],
                'staff_id' => $data['staff_id'],
                'name_staff' => $data['name_staff'],
                'customer_ids' => [$data['customer_ids']],
                'name' => BookingActivity::NAME_CHECKIN,
            ]);

        }
        // nếu $bookingActivityId có không có : booking

        else {
            BookingActivity::create([

                'booking_tour_id' => $data['booking_tour_id'],
                'staff_id' => $data['staff_id'],
                'name_staff' => $data['name_staff'],
                'customer_ids' => [$data['customer_ids']],
                'name' => BookingActivity::NAME_BOOKING,
            ]);
        }
        // return $bookingActivity = BookingActivity::findOrFail($bookingActivityId);
    }

    public function updateName($bookingTourId, $customer_ids, $name)
    {
        $bookingTour = BookingTour::findOrFail($bookingTourId);
        $booking = Booking::find($bookingTour->booking_id);                  
        $bookingActivity = BookingActivity::where('booking_tour_id', $bookingTourId)->latest()->first();
        $customer_ids_error = [];
        foreach ($customer_ids as $customer_id) {
            if (! in_array($customer_id, $bookingTour->customer_ids)) {
                $customer_ids_error[] = $customer_id;
            }
        }

        if ($customer_ids_error) {
            return BaseResponse::error(
                'Khách hàng có id: '.implode(', ', $customer_ids_error).' không có trong tour!'
            );
        } else {
            $bookingActivity = BookingActivity::create([
                'parent_activity_id' => $bookingActivity->id,
                'booking_tour_id' => intval($bookingTourId),
                'staff_id' => $bookingActivity['staff_id'],
                'name_staff' => $bookingActivity['name_staff'],
                'customer_ids' => $customer_ids,
                'name' => $name,
            ]);
            switch ($name) {
                case BookingActivity::NAME_PAID:
                    $bookingTour->update([
                        'status' => BookingTour::STATUS_WAITING,
                    ]);
                    break;
                case BookingActivity::NAME_ON_BUS:
                    $bookingTour->update([
                        'status' => BookingTour::STATUS_IS_MOVING,
                    ]);
                    break;
                case BookingActivity::NAME_ARRIVED:
                    $bookingTour->update([
                        'status' => BookingTour::STATUS_IS_MOVING,
                    ]);
                    break;
                case BookingActivity::NAME_COMPLETE_TOUR:
                    $bookingTour->update([
                        'status' => BookingTour::STATUS_ENDED,
                    ]);
                    break;
                case BookingActivity::NAME_CANCEL:  
                    $bookingTour->update([
                        'status' => BookingTour::STATUS_CANCEL,
                    ]);
                    $check = true;
                    foreach(BookingTour::where('booking_id', $bookingTour->booking_id)->get() as $bookingTour){
                        if($bookingTour->status == BookingTour::STATUS_ENDED || $bookingTour->status == BookingTour::STATUS_CANCEL){
                            $check = true;
                        } else if($bookingTour->status == BookingTour::STATUS_IS_MOVING){
                            $check = false;
                        }
                    }
                    if($check == true){
                        Booking::find($bookingTour->booking_id)->update([
                            'status_touring' => Booking::STATUS_CANCEL,
                        ]);
                    }
                    break;
                default:
                    break;
            }
            return BaseResponse::success($bookingActivity);
        }
    }
}

