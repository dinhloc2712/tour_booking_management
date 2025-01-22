<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Responses\BaseResponse;
use App\Models\Booking;
use App\Models\BookingActivity;
use App\Models\BookingTour;
use App\Traits\BookingActivities;
use Illuminate\Http\Request;

class BookingActivityController extends Controller
{
    use BookingActivities;

    public function getAllStatuses()
    {
        $const = BookingActivity::getConstants();

        return BaseResponse::success($const);
    }

    public function updateActivity(Request $request,string $bookingTourId)
    {
        try{
        $bookingTour = BookingTour::find($bookingTourId);
        if (! $bookingTour) {
            return BaseResponse::error('Booking tour not found', 404);
        }
        $booking = Booking::find($bookingTour->booking_id);
        if(!$booking){
            return BaseResponse::error('Booking not found', 404);
        }
        $bookingActivity = BookingActivity::where('booking_tour_id', $bookingTourId)->latest()->first();
        if(!$bookingActivity){
            return BaseResponse::error('Booking activity not found', 404);
        }
       
        if($request->name == BookingActivity::NAME_COMPLETE_TOUR){
            $bookingTour->status = BookingTour::STATUS_ENDED;
            $bookingTour->save();
        }else if($request->name == BookingActivity::NAME_CANCEL){
            $bookingTour->status = BookingTour::STATUS_CANCEL;
            $bookingTour->save();
        } else if($request->name == BookingActivity::NAME_START_TOUR){
            $bookingTour->status = BookingTour::STATUS_IS_MOVING;
            $bookingTour->save();
        } else if($request->name == BookingActivity::NAME_ARRIVED){
            $bookingTour->status = BookingTour::STATUS_IS_MOVING;
            $bookingTour->save();
        } else if($request->name == BookingActivity::NAME_ON_BUS){
            $bookingTour->status = BookingTour::STATUS_IS_MOVING;
            $bookingTour->save();
        } else if($request->name == BookingActivity::NAME_CHECKIN){
            $booking->status_touring = Booking::STATUS_TOURING_CHECKED_IN;
            $booking->save();
        }

        // Kiểm tra nếu tất cả booking_tour của booking đã hoàn thành (status = BookingTour::STATUS_ENDED;)
        $allDone = $booking->bookingTours->every(function ($tour) {
            // return $tour->status === 'done';
            return $tour->status === BookingTour::STATUS_ENDED;
        });

        // Nếu tất cả các booking_tour đều done, cập nhật trạng thái của booking thành Booking::STATUS_TOURING_CHECKED_OUT
        if ($allDone) {
            // $bookingTour->booking->status = 'done';
            $bookingTour->booking->status_touring = Booking::STATUS_TOURING_CHECKED_OUT;
            $bookingTour->booking->save();
        }

        return $this->updateName($bookingTourId, $request->customer_ids, $request->name);
        }catch(\Exception $e){
            return BaseResponse::error(
                'Error: ' . $e->getMessage().' Line: '.$e->getLine().' File: '.$e->getFile(),500
                
            );
        }
    }

    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
