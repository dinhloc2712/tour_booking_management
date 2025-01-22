<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Responses\BaseResponse;
use App\Models\BookingActivity;
use App\Models\BookingServiceByTour;
use App\Models\BookingTour;
use App\Models\BookingTourServiceUser;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Throwable;

class BookingTourController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->status ?? null;
        $orderBy = $request->order_by ?? null;

        if ($status) {
            $bookingTours = BookingTour::with('tour', 'bookingServices', 'bookingActivities')->where('status', $status)->get();
        } else {
            $bookingTours = BookingTour::with('tour', 'bookingServices', 'bookingActivities')->get();
        }
        $result = [];

        foreach ($bookingTours as $bookingTour) {
            $customerIds = $bookingTour->customer_ids;
            // $bookingActivity = $bookingTour->bookingActivities;

            // if($orderBy) {
            //     $bookingActivity = $bookingActivity->orderBy('created_at', 'desc')
            //     ->first();
            // }

            if (is_array($customerIds) && ! empty($customerIds)) {
                $users = User::whereIn('id', $customerIds)->with(['userDetail'])->get();

                $result[] = [
                    'bookingTour' => $bookingTour,
                    // 'tour_name' => $bookingTour->tour->name ?? null,
                    'users' => $users,
                    // 'bookingActivity' => $bookingActivity,
                ];
            } else {
                $result[] = [
                    'bookingTour' => $bookingTour,
                    // 'tour_name' => $bookingTour->tour->name ?? null,
                    'users' => [],
                    // 'bookingActivity' => $bookingActivity,
                ];
            }
        }

        return BaseResponse::success($result);
    }

    public function store(Request $request)
    {
        //
    }

    public function show(string $id, Request $request)
    {
        if ($request->has('order_by')) {
            $query = BookingTour::with([
                'tour',
                'bookingServices',
                'bookingActivities' => function ($query) {
                    $query->latest('created_at')->take(1);
                },
            ]);
        } else {
            $query = BookingTour::with([
                'tour',
                'bookingServices',
                'bookingActivities',
            ]);
        }

        $bookingTour = $query->where('id', $id)->first();
        if (! $bookingTour) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        $customerIds = $bookingTour->customer_ids;

        if (is_array($customerIds) && ! empty($customerIds)) {
            $users = User::whereIn('id', $customerIds)->get();
            $bookingTour['name_tour'] = $bookingTour->tour->name ?? null;
            $result = [
                'bookingTour' => $bookingTour,
                'users' => $users,
            ];
        } else {
            $bookingTour['name_tour'] = $bookingTour->tour->name ?? null;
            $result = [
                'bookingTour' => $bookingTour,
                'users' => [],
            ];
        }

        return BaseResponse::success($result);
    }

    public function update(Request $request, string $id)
    {
        //
    }

    public function destroy(string $id)
    {
        //
    }
    // danh sách lấy từ booking activity 
    // cập nhật thì kiểm tra xem nó 
    public function getOneBookingTourAllUsers(string $id)
    {
        try {
            $data = [];
            $bookingTour = BookingTour::find($id);
            if (!$bookingTour) {
                return BaseResponse::error('Booking not found');
            }
            $bookingActivities = $bookingTour->bookingActivities()->get();
            $customerIds = $bookingActivities->pluck('customer_ids')->toArray();
            $customerIds = array_merge(...$customerIds); // Gộp các mảng con thành một mảng
            // $customerIds = array_unique($customerIds);  // Lọc các giá trị trùng lặp
            $customerIds = array_values(array_unique($customerIds));

            // return $customerIds;

            $data['booking_tour'] = $bookingTour;

            // if (!empty($bookingTour->customer_ids) && is_array($bookingTour->customer_ids)) {
            $data['booking_tour']['users'] = User::whereIn('id', $customerIds)->get();
            foreach ($data['booking_tour']['users'] as $user) {
                $user['user_detail'] = $user->userDetail;
                $user['booking_tour_service_users'] = $bookingTour->bookingTourServiceUsers;
                foreach ($user['booking_tour_service_users'] as $booking_tour_service_user) {
                    $booking_tour_service_user['service'] = $booking_tour_service_user->service;
                }
            }
            // }else {
            //     return BaseResponse::error('Customer not found');
            // }
            return BaseResponse::success($data);



            // $bookingTourServices = $bookingTour->bookingServiceByTours;
            // foreach ($bookingTourServices as $bookingTourService) {
            //     foreach ($data['users'] as $user) {
            //         // Kiểm tra nếu customer_ids không phải null và là một mảng
            //         if (!empty($bookingTourService->customer_ids) && is_array($bookingTourService->customer_ids)) {
            //             // Kiểm tra nếu ID người dùng nằm trong customer_ids của dịch vụ
            //             if (in_array($user->id, $bookingTourService->customer_ids)) {
            //                 $user['service'] = $bookingTourService->service;
            //             }
            //         }
            //     }
            // }
            //     return BaseResponse::success(
            //         [
            //         // 'bookingTour' => $bookingTour,
            //         'users' => $data['users'] ?? []
            //     ]
            // );

        } catch (\Exception $e) {
            return json_encode([
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
        }
    }


    // public function cancel(Request $request, string $id)
    // {

    //     try {
    //         // cái nào dùng r thì hủy luôn , mình làm
    //         $now = now();
    //         $data = [];
    //         $checkrefund = false;
    //         $bookingTour = BookingTour::find($id);
    //         if (!$bookingTour) {
    //             return BaseResponse::error('No active Booking Tour to cancel', HttpResponse::HTTP_BAD_REQUEST);
    //         }
    //         if($bookingTour->status == BookingTour::STATUS_CANCEL|| $bookingTour->status == BookingTour::STATUS_ENDED  || $bookingTour->end_time < $now){
    //             return BaseResponse::error('Booking Tour has been cancelled', HttpResponse::HTTP_BAD_REQUEST);
    //         }
    //         if($bookingTour->status == BookingTour::STATUS_WAITING){
    //             $data['refund_booking_tour_ids'] = $bookingTour->id;

    //                 $tourServices = BookingServiceByTour::where('booking_tour_id',$bookingTour->id)
    //                     ->whereNotIn('status', [BookingServiceByTour::STATUS_CANCEL, BookingServiceByTour::STATUS_ENDED, BookingServiceByTour::STATUS_WAITING])
    //                     ->where('start_time', '<=', $now)
    //                     ->get();
    //                 foreach ($tourServices as $service) {
    //                     $service->update(['status' => BookingServiceByTour::STATUS_CANCEL]);
    //                 }
    //                 $refundTourServices = BookingServiceByTour::where('booking_tour_id',$bookingTour->id)
    //                     ->whereNotIn('status', [BookingServiceByTour::STATUS_IN_PROGRESS, BookingServiceByTour::STATUS_CANCEL])
    //                     ->orWhere('start_time', '>', $now)
    //                     ->get();
    //                 // $data['refund_booking_service_by_tours_ids'][] = $refundTourServices->pluck('id');
    //                 $data['refund_booking_service_by_tours_ids'] = [];

    //                 foreach ($refundTourServices->pluck('id') as $id) {
    //                     if (! in_array($id, $data['refund_booking_service_by_tours_ids'])) {
    //                         $data['refund_booking_service_by_tours_ids'][] = $id;
    //                     }
    //                 }
    //                 // $data['refund_booking_service_by_tours_ids'][] =$bookingTourServices->pluck('id');

    //                 $refundTourServiceUsers = BookingTourServiceUser::where('booking_tour_id',$bookingTour->id)
    //                     ->whereNotIn('status', [BookingTourServiceUser::STATUS_CANCEL, BookingTourServiceUser::STATUS_ENDED, BookingServiceByTour::STATUS_IN_PROGRESS])
    //                     ->where('start_time', '>', $now)
    //                     ->get();
    //                 if ($refundTourServiceUsers->isNotEmpty()) {
    //                     if(!isset($data['refund_booking_tours_service_users_ids'])){
    //                         $data['refund_booking_tours_service_users_ids'] = [];
    //                     }
    //                     foreach ($refundTourServiceUsers->pluck('id') as $id) {
    //                     if (! in_array($id, $data['refund_booking_tours_service_users_ids'])) {
    //                         $data['refund_booking_tours_service_users_ids'][] = $id;
    //                     }
    //                 }
    //                 }

    //                 BookingTourServiceUser::where('booking_tour_id',$bookingTour->id)
    //                     ->whereNotIn('status', [
    //                         BookingTourServiceUser::STATUS_CANCEL,
    //                         BookingTourServiceUser::STATUS_ENDED,
    //                         BookingServiceByTour::STATUS_WAITING,
    //                     ])
    //                     ->where('end_time', '>', $now)
    //                     ->update(['status' => BookingTourServiceUser::STATUS_CANCEL]);

    //                 $latestActivity =$bookingTour->bookingActivities()->latest()->first();
    //                 if ($latestActivity) {
    //                     BookingActivity::create([
    //                         'parent_activity_id' => $latestActivity ? $latestActivity->id : null,
    //                         'staff_id' => auth()->id(),
    //                         'name_staff' => auth()->user()->fullname,
    //                         'booking_tour_id' =>$bookingTour->id,
    //                         'customer_ids' => $latestActivity ? $latestActivity->customer_ids : '[]',
    //                         'name' => BookingActivity::NAME_CANCEL,
    //                         'note' => $request->note,
    //                     ]);
    //                 }


    //         }else if($bookingTour->status == BookingTour::STATUS_IS_MOVING && $bookingTour->start_time < $now){
    //             $bookingTour->status = BookingTour::STATUS_CANCEL;
    //             $bookingTour->save();

    //             $tourServices = BookingServiceByTour::where('booking_tour_id',$bookingTour->id)
    //                     ->whereNotIn('status', [BookingServiceByTour::STATUS_CANCEL, BookingServiceByTour::STATUS_ENDED, BookingServiceByTour::STATUS_WAITING])
    //                     ->where('start_time', '<=', $now)
    //                     ->get();
    //                 foreach ($tourServices as $service) {
    //                     $service->update(['status' => BookingServiceByTour::STATUS_CANCEL]);
    //                 }

    //                 BookingTourServiceUser::where('booking_tour_id',$bookingTour->id)
    //                 ->whereNotIn('status', [
    //                     BookingTourServiceUser::STATUS_CANCEL,
    //                     BookingTourServiceUser::STATUS_ENDED,
    //                     BookingServiceByTour::STATUS_WAITING,
    //                 ])
    //                 ->where('end_time', '>', $now)
    //                 ->update(['status' => BookingTourServiceUser::STATUS_CANCEL]);

    //             $latestActivity =$bookingTour->bookingActivities()->latest()->first();
    //             if ($latestActivity) {
    //                 BookingActivity::create([
    //                     'parent_activity_id' => $latestActivity ? $latestActivity->id : null,
    //                     'staff_id' => auth()->id(),
    //                     'name_staff' => auth()->user()->fullname,
    //                     'booking_tour_id' =>$bookingTour->id,
    //                     'customer_ids' => $latestActivity ? $latestActivity->customer_ids : '[]',
    //                     'name' => BookingActivity::NAME_CANCEL,
    //                     'note' => $request->note,
    //                 ]);
    //             }
    //             $checkrefund = true;
    //         }






    //         // $bookingTourIds = $validBookingTours->pluck('id');
    //         // // $data['refund_booking_tour_ids'] = $bookingTourIds;
    //         // BookingTour::whereIn('id', $bookingTourIds)->update(['status' => BookingTour::STATUS_CANCEL]);
    //         // foreach ($booking->bookingTours()->get() as $tour) {
    //         //     $tourServices = BookingServiceByTour::where('booking_tour_id', $tour->id)
    //         //         ->whereNotIn('status', [BookingServiceByTour::STATUS_CANCEL, BookingServiceByTour::STATUS_ENDED, BookingServiceByTour::STATUS_WAITING])
    //         //         ->where('start_time', '<=', $now)
    //         //         ->get();
    //         //     foreach ($tourServices as $service) {
    //         //         $service->update(['status' => BookingServiceByTour::STATUS_CANCEL]);
    //         //     }
    //         //     $refundTourServices = BookingServiceByTour::where('booking_tour_id', $tour->id)
    //         //         ->whereNotIn('status', [BookingServiceByTour::STATUS_IN_PROGRESS, BookingServiceByTour::STATUS_CANCEL])
    //         //         ->orWhere('start_time', '>', $now)
    //         //         ->get();
    //         //     // $data['refund_booking_service_by_tours_ids'][] = $refundTourServices->pluck('id');
    //         //     $data['refund_booking_service_by_tours_ids'] = [];

    //         //     foreach ($refundTourServices->pluck('id') as $id) {
    //         //         if (! in_array($id, $data['refund_booking_service_by_tours_ids'])) {
    //         //             $data['refund_booking_service_by_tours_ids'][] = $id;
    //         //         }
    //         //     }
    //         //     // $data['refund_booking_service_by_tours_ids'][] = $tourServices->pluck('id');

    //         //     $refundTourServiceUsers = BookingTourServiceUser::where('booking_tour_id', $tour->id)
    //         //         ->whereNotIn('status', [BookingTourServiceUser::STATUS_CANCEL, BookingTourServiceUser::STATUS_ENDED, BookingServiceByTour::STATUS_IN_PROGRESS])
    //         //         ->where('start_time', '>', $now)
    //         //         ->get();
    //         //     if ($refundTourServiceUsers->isNotEmpty()) {
    //         //         if(!isset($data['refund_booking_tours_service_users_ids'])){
    //         //             $data['refund_booking_tours_service_users_ids'] = [];
    //         //         }
    //         //         foreach ($refundTourServiceUsers->pluck('id') as $id) {
    //         //         if (! in_array($id, $data['refund_booking_tours_service_users_ids'])) {
    //         //             $data['refund_booking_tours_service_users_ids'][] = $id;
    //         //         }
    //         //     }
    //         //     }

    //         //     BookingTourServiceUser::where('booking_tour_id', $tour->id)
    //         //         ->whereNotIn('status', [
    //         //             BookingTourServiceUser::STATUS_CANCEL,
    //         //             BookingTourServiceUser::STATUS_ENDED,
    //         //             BookingServiceByTour::STATUS_WAITING,
    //         //         ])
    //         //         ->where('end_time', '>', $now)
    //         //         ->update(['status' => BookingTourServiceUser::STATUS_CANCEL]);

    //         //     $latestActivity = $tour->bookingActivities()->latest()->first();
    //         //     if ($latestActivity) {
    //         //         BookingActivity::create([
    //         //             'parent_activity_id' => $latestActivity ? $latestActivity->id : null,
    //         //             'staff_id' => auth()->id(),
    //         //             'name_staff' => auth()->user()->fullname,
    //         //             'booking_tour_id' => $tour->id,
    //         //             'customer_ids' => $latestActivity ? $latestActivity->customer_ids : '[]',
    //         //             'name' => BookingActivity::NAME_CANCEL,
    //         //             'note' => $request->note,
    //         //         ]);
    //         //     }

    //         // }
    //         // if ($booking->status_payment == Booking::STATUS_PAYMENT_PAID && $checkrefund == false) {
    //         //     $data['refund_booking'] = [
    //         //         'id' => $booking->id,
    //         //         'deposit' => $booking->deposit,
    //         //         'total_amount' => $booking->total_amount,
    //         //     ];
    //         // } elseif ($checkrefund == true) {
    //         //     $booking->note = $request->note;
    //         //     $booking->status_touring = Booking::STATUS_CANCEL;
    //         //     $booking->save();
    //         // }

    //         return BaseResponse::success($data, 'Booking Tour cancelled successfully');
    //     } catch (Throwable $e) {
    //         return BaseResponse::error(
    //             "Error: {$e->getMessage()} in {$e->getFile()} on line {$e->getLine()}",
    //             HttpResponse::HTTP_INTERNAL_SERVER_ERROR
    //         );
    //     }
    // }

    public function cancel(Request $request, string $id)
    {

        try {
            // cái nào dùng r thì hủy luôn , mình làm
            $now = now();
            $data = [];
            $checkrefund = false;
            $bookingTour = BookingTour::find($id);
            if (!$bookingTour) {
                return BaseResponse::error('No active Booking Tour to cancel', HttpResponse::HTTP_BAD_REQUEST);
            }
            if ($bookingTour->status == BookingTour::STATUS_CANCEL || $bookingTour->status == BookingTour::STATUS_ENDED) {
                return BaseResponse::error('Booking Tour has been cancelled', HttpResponse::HTTP_BAD_REQUEST);
            }

            $bookingTour->status = BookingTour::STATUS_CANCEL;
            $bookingTour->save();

            $tourServices = BookingServiceByTour::where('booking_tour_id', $bookingTour->id)
                ->whereNotIn('status', [BookingServiceByTour::STATUS_CANCEL, BookingServiceByTour::STATUS_ENDED])
                // ->where('start_time', '<=', $now)
                ->get();
            foreach ($tourServices as $service) {
                $service->update(['status' => BookingServiceByTour::STATUS_CANCEL]);
            }

            BookingTourServiceUser::where('booking_tour_id', $bookingTour->id)
                ->whereNotIn('status', [
                    BookingTourServiceUser::STATUS_CANCEL,
                    BookingTourServiceUser::STATUS_ENDED,

                ])
                // ->where('end_time', '>', $now)
                ->update(['status' => BookingTourServiceUser::STATUS_CANCEL]);

            $latestActivity = $bookingTour->bookingActivities()->latest()->first();
            if ($latestActivity) {
                BookingActivity::create([
                    'parent_activity_id' => $latestActivity ? $latestActivity->id : null,
                    'staff_id' => auth()->id(),
                    'name_staff' => auth()->user()->fullname,
                    'booking_tour_id' => $bookingTour->id,
                    'customer_ids' => $latestActivity ? $latestActivity->customer_ids : '[]',
                    'name' => BookingActivity::NAME_CANCEL,
                    'note' => $request->note,
                ]);
            }




            return BaseResponse::success($data, 'Booking Tour cancelled successfully');
        } catch (Throwable $e) {
            return BaseResponse::error(
                "Error: {$e->getMessage()} in {$e->getFile()} on line {$e->getLine()}",
                HttpResponse::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
